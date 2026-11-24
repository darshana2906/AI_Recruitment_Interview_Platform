from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class JobBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    description: str = Field(..., min_length=10)
    required_skills: List[str] = Field(..., min_length=1)
    preferred_skills: List[str] = []
    min_experience: float = Field(0.0, ge=0.0)
    max_experience: float = Field(10.0, ge=0.0)
    education_requirement: str = "Bachelor's Degree"
    location: str = "Remote"
    employment_type: str = "Full-time"
    deadline: Optional[str] = None
    status: str = "Active"  # Active, Draft, Closed


class JobCreate(JobBase):
    pass


class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    required_skills: Optional[List[str]] = None
    preferred_skills: Optional[List[str]] = None
    min_experience: Optional[float] = None
    max_experience: Optional[float] = None
    education_requirement: Optional[str] = None
    location: Optional[str] = None
    employment_type: Optional[str] = None
    deadline: Optional[str] = None
    status: Optional[str] = None


class JobResponse(JobBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MatchingResultItem(BaseModel):
    candidate_id: int
    candidate_name: str
    email: str
    phone: Optional[str] = None
    location: Optional[str] = None
    total_experience_years: float = 0.0
    overall_score: float
    score_breakdown: Dict[str, float]
    matched_skills: List[str]
    missing_skills: List[str]
    matched_preferred_skills: List[str]
    experience_comparison: str
    recommendation_reason: str
    application_id: Optional[int] = None
    status: str = "Applied"
    human_override_score: Optional[float] = None
    human_override_reason: Optional[str] = None
    internal_notes: Optional[str] = None


class JobMatchResponse(BaseModel):
    job_id: int
    job_title: str
    total_candidates_evaluated: int
    matches: List[MatchingResultItem]


class SemanticSearchRequest(BaseModel):
    query: str = Field(..., min_length=2)
    top_k: int = Field(10, ge=1, le=50)


class SemanticSearchResultItem(BaseModel):
    candidate_id: int
    candidate_name: str
    email: str
    similarity_score: float
    similarity_percent: float
    skills: List[str]
    experience_years: float
    location: Optional[str] = None
    summary: Optional[str] = None


class ScoreOverrideRequest(BaseModel):
    override_score: float = Field(..., ge=0.0, le=100.0)
    override_reason: str = Field(..., min_length=3)


class InternalNoteRequest(BaseModel):
    note: str = Field(..., min_length=1)
