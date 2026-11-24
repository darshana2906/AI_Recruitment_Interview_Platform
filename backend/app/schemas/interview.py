from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class InterviewScheduleRequest(BaseModel):
    application_id: int
    interviewer_id: Optional[int] = None
    scheduled_at: datetime
    duration_minutes: int = Field(45, ge=15, le=180)
    meeting_link: Optional[str] = "https://meet.google.com/rec-ai-interview"
    notes: Optional[str] = None


class InterviewRescheduleRequest(BaseModel):
    scheduled_at: datetime
    duration_minutes: Optional[int] = None
    meeting_link: Optional[str] = None
    notes: Optional[str] = None


class InterviewFeedbackRequest(BaseModel):
    technical_rating: float = Field(..., ge=1.0, le=5.0)
    communication_rating: float = Field(..., ge=1.0, le=5.0)
    problem_solving_rating: float = Field(..., ge=1.0, le=5.0)
    culture_fit_rating: float = Field(..., ge=1.0, le=5.0)
    overall_recommendation: str = Field(..., min_length=2)  # Strong Hire, Hire, Neutral, Do Not Hire
    feedback_remarks: str = Field(..., min_length=5)


class InterviewResponse(BaseModel):
    id: int
    application_id: int
    candidate_id: int
    candidate_name: str
    candidate_email: str
    candidate_phone: Optional[str] = None
    interviewer_id: Optional[int] = None
    interviewer_name: Optional[str] = None
    interviewer_email: Optional[str] = None
    job_id: int
    job_title: str
    job_location: Optional[str] = None
    scheduled_at: datetime
    duration_minutes: int
    meeting_link: Optional[str] = None
    notes: Optional[str] = None
    status: str
    technical_rating: Optional[float] = None
    communication_rating: Optional[float] = None
    problem_solving_rating: Optional[float] = None
    culture_fit_rating: Optional[float] = None
    overall_recommendation: Optional[str] = None
    feedback_remarks: Optional[str] = None
    average_rating: Optional[float] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
