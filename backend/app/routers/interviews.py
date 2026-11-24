import logging
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.models.job import Job, Application
from app.models.candidate import CandidateProfile
from app.models.interview import Interview
from app.schemas.interview import (
    InterviewScheduleRequest,
    InterviewRescheduleRequest,
    InterviewFeedbackRequest,
    InterviewResponse,
)
from app.core.dependencies import get_current_active_user
from app.core.rbac import require_admin, require_interviewer

logger = logging.getLogger("interviews-router")
router = APIRouter(prefix="/interviews", tags=["Interview Scheduling & 5-Dimension Evaluation"])


def _format_interview_response(interview: Interview) -> dict:
    cand = interview.candidate
    interviewer = interview.interviewer
    job = interview.job

    return {
        "id": interview.id,
        "application_id": interview.application_id,
        "candidate_id": interview.candidate_id,
        "candidate_name": cand.full_name if cand else "Unknown",
        "candidate_email": cand.email if cand else "",
        "candidate_phone": cand.phone if cand else None,
        "interviewer_id": interview.interviewer_id,
        "interviewer_name": interviewer.full_name if interviewer else "Unassigned",
        "interviewer_email": interviewer.email if interviewer else None,
        "job_id": interview.job_id,
        "job_title": job.title if job else "Unknown Requisition",
        "job_location": job.location if job else None,
        "scheduled_at": interview.scheduled_at,
        "duration_minutes": interview.duration_minutes,
        "meeting_link": interview.meeting_link,
        "notes": interview.notes,
        "status": interview.status,
        "technical_rating": interview.technical_rating,
        "communication_rating": interview.communication_rating,
        "problem_solving_rating": interview.problem_solving_rating,
        "culture_fit_rating": interview.culture_fit_rating,
        "overall_recommendation": interview.overall_recommendation,
        "feedback_remarks": interview.feedback_remarks,
        "average_rating": interview.average_rating,
        "created_at": interview.created_at,
    }


@router.get("/interviewers", response_model=List[dict])
def list_available_interviewers(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List all registered interviewers and administrators eligible to conduct interviews."""
    users = db.query(User).filter(
        User.role.in_([UserRole.INTERVIEWER.value, UserRole.ADMIN.value]),
        User.is_active == True
    ).all()

    return [
        {"id": u.id, "full_name": u.full_name, "email": u.email, "role": u.role}
        for u in users
    ]


@router.post("/schedule", response_model=dict, status_code=status.HTTP_201_CREATED)
def schedule_interview(
    req: InterviewScheduleRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin schedules an interview for a candidate application.

    (Scenario #9: Admin schedules an interview -> Candidate and Interviewer receive details)
    """
    app = db.query(Application).filter(Application.id == req.application_id).first()
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application #{req.application_id} not found."
        )

    # Resolve interviewer
    interviewer = None
    if req.interviewer_id:
        interviewer = db.query(User).filter(User.id == req.interviewer_id).first()
        if not interviewer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Interviewer #{req.interviewer_id} not found."
            )
    else:
        # Default to first available interviewer
        interviewer = db.query(User).filter(User.role == UserRole.INTERVIEWER.value).first()
        if not interviewer:
            interviewer = current_user

    # Generate default meeting link if not supplied
    meeting_link = req.meeting_link or f"https://meet.google.com/rec-{app.id}-{app.candidate_id}"

    new_interview = Interview(
        application_id=app.id,
        candidate_id=app.candidate_id,
        interviewer_id=interviewer.id if interviewer else None,
        job_id=app.job_id,
        scheduled_at=req.scheduled_at,
        duration_minutes=req.duration_minutes,
        meeting_link=meeting_link,
        notes=req.notes,
        status="Scheduled"
    )

    app.status = "Interview Scheduled"
    db.add(new_interview)
    db.commit()
    db.refresh(new_interview)

    logger.info(
        f"Scheduled interview #{new_interview.id} for candidate #{app.candidate_id} with interviewer #{interviewer.id if interviewer else 'none'}"
    )

    return {
        "message": "Interview successfully scheduled. Candidate and interviewer notified.",
        "interview": _format_interview_response(new_interview)
    }


