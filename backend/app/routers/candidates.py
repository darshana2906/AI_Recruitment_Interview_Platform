import os
import shutil
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.models.candidate import CandidateProfile
from app.models.resume import Resume
from app.schemas.candidate import (
    CandidateResponse,
    CandidateUpdate,
    BulkUploadResponse,
    BulkUploadItemResult,
)
from app.schemas.job import SemanticSearchRequest, SemanticSearchResultItem
from app.services.embedding_service import get_embedding, VectorSearchIndex, cosine_similarity
from app.core.dependencies import get_current_active_user
from app.core.rbac import require_admin, require_candidate
from app.services.document_parser import extract_text_from_file
from app.services.llm_parser import parse_resume_text

logger = logging.getLogger("candidates-router")
router = APIRouter(prefix="/candidates", tags=["Candidates & Resume Processing"])

UPLOAD_DIR = os.path.join(os.getcwd(), "uploads", "resumes")
os.makedirs(UPLOAD_DIR, exist_ok=True)


def candidate_to_dict(c: CandidateProfile) -> dict:
    return {
        "id": c.id,
        "user_id": c.user_id,
        "full_name": c.full_name,
        "email": c.email,
        "phone": c.phone,
        "location": c.location,
        "total_experience_years": c.total_experience_years,
        "education_level": c.education_level,
        "skills": c.skills,
        "experience": c.experience_history,
        "education": c.education_history,
        "projects": c.projects,
        "profile_summary": c.profile_summary,
        "created_at": c.created_at,
        "updated_at": c.updated_at,
    }


@router.post("/upload-resume", response_model=CandidateResponse, status_code=status.HTTP_201_CREATED)
async def upload_candidate_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Candidate single resume upload (PDF or DOCX).

    - Extracts text with PyMuPDF / python-docx
    - Parses structured entities using Google Gemini AI / LLM
    - Creates or updates CandidateProfile linked to current user
    - Records resume file details
    """
    filename = file.filename or "uploaded_resume.pdf"
    ext = os.path.splitext(filename.lower())[1]
    if ext not in [".pdf", ".docx"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Only PDF and DOCX files are supported."
        )

    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty."
        )

    # 1. Extract raw text
    try:
        raw_text = extract_text_from_file(filename, file_bytes)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to process document: {str(e)}"
        )

    # 2. Parse structured entities using AI/LLM
    parsed_info = parse_resume_text(raw_text)

    # 3. Save physical file to disk
    user_upload_dir = os.path.join(UPLOAD_DIR, str(current_user.id))
    os.makedirs(user_upload_dir, exist_ok=True)
    stored_path = os.path.join(user_upload_dir, filename)
    with open(stored_path, "wb") as f:
        f.write(file_bytes)

    # 4. Check if profile already exists for this user
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not profile:
        profile = CandidateProfile(
            user_id=current_user.id,
            full_name=parsed_info.get("full_name") or current_user.full_name,
            email=parsed_info.get("email") or current_user.email,
            phone=parsed_info.get("phone", ""),
            location=parsed_info.get("location", ""),
            total_experience_years=float(parsed_info.get("total_experience_years", 0.0)),
            education_level=parsed_info.get("education_level", ""),
            raw_text=raw_text,
            profile_summary=parsed_info.get("profile_summary", "")
        )
        profile.skills = parsed_info.get("skills", [])
        profile.experience_history = parsed_info.get("experience", [])
        profile.education_history = parsed_info.get("education", [])
        profile.projects = parsed_info.get("projects", [])
        db.add(profile)
        db.commit()
        db.refresh(profile)
    else:
        # Update existing profile
        profile.full_name = parsed_info.get("full_name") or profile.full_name
        profile.phone = parsed_info.get("phone") or profile.phone
        profile.location = parsed_info.get("location") or profile.location
        profile.total_experience_years = float(parsed_info.get("total_experience_years", profile.total_experience_years))
        profile.education_level = parsed_info.get("education_level") or profile.education_level
        profile.raw_text = raw_text
        profile.profile_summary = parsed_info.get("profile_summary") or profile.profile_summary
        profile.skills = parsed_info.get("skills", [])
        profile.experience_history = parsed_info.get("experience", [])
        profile.education_history = parsed_info.get("education", [])
        profile.projects = parsed_info.get("projects", [])
        db.commit()
        db.refresh(profile)

    # 5. Record Resume row
    resume_record = Resume(
        candidate_id=profile.id,
        filename=filename,
        file_type=ext.replace(".", ""),
        file_size=len(file_bytes),
        file_path=stored_path,
        parsing_status="Completed",
    )
    db.add(resume_record)
    db.commit()

    return candidate_to_dict(profile)


@router.get("/me", response_model=CandidateResponse)
def get_my_candidate_profile(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Retrieve the candidate profile of the authenticated user."""
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No candidate profile found. Please upload your resume first."
        )
    return candidate_to_dict(profile)


