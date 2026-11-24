import json
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    full_name = Column(String(255), nullable=False, index=True)
    email = Column(String(255), nullable=False, index=True)
    phone = Column(String(50), nullable=True)
    location = Column(String(255), nullable=True)
    total_experience_years = Column(Float, default=0.0, nullable=False)
    education_level = Column(String(100), nullable=True)
    
    # Structured Extracted Entities (stored as JSON text for SQLite compatibility)
    skills_json = Column(Text, default="[]", nullable=False)
    experience_json = Column(Text, default="[]", nullable=False)
    education_json = Column(Text, default="[]", nullable=False)
    projects_json = Column(Text, default="[]", nullable=False)
    
    raw_text = Column(Text, nullable=True)
    profile_summary = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", backref="candidate_profile", foreign_keys=[user_id])
    resumes = relationship("Resume", back_populates="candidate", cascade="all, delete-orphan")

    @property
    def skills(self):
        try:
            return json.loads(self.skills_json) if self.skills_json else []
        except Exception:
            return []

    @skills.setter
    def skills(self, value):
        self.skills_json = json.dumps(value if isinstance(value, list) else [])

    @property
    def experience_history(self):
        try:
            return json.loads(self.experience_json) if self.experience_json else []
        except Exception:
            return []

    @experience_history.setter
    def experience_history(self, value):
        self.experience_json = json.dumps(value if isinstance(value, list) else [])

    @property
    def education_history(self):
        try:
            return json.loads(self.education_json) if self.education_json else []
        except Exception:
            return []

    @education_history.setter
    def education_history(self, value):
        self.education_json = json.dumps(value if isinstance(value, list) else [])

    @property
    def projects(self):
        try:
            return json.loads(self.projects_json) if self.projects_json else []
        except Exception:
            return []

    @projects.setter
    def projects(self, value):
        self.projects_json = json.dumps(value if isinstance(value, list) else [])

    def __repr__(self):
        return f"<CandidateProfile id={self.id} name={self.full_name} email={self.email}>"
