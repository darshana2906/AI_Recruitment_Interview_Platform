from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=True, index=True)
    filename = Column(String(255), nullable=False)
    file_type = Column(String(20), nullable=False)  # pdf, docx
    file_size = Column(Integer, nullable=False)      # in bytes
    file_path = Column(String(500), nullable=False)
    
    # Status: Processing, Completed, Failed
    parsing_status = Column(String(50), default="Processing", nullable=False, index=True)
    error_message = Column(Text, nullable=True)
    is_duplicate = Column(Boolean, default=False, nullable=False)
    
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    candidate = relationship("CandidateProfile", back_populates="resumes")

    def __repr__(self):
        return f"<Resume id={self.id} filename={self.filename} status={self.parsing_status}>"