@router.put("/me", response_model=CandidateResponse)
def update_my_candidate_profile(
    update_data: CandidateUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Allow candidate to review and correct their extracted information."""
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not profile:
        # Create profile if not yet created
        profile = CandidateProfile(user_id=current_user.id)
        db.add(profile)

    profile.full_name = update_data.full_name
    profile.email = update_data.email
    profile.phone = update_data.phone
    profile.location = update_data.location
    profile.total_experience_years = update_data.total_experience_years
    profile.education_level = update_data.education_level
    profile.skills = update_data.skills
    profile.experience_history = update_data.experience
    profile.education_history = update_data.education
    profile.projects = update_data.projects
    if update_data.profile_summary:
        profile.profile_summary = update_data.profile_summary

    db.commit()
    db.refresh(profile)
    return candidate_to_dict(profile)


@router.post("/bulk-upload", response_model=BulkUploadResponse)
async def bulk_upload_resumes(
    files: List[UploadFile] = File(...),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin bulk resume upload and processing.

    - Processes resumes individually using AI/LLM.
    - Stores candidate profiles in the database.
    - Identifies duplicate candidates.
    - Displays processing status (Completed, Failed, Duplicate).
    - Handles invalid or corrupted resumes without affecting other uploads.
    """
    total = len(files)
    successful = 0
    failed = 0
    duplicates = 0
    results: List[BulkUploadItemResult] = []

    admin_upload_dir = os.path.join(UPLOAD_DIR, "bulk_admin")
    os.makedirs(admin_upload_dir, exist_ok=True)

    for file in files:
        filename = file.filename or "unknown_resume"
        try:
            file_bytes = await file.read()
            if len(file_bytes) == 0:
                raise ValueError("File is completely empty (0 bytes).")

            # 1. Extract raw text with PyMuPDF or python-docx
            raw_text = extract_text_from_file(filename, file_bytes)

            # 2. Extract structured entities using LLM
            parsed_info = parse_resume_text(raw_text)

            candidate_email = parsed_info.get("email", "").lower().strip()
            candidate_phone = parsed_info.get("phone", "").strip()
            candidate_name = parsed_info.get("full_name", "Unknown Candidate").strip()

            # 3. Identify duplicate candidates (by email match or phone match)
            is_dup = False
            existing_candidate = None
            if candidate_email and candidate_email != "candidate@example.com":
                existing_candidate = db.query(CandidateProfile).filter(CandidateProfile.email == candidate_email).first()
            if not existing_candidate and candidate_phone and candidate_phone != "N/A":
                existing_candidate = db.query(CandidateProfile).filter(CandidateProfile.phone == candidate_phone).first()

            if existing_candidate:
                is_dup = True
                duplicates += 1
                stored_path = os.path.join(admin_upload_dir, f"dup_{filename}")
                with open(stored_path, "wb") as f:
                    f.write(file_bytes)

                resume_record = Resume(
                    candidate_id=existing_candidate.id,
                    filename=filename,
                    file_type=os.path.splitext(filename)[1].replace(".", ""),
                    file_size=len(file_bytes),
                    file_path=stored_path,
                    parsing_status="Completed",
                    is_duplicate=True
                )
                db.add(resume_record)
                db.commit()

                results.append(BulkUploadItemResult(
                    filename=filename,
                    status="Duplicate",
                    candidate_id=existing_candidate.id,
                    candidate_name=existing_candidate.full_name,
                    email=existing_candidate.email,
                    skills=existing_candidate.skills,
                    experience_years=existing_candidate.total_experience_years,
                    error=f"Candidate already exists with email '{existing_candidate.email}'. Marked as duplicate.",
                    is_duplicate=True
                ))
                continue

            # 4. Save new candidate profile
            stored_path = os.path.join(admin_upload_dir, filename)
            with open(stored_path, "wb") as f:
                f.write(file_bytes)

            new_profile = CandidateProfile(
                user_id=None,  # Admin-uploaded candidate (no self-registered account yet)
                full_name=candidate_name,
                email=candidate_email or f"uploaded_{len(results)+1}@recruitment.local",
                phone=candidate_phone,
                location=parsed_info.get("location", ""),
                total_experience_years=float(parsed_info.get("total_experience_years", 0.0)),
                education_level=parsed_info.get("education_level", ""),
                raw_text=raw_text,
                profile_summary=parsed_info.get("profile_summary", "")
            )
            new_profile.skills = parsed_info.get("skills", [])
            new_profile.experience_history = parsed_info.get("experience", [])
            new_profile.education_history = parsed_info.get("education", [])
            new_profile.projects = parsed_info.get("projects", [])

            db.add(new_profile)
            db.commit()
            db.refresh(new_profile)

            resume_record = Resume(
                candidate_id=new_profile.id,
                filename=filename,
                file_type=os.path.splitext(filename)[1].replace(".", ""),
                file_size=len(file_bytes),
                file_path=stored_path,
                parsing_status="Completed",
                is_duplicate=False
            )
            db.add(resume_record)
            db.commit()

            successful += 1
            results.append(BulkUploadItemResult(
                filename=filename,
                status="Completed",
                candidate_id=new_profile.id,
                candidate_name=new_profile.full_name,
                email=new_profile.email,
                skills=new_profile.skills,
                experience_years=new_profile.total_experience_years,
                is_duplicate=False
            ))

        except Exception as e:
            # Handle corrupted or invalid resumes gracefully without failing others
            failed += 1
            logger.error(f"Failed processing file '{filename}': {str(e)}")
            results.append(BulkUploadItemResult(
                filename=filename,
                status="Failed",
                error=str(e),
                is_duplicate=False
            ))

    return BulkUploadResponse(
        total_uploaded=total,
        successful=successful,
        failed=failed,
        duplicates=duplicates,
        results=results
    )


@router.post("/search-semantic", response_model=List[SemanticSearchResultItem])
def search_candidates_semantic(
    search_req: SemanticSearchRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Natural Language Candidate Semantic Search.

    - Embeds free-form natural language query.
    - Searches vector index (FAISS / dense vector cosine similarity).
    - Returns ranked candidate profiles matching the semantic intent.
    (Scenario #6: Admin searches using natural language -> Relevant candidates are retrieved using semantic search)
    """
    candidates = db.query(CandidateProfile).all()
    if not candidates:
        return []

    # 1. Build Vector Search Index
    index = VectorSearchIndex(dim=384)
    for c in candidates:
        text_corpus = f"{c.full_name} {c.education_level} {c.total_experience_years} years {c.profile_summary} {' '.join(c.skills)}"
        emb = get_embedding(text_corpus)
        index.add_candidate(c.id, emb)

    # 2. Embed Query & Search Index
    query_vector = get_embedding(search_req.query)
    top_matches = index.search(query_vector, top_k=search_req.top_k)

    # 3. Format Ranked Results
    cand_dict = {c.id: c for c in candidates}
    results: List[SemanticSearchResultItem] = []

    for cand_id, score in top_matches:
        cand = cand_dict.get(cand_id)
        if cand:
            results.append(SemanticSearchResultItem(
                candidate_id=cand.id,
                candidate_name=cand.full_name,
                email=cand.email,
                similarity_score=round(score, 3),
                similarity_percent=round(score * 100, 1),
                skills=cand.skills,
                experience_years=cand.total_experience_years,
                location=cand.location,
                summary=cand.profile_summary,
            ))

    return results


@router.get("/", response_model=List[CandidateResponse])
def list_candidates(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin-only: Retrieve all registered candidate profiles."""
    candidates = db.query(CandidateProfile).offset(skip).limit(limit).all()
    return [candidate_to_dict(c) for c in candidates]


@router.get("/{candidate_id}", response_model=CandidateResponse)
def get_candidate_by_id(
    candidate_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Retrieve single candidate profile by ID.

    RBAC Protection:
    - Admins and Interviewers can view candidate profiles.
    - Candidates can ONLY view their own candidate profile!
    Attempting to access another candidate's profile returns HTTP 403 Forbidden.
    (Validates Mandatory Test Scenario #12)
    """
    candidate = db.query(CandidateProfile).filter(CandidateProfile.id == candidate_id).first()
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidate with ID #{candidate_id} not found."
        )

    # RBAC Enforcement: Scenario #12
    if current_user.role == UserRole.CANDIDATE.value:
        if candidate.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Candidates are strictly prohibited from viewing other candidates' profiles."
            )

    return candidate_to_dict(candidate)
