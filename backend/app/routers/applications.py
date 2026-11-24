import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.models.job import Job, Application
from app.models.candidate import CandidateProfile
from app.schemas.job import ScoreOverrideRequest, InternalNoteRequest, MatchingResultItem
from app.core.dependencies import get_current_active_user
from app.core.rbac import require_admin

logger = logging.getLogger("applications-router")
router = APIRouter(prefix="/applications", tags=["Candidate Applications, Shortlisting & Overrides"])


@router.post("/{app_id}/shortlist", status_code=status.HTTP_200_OK)
def shortlist_candidate(
    app_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin shortlists a candidate for the specified job.

    Updates application status to 'Shortlisted'.
    (Scenario #8: Admin shortlists candidates -> Candidates are added to the job-specific shortlist)
    """
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application #{app_id} not found."
        )

    app.status = "Shortlisted"
    db.commit()
    db.refresh(app)

    return {
        "message": f"Candidate #{app.candidate_id} has been successfully added to the shortlist for job '{app.job.title}'.",
        "application_id": app.id,
        "status": app.status
    }


@router.post("/{app_id}/override", status_code=status.HTTP_200_OK)
def override_ai_score(
    app_id: int,
    override_req: ScoreOverrideRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Human-in-the-Loop: Admin overrides the AI matching score.

    Allows human recruiters to adjust candidate scores and document their rationale.
    """
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application #{app_id} not found."
        )

    app.human_override_score = override_req.override_score
    app.human_override_reason = override_req.override_reason.strip()
    db.commit()
    db.refresh(app)

    return {
        "message": "AI recommendation successfully overridden by human recruiter.",
        "application_id": app.id,
        "original_ai_score": app.ai_match_score,
        "effective_score": app.final_score,
        "override_reason": app.human_override_reason
    }


@router.post("/{app_id}/notes", status_code=status.HTTP_200_OK)
@router.post("/{app_id}/note", status_code=status.HTTP_200_OK)
def add_internal_note(
    app_id: int,
    note_req: InternalNoteRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin adds or updates internal recruitment notes for a candidate application."""
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application #{app_id} not found."
        )

    existing_note = app.internal_notes or ""
    if existing_note:
        app.internal_notes = f"{existing_note}\n---\n{note_req.note.strip()}"
    else:
        app.internal_notes = note_req.note.strip()

    db.commit()
    db.refresh(app)

    return {
        "message": "Internal note appended successfully.",
        "application_id": app.id,
        "internal_notes": app.internal_notes
    }


@router.post("/apply/{job_id}", status_code=status.HTTP_201_CREATED)
def apply_to_job(
    job_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Candidate applies to a job using their verified profile."""
    cand_profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not cand_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please upload and verify your resume before applying for positions."
        )

    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job #{job_id} not found."
        )

    existing = db.query(Application).filter(
        Application.job_id == job_id,
        Application.candidate_id == cand_profile.id
    ).first()

    if existing:
        return {
            "message": "You have already applied to this position.",
            "application_id": existing.id,
            "status": existing.status
        }

    from app.services.matching_service import compute_hybrid_matching_score
    match_result = compute_hybrid_matching_score(
        candidate=cand_profile,
        job=job,
        candidate_embedding=cand_profile.embedding,
        job_embedding=job.embedding
    )

    new_app = Application(
        job_id=job.id,
        candidate_id=cand_profile.id,
        ai_match_score=match_result["overall_score"],
        score_breakdown=match_result["score_breakdown"],
        matched_skills=match_result["matched_skills"],
        missing_skills=match_result["missing_skills"],
        recommendation_reason=match_result["recommendation_reason"],
        status="Applied"
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)

    return {
        "message": f"Successfully applied to {job.title}!",
        "application_id": new_app.id,
        "status": new_app.status,
        "ai_match_score": new_app.ai_match_score
    }


@router.get("/my-applications", response_model=List[dict])
def get_my_applications(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Candidate views their current job applications."""
    cand_profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not cand_profile:
        return []

    apps = db.query(Application).filter(Application.candidate_id == cand_profile.id).all()
    results = []
    for a in apps:
        results.append({
            "id": a.id,
            "job_id": a.job_id,
            "job_title": a.job.title if a.job else "Unknown Job",
            "job_location": a.job.location if a.job else "N/A",
            "status": a.status,
            "applied_at": a.created_at.isoformat() if a.created_at else None,
            "matched_skills": a.matched_skills or [],
            "missing_skills": a.missing_skills or []
        })
    return results


@router.get("/job/{job_id}/shortlist", response_model=List[dict])
def get_job_shortlist(
    job_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin retrieves all shortlisted candidates for a job."""
    apps = db.query(Application).filter(
        Application.job_id == job_id,
        Application.status.in_(["Shortlisted", "Approved", "Interview Scheduled"])
    ).all()

    results = []
    for app in apps:
        cand = app.candidate
        results.append({
            "application_id": app.id,
            "candidate_id": cand.id,
            "candidate_name": cand.full_name,
            "email": cand.email,
            "phone": cand.phone,
            "location": cand.location,
            "total_experience_years": cand.total_experience_years,
            "status": app.status,
            "final_score": app.final_score,
            "matched_skills": app.matched_skills,
            "missing_skills": app.missing_skills,
            "internal_notes": app.internal_notes
        })

    return results
