import json
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.models.job import Job, Application
from app.models.candidate import CandidateProfile
from app.schemas.job import (
    JobCreate,
    JobUpdate,
    JobResponse,
    JobMatchResponse,
    MatchingResultItem,
    ScoreOverrideRequest,
    InternalNoteRequest,
)
from app.core.dependencies import get_current_active_user
from app.core.rbac import require_admin
from app.services.matching_service import compute_hybrid_matching_score
from app.services.embedding_service import get_embedding

logger = logging.getLogger("jobs-router")
router = APIRouter(prefix="/jobs", tags=["Job Management & AI Candidate Matching"])


def job_to_dict(job: Job) -> dict:
    return {
        "id": job.id,
        "title": job.title,
        "description": job.description,
        "required_skills": job.required_skills,
        "preferred_skills": job.preferred_skills,
        "min_experience": job.min_experience,
        "max_experience": job.max_experience,
        "education_requirement": job.education_requirement,
        "location": job.location,
        "employment_type": job.employment_type,
        "deadline": job.deadline,
        "status": job.status,
        "created_at": job.created_at,
        "updated_at": job.updated_at,
    }


@router.post("/", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(
    job_in: JobCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin creates a new job posting.

    - Stores required details: title, description, skills, experience, education, location, dates, status.
    - Generates and persists dense vector embedding for semantic matching.
    (Scenario #4: Admin creates a job -> Job is saved with all required details)
    """
    job = Job(
        title=job_in.title.strip(),
        description=job_in.description.strip(),
        min_experience=job_in.min_experience,
        max_experience=job_in.max_experience,
        education_requirement=job_in.education_requirement.strip(),
        location=job_in.location.strip(),
        employment_type=job_in.employment_type.strip(),
        deadline=job_in.deadline,
        status=job_in.status.strip() or "Active",
    )
    job.required_skills = job_in.required_skills
    job.preferred_skills = job_in.preferred_skills

    # Generate job semantic embedding
    job_text = f"{job.title} {job.description} {' '.join(job.required_skills)}"
    job.embedding = get_embedding(job_text)

    db.add(job)
    db.commit()
    db.refresh(job)

    return job_to_dict(job)


@router.get("/", response_model=List[JobResponse])
def list_jobs(
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Retrieve job postings with optional status and text search filtering."""
    query = db.query(Job)
    if status_filter:
        query = query.filter(Job.status == status_filter)
    if search:
        search_pattern = f"%{search.lower()}%"
        query = query.filter(Job.title.ilike(search_pattern) | Job.description.ilike(search_pattern))

    jobs = query.order_by(Job.created_at.desc()).offset(skip).limit(limit).all()
    return [job_to_dict(j) for j in jobs]


@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    """Retrieve a single job posting by ID."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job posting #{job_id} not found."
        )
    return job_to_dict(job)


@router.put("/{job_id}", response_model=JobResponse)
def update_job(
    job_id: int,
    job_update: JobUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin updates an existing job posting."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job posting #{job_id} not found."
        )

    if job_update.title is not None:
        job.title = job_update.title.strip()
    if job_update.description is not None:
        job.description = job_update.description.strip()
    if job_update.required_skills is not None:
        job.required_skills = job_update.required_skills
    if job_update.preferred_skills is not None:
        job.preferred_skills = job_update.preferred_skills
    if job_update.min_experience is not None:
        job.min_experience = job_update.min_experience
    if job_update.max_experience is not None:
        job.max_experience = job_update.max_experience
    if job_update.education_requirement is not None:
        job.education_requirement = job_update.education_requirement.strip()
    if job_update.location is not None:
        job.location = job_update.location.strip()
    if job_update.employment_type is not None:
        job.employment_type = job_update.employment_type.strip()
    if job_update.deadline is not None:
        job.deadline = job_update.deadline
    if job_update.status is not None:
        job.status = job_update.status.strip()

    # Re-compute embedding if core fields modified
    job_text = f"{job.title} {job.description} {' '.join(job.required_skills)}"
    job.embedding = get_embedding(job_text)

    db.commit()
    db.refresh(job)
    return job_to_dict(job)


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(
    job_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin deletes a job posting."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job posting #{job_id} not found."
        )
    db.delete(job)
    db.commit()
    return None


@router.post("/{job_id}/match", response_model=JobMatchResponse)
def match_candidates_for_job(
    job_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """AI-Based Candidate Matching Engine.

    - Evaluates all candidate profiles against the selected job.
    - Computes 5-factor hybrid matching score (0-100).
    - Stores results in Application model.
    - Returns ranked candidate list in descending order of score.
    (Scenario #5: Admin selects a job for matching -> Suitable candidates are ranked with scores)
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job posting #{job_id} not found."
        )

    candidates = db.query(CandidateProfile).all()
    matches: List[MatchingResultItem] = []

    for cand in candidates:
        # Check if Application row exists or create one
        app = db.query(Application).filter(
            Application.candidate_id == cand.id,
            Application.job_id == job.id
        ).first()

        # Compute 5-factor hybrid matching score
        match_data = compute_hybrid_matching_score(
            candidate=cand,
            job=job,
            job_embedding=job.embedding
        )

        overall_score = match_data["overall_score"]

        if not app:
            app = Application(
                candidate_id=cand.id,
                job_id=job.id,
                status="Applied",
                ai_match_score=overall_score,
                experience_comparison=match_data["experience_comparison"],
                ai_recommendation_reason=match_data["recommendation_reason"]
            )
            app.matched_skills = match_data["matched_skills"]
            app.missing_skills = match_data["missing_skills"]
            db.add(app)
            db.commit()
            db.refresh(app)
        else:
            app.ai_match_score = overall_score
            app.experience_comparison = match_data["experience_comparison"]
            app.ai_recommendation_reason = match_data["recommendation_reason"]
            app.matched_skills = match_data["matched_skills"]
            app.missing_skills = match_data["missing_skills"]
            db.commit()
            db.refresh(app)

        effective_score = app.final_score

        matches.append(MatchingResultItem(
            candidate_id=cand.id,
            candidate_name=cand.full_name,
            email=cand.email,
            phone=cand.phone,
            location=cand.location,
            total_experience_years=cand.total_experience_years,
            overall_score=effective_score,
            score_breakdown=match_data["score_breakdown"],
            matched_skills=match_data["matched_skills"],
            missing_skills=match_data["missing_skills"],
            matched_preferred_skills=match_data["matched_preferred_skills"],
            experience_comparison=match_data["experience_comparison"],
            recommendation_reason=match_data["recommendation_reason"],
            application_id=app.id,
            status=app.status,
            human_override_score=app.human_override_score,
            human_override_reason=app.human_override_reason,
            internal_notes=app.internal_notes,
        ))

    # Rank candidates by descending score
    matches.sort(key=lambda m: m.overall_score, reverse=True)

    return JobMatchResponse(
        job_id=job.id,
        job_title=job.title,
        total_candidates_evaluated=len(candidates),
        matches=matches
    )
