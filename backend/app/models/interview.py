from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    application_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True)
    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    interviewer_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True)

    # Schedule parameters
    scheduled_at = Column(DateTime(timezone=True), nullable=False, index=True)
    duration_minutes = Column(Integer, default=45, nullable=False)
    meeting_link = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)
    status = Column(String(50), default="Scheduled", nullable=False, index=True)  # Scheduled, Completed, Cancelled, Rescheduled

    # 5-Dimension Evaluation Feedback (Scenario #10)
    technical_rating = Column(Float, nullable=True)          # 1.0 - 5.0
    communication_rating = Column(Float, nullable=True)      # 1.0 - 5.0
    problem_solving_rating = Column(Float, nullable=True)    # 1.0 - 5.0
    culture_fit_rating = Column(Float, nullable=True)        # 1.0 - 5.0
    overall_recommendation = Column(String(50), nullable=True)  # Strong Hire, Hire, Neutral, Do Not Hire
    feedback_remarks = Column(Text, nullable=True)
    feedback_submitted_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    application = relationship("Application", backref="interviews")
    candidate = relationship("CandidateProfile", backref="interviews")
    interviewer = relationship("User", foreign_keys=[interviewer_id], backref="assigned_interviews")
    job = relationship("Job", backref="interviews")

    @property
    def average_rating(self):
        """Calculate aggregate 5-dimension rating average."""
        ratings = [
            r for r in [
                self.technical_rating,
                self.communication_rating,
                self.problem_solving_rating,
                self.culture_fit_rating
            ] if r is not None
        ]
        if not ratings:
            return None
        return round(sum(ratings) / len(ratings), 2)

    def __repr__(self):
        return f"<Interview id={self.id} candidate_id={self.candidate_id} interviewer_id={self.interviewer_id} status={self.status}>"