@router.get("/", response_model=List[dict])
def list_all_interviews(
    job_id: Optional[int] = Query(None),
    status_filter: Optional[str] = Query(None),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin lists all interviews with optional filtering."""
    query = db.query(Interview)
    if job_id:
        query = query.filter(Interview.job_id == job_id)
    if status_filter and status_filter.upper() != "ALL":
        query = query.filter(Interview.status == status_filter)

    interviews = query.order_by(Interview.scheduled_at.desc()).all()
    return [_format_interview_response(i) for i in interviews]


@router.get("/my-interviews", response_model=List[dict])
def get_my_interviews(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Retrieve interviews relevant to the authenticated user.

    - Candidates: view their scheduled interview invitations and outcomes (Scenario #11).
    - Interviewers: view their assigned candidate interviews (Scenario #10).
    - Admins: view all interviews.
    """
    if current_user.role == UserRole.ADMIN.value:
        interviews = db.query(Interview).order_by(Interview.scheduled_at.desc()).all()
    elif current_user.role == UserRole.INTERVIEWER.value:
        interviews = db.query(Interview).filter(
            Interview.interviewer_id == current_user.id
        ).order_by(Interview.scheduled_at.asc()).all()
    else:
        # Candidate
        cand = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
        if not cand:
            return []
        interviews = db.query(Interview).filter(
            Interview.candidate_id == cand.id
        ).order_by(Interview.scheduled_at.asc()).all()

    return [_format_interview_response(i) for i in interviews]


@router.get("/{interview_id}", response_model=dict)
def get_interview_detail(
    interview_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Retrieve detailed interview record."""
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Interview #{interview_id} not found."
        )

    return _format_interview_response(interview)


@router.post("/{interview_id}/feedback", response_model=dict)
def submit_interview_feedback(
    interview_id: int,
    feedback: InterviewFeedbackRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Interviewer conducts interview and submits 5-dimension evaluation feedback.

    (Scenario #10: Interviewer conducts interview and submits feedback -> Ratings saved, status completed)
    """
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Interview #{interview_id} not found."
        )

    # Verify authorization: must be assigned interviewer or admin
    if current_user.role != UserRole.ADMIN.value and interview.interviewer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to submit feedback for this interview."
        )

    interview.technical_rating = feedback.technical_rating
    interview.communication_rating = feedback.communication_rating
    interview.problem_solving_rating = feedback.problem_solving_rating
    interview.culture_fit_rating = feedback.culture_fit_rating
    interview.overall_recommendation = feedback.overall_recommendation
    interview.feedback_remarks = feedback.feedback_remarks.strip()
    interview.feedback_submitted_at = datetime.now(timezone.utc)
    interview.status = "Completed"

    # Update application status
    if interview.application:
        if feedback.overall_recommendation in ["Strong Hire", "Hire"]:
            interview.application.status = "Selected"
        elif feedback.overall_recommendation == "Do Not Hire":
            interview.application.status = "Rejected"
        else:
            interview.application.status = "Evaluated"

    db.commit()
    db.refresh(interview)

    logger.info(f"Feedback submitted for interview #{interview.id} by user #{current_user.id}")

    return {
        "message": "Interview evaluation feedback submitted successfully.",
        "interview": _format_interview_response(interview)
    }


@router.put("/{interview_id}/reschedule", response_model=dict)
def reschedule_interview(
    interview_id: int,
    req: InterviewRescheduleRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin reschedules an existing interview."""
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Interview #{interview_id} not found."
        )

    interview.scheduled_at = req.scheduled_at
    if req.duration_minutes:
        interview.duration_minutes = req.duration_minutes
    if req.meeting_link:
        interview.meeting_link = req.meeting_link
    if req.notes:
        interview.notes = req.notes
    interview.status = "Rescheduled"

    db.commit()
    db.refresh(interview)

    return {
        "message": "Interview rescheduled successfully.",
        "interview": _format_interview_response(interview)
    }


@router.post("/{interview_id}/cancel", response_model=dict)
def cancel_interview(
    interview_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin cancels an interview."""
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Interview #{interview_id} not found."
        )

    interview.status = "Cancelled"
    if interview.application:
        interview.application.status = "Shortlisted"

    db.commit()
    db.refresh(interview)

    return {
        "message": "Interview has been cancelled.",
        "interview": _format_interview_response(interview)
    }
