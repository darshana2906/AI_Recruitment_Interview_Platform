from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class ExperienceItem(BaseModel):
    company: str
    title: str
    duration: Optional[str] = "N/A"
    responsibilities: Optional[str] = ""


class EducationItem(BaseModel):
    degree: str
    institution: str
    year: Optional[str] = "N/A"


class ProjectItem(BaseModel):
    title: str
    description: Optional[str] = ""
    tech_stack: Optional[List[str]] = []


class CandidateUpdate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    phone: Optional[str] = None
    location: Optional[str] = None
    total_experience_years: float = Field(0.0, ge=0.0)
    education_level: Optional[str] = None
    skills: List[str] = []
    experience: List[Dict[str, Any]] = []
    education: List[Dict[str, Any]] = []
    projects: List[Dict[str, Any]] = []
    profile_summary: Optional[str] = None


class CandidateResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    full_name: str
    email: str
    phone: Optional[str] = None
    location: Optional[str] = None
    total_experience_years: float = 0.0
    education_level: Optional[str] = None
    skills: List[str] = []
    experience: List[Dict[str, Any]] = []
    education: List[Dict[str, Any]] = []
    projects: List[Dict[str, Any]] = []
    profile_summary: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BulkUploadItemResult(BaseModel):
    filename: str
    status: str  # Completed, Failed, Duplicate
    candidate_id: Optional[int] = None
    candidate_name: Optional[str] = None
    email: Optional[str] = None
    skills: Optional[List[str]] = []
    experience_years: Optional[float] = 0.0
    error: Optional[str] = None
    is_duplicate: bool = False


class BulkUploadResponse(BaseModel):
    total_uploaded: int
    successful: int
    failed: int
    duplicates: int
    results: List[BulkUploadItemResult]
