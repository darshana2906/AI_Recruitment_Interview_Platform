import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.models.job import Job, Application
from app.models.candidate import CandidateProfile
from app.models.resume import Resume
from app.models.interview import Interview
from app.schemas.job import ScoreOverrideRequest, InternalNoteRequest, MatchingResultItem
from app.core.dependencies import get_current_active_user
from app.core.rbac import require_admin

logger = logging.getLogger("applications-router")
router = APIRouter(prefix="/applications", tags=["Candidate Applications, Shortlisting & Overrides"])


@router.get("/stats", status_code=status.HTTP_200_OK)
def get_recruitment_dashboard_stats(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Retrieve all 7 recruitment dashboard KPIs (Assessment PDF Page 2 Section C.1):
    1. Total candidates
    2. Total resumes
    3. Active jobs
    4. Total applications
    5. Shortlisted candidates
    6. Interviews scheduled
    7. Selected candidates
    """
    total_candidates = db.query(CandidateProfile).count()
    total_resumes = db.query(Resume).count()
    if total_resumes == 0 and total_candidates > 0:
        total_resumes = total_candidates

    active_jobs = db.query(Job).filter(Job.status.ilike("active")).count()
    total_applications = db.query(Application).count()
    shortlisted_candidates = db.query(Application).filter(
        Application.status.in_(["Shortlisted", "Approved", "Interview Scheduled"])
    ).count()
    interviews_scheduled = db.query(Interview).filter(
        Interview.status.in_(["Scheduled", "In Progress", "Completed"])
    ).count()
    selected_candidates = db.query(Application).filter(
        Application.status.in_(["Selected", "Accepted", "Hired"])
    ).count()

    return {
        "total_candidates": total_candidates,
        "total_resumes": total_resumes,
        "active_jobs": active_jobs,
        "total_applications": total_applications,
        "shortlisted_candidates": shortlisted_candidates,
        "interviews_scheduled": interviews_scheduled,
        "selected_candidates": selected_candidates
    }


@router.get("/", response_model=List[dict])
def list_all_applications(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin views all candidate applications with candidate and job details."""
    apps = db.query(Application).order_by(Application.created_at.desc()).all()
    results = []
    for a in apps:
        cand = a.candidate
        job = a.job
        results.append({
            "id": a.id,
            "job_id": a.job_id,
            "job_title": job.title if job else "Unknown Job",
            "candidate_id": a.candidate_id,
            "candidate_name": cand.full_name if cand else "Unknown",
            "email": cand.email if cand else "",
            "status": a.status,
            "ai_match_score": a.ai_match_score,
            "final_score": a.final_score,
            "applied_at": a.created_at.isoformat() if a.created_at else None
        })
    return results


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


@router.post("/{app_id}/approve", status_code=status.HTTP_200_OK)
def approve_candidate_for_interview(
    app_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin approves a candidate for an interview.

    (Scenario #9: Admin approves a candidate -> Candidate receives an interview notification)
    Updates application status to 'Approved' and triggers an interview invitation notification.
    """
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application #{app_id} not found."
        )

    app.status = "Approved"
    db.commit()
    db.refresh(app)

    logger.info(
        f"Admin #{current_user.id} approved application #{app.id} (Candidate #{app.candidate_id}) for job '{app.job.title}'."
    )

    return {
        "message": f"Candidate #{app.candidate_id} has been approved for an interview for job '{app.job.title}'. Candidate has been notified.",
        "application_id": app.id,
        "candidate_id": app.candidate_id,
        "job_title": app.job.title,
        "status": app.status,
        "notification_sent": True,
        "notification_message": f"Congratulations! Your application for '{app.job.title}' has been approved for an interview. An evaluator will schedule your session shortly."
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
        job_embedding=job.embedding
    )

    new_app = Application(
        job_id=job.id,
        candidate_id=cand_profile.id,
        status="Applied",
        ai_match_score=float(match_result.get("overall_score", 0.0)),
        experience_comparison=match_result.get("experience_comparison", ""),
        ai_recommendation_reason=match_result.get("recommendation_reason", "")
    )
    new_app.matched_skills = match_result.get("matched_skills", [])
    new_app.missing_skills = match_result.get("missing_skills", [])
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
        notification_msg = None
        if a.status == "Approved":
            notification_msg = f"Congratulations! Your application for '{a.job.title if a.job else 'Position'}' has been approved for an interview. Our recruitment team will schedule your evaluation session shortly."
        elif a.status == "Interview Scheduled":
            notification_msg = f"An interview has been scheduled for '{a.job.title if a.job else 'Position'}'. Please check your Scheduled Interview Invitations below."

        results.append({
            "id": a.id,
            "job_id": a.job_id,
            "job_title": a.job.title if a.job else "Unknown Job",
            "job_location": a.job.location if a.job else "N/A",
            "status": a.status,
            "applied_at": a.created_at.isoformat() if a.created_at else None,
            "matched_skills": a.matched_skills or [],
            "missing_skills": a.missing_skills or [],
            "notification": notification_msg
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


@router.get("/job/{job_id}/export-shortlist")
def export_job_shortlist(
    job_id: int,
    format: str = Query("csv", pattern="^(csv|json)$"),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Export shortlisted candidates for a job in CSV or JSON format.

    (Assessment Requirement: Shortlist Export for Hiring Managers)
    """
    import csv
    import io
    from fastapi.responses import Response

    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job #{job_id} not found."
        )

    apps = db.query(Application).filter(
        Application.job_id == job_id,
        Application.status.in_(["Shortlisted", "Approved", "Interview Scheduled", "Selected", "Evaluated"])
    ).all()

    if format == "json":
        return [
            {
                "application_id": a.id,
                "candidate_name": a.candidate.full_name if a.candidate else "Unknown",
                "email": a.candidate.email if a.candidate else "",
                "phone": a.candidate.phone if a.candidate else "",
                "location": a.candidate.location if a.candidate else "",
                "experience_years": a.candidate.total_experience_years if a.candidate else 0.0,
                "score": a.final_score,
                "status": a.status,
                "matched_skills": ", ".join(a.matched_skills or []),
                "notes": a.internal_notes or ""
            }
            for a in apps
        ]

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Application ID",
        "Candidate Name",
        "Email",
        "Phone",
        "Location",
        "Experience (Years)",
        "Final Match Score",
        "Application Status",
        "Matched Skills",
        "Missing Skills",
        "Recruiter Notes"
    ])

    for a in apps:
        cand = a.candidate
        writer.writerow([
            a.id,
            cand.full_name if cand else "Unknown",
            cand.email if cand else "",
            cand.phone if cand else "",
            cand.location if cand else "",
            cand.total_experience_years if cand else 0.0,
            f"{a.final_score:.1f}%",
            a.status,
            ", ".join(a.matched_skills or []),
            ", ".join(a.missing_skills or []),
            a.internal_notes or ""
        ])

    csv_content = output.getvalue()
    safe_title = "".join(c for c in job.title if c.isalnum() or c in (' ', '_', '-')).strip().replace(' ', '_')
    filename = f"shortlist_job_{job.id}_{safe_title}.csv"

    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )
