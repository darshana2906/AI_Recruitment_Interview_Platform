import json
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)
    
    # Skills stored as serialized JSON strings for SQLite compatibility
    required_skills_json = Column(Text, default="[]", nullable=False)
    preferred_skills_json = Column(Text, default="[]", nullable=False)
    
    min_experience = Column(Float, default=0.0, nullable=False)
    max_experience = Column(Float, default=10.0, nullable=False)
    education_requirement = Column(String(255), nullable=False, default="Bachelor's Degree")
    location = Column(String(255), nullable=False, default="Remote")
    employment_type = Column(String(100), nullable=False, default="Full-time")  # Full-time, Part-time, Contract, Remote
    deadline = Column(String(50), nullable=True)  # YYYY-MM-DD
    status = Column(String(50), default="Active", nullable=False, index=True)   # Active, Draft, Closed
    
    # Vector embedding representation stored as JSON float array
    embedding_json = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")

    @property
    def required_skills(self):
        try:
            return json.loads(self.required_skills_json) if self.required_skills_json else []
        except Exception:
            return []

    @required_skills.setter
    def required_skills(self, value):
        self.required_skills_json = json.dumps(value if isinstance(value, list) else [])

    @property
    def preferred_skills(self):
        try:
            return json.loads(self.preferred_skills_json) if self.preferred_skills_json else []
        except Exception:
            return []

    @preferred_skills.setter
    def preferred_skills(self, value):
        self.preferred_skills_json = json.dumps(value if isinstance(value, list) else [])

    @property
    def embedding(self):
        try:
            return json.loads(self.embedding_json) if self.embedding_json else []
        except Exception:
            return []

    @embedding.setter
    def embedding(self, value):
        self.embedding_json = json.dumps(value if isinstance(value, list) else [])

    def __repr__(self):
        return f"<Job id={self.id} title={self.title} status={self.status}>"


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Status: Applied, Shortlisted, Approved, Interview Scheduled, Selected, Rejected
    status = Column(String(50), default="Applied", nullable=False, index=True)
    
    # AI Matching & Explainable Recommendation Fields
    ai_match_score = Column(Float, default=0.0, nullable=False)  # 0 to 100
    matched_skills_json = Column(Text, default="[]", nullable=False)
    missing_skills_json = Column(Text, default="[]", nullable=False)
    experience_comparison = Column(String(255), nullable=True)
    ai_recommendation_reason = Column(Text, nullable=True)
    
    # Human-in-the-Loop Override Fields
    human_override_score = Column(Float, nullable=True)
    human_override_reason = Column(Text, nullable=True)
    internal_notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    job = relationship("Job", back_populates="applications")
    candidate = relationship("CandidateProfile", backref="applications")

    @property
    def matched_skills(self):
        try:
            return json.loads(self.matched_skills_json) if self.matched_skills_json else []
        except Exception:
            return []

    @matched_skills.setter
    def matched_skills(self, value):
        self.matched_skills_json = json.dumps(value if isinstance(value, list) else [])

    @property
    def missing_skills(self):
        try:
            return json.loads(self.missing_skills_json) if self.missing_skills_json else []
        except Exception:
            return []

    @missing_skills.setter
    def missing_skills(self, value):
        self.missing_skills_json = json.dumps(value if isinstance(value, list) else [])

    @property
    def final_score(self):
        """Effective score considering human override if present."""
        if self.human_override_score is not None:
            return self.human_override_score
        return self.ai_match_score

    def __repr__(self):
        return f"<Application id={self.id} candidate_id={self.candidate_id} job_id={self.job_id} score={self.final_score}>"
