"""Single Sample Recruitment Workflow Seeder.

Configures exactly:
- 1 Job Requisition: "Junior Python Developer"
- 1 Candidate: "Aarav Sharma" (candidate@recruitment.ai)
- 1 Interviewer: "Alex Vance (Lead Architect)" (interviewer@recruitment.ai)
- 1 Admin: "System Administrator" (admin@recruitment.ai)
"""
import os
import json
import logging
from datetime import datetime, timezone
from pathlib import Path

from app.database import engine, Base, SessionLocal
from app.models.user import User, UserRole
from app.models.job import Job, Application
from app.models.candidate import CandidateProfile
from app.models.resume import Resume
from app.models.interview import Interview
from app.core.security import hash_password
from app.services.embedding_service import get_embedding

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("seed-single-workflow")


def seed_single_workflow():
    logger.info("Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Clean existing applications, interviews, resumes, candidate profiles, and jobs
        # to ensure EXACTLY ONE of each as required by the user
        logger.info("Cleaning previous sample entries for pristine 1-workflow demonstration...")
        db.query(Interview).delete()
        db.query(Application).delete()
        db.query(Resume).delete()
        db.query(CandidateProfile).delete()
        db.query(Job).delete()
        db.commit()

        # 2. Seed Users
        logger.info("1. Seeding authorized users...")
        user_specs = [
            ("admin@recruitment.ai", "AdminPass123!", "System Administrator", UserRole.ADMIN.value),
            ("interviewer@recruitment.ai", "InterviewerPass123!", "Alex Vance (Lead Architect)", UserRole.INTERVIEWER.value),
            ("candidate@recruitment.ai", "CandidatePass123!", "Aarav Sharma", UserRole.CANDIDATE.value),
        ]
        user_map = {}
        for email, pwd, name, role in user_specs:
            user = db.query(User).filter(User.email == email).first()
            if not user:
                user = User(
                    email=email,
                    hashed_password=hash_password(pwd),
                    full_name=name,
                    role=role,
                    is_active=True
                )
                db.add(user)
                db.commit()
                db.refresh(user)
                logger.info(f"   Created user: {email} ({role})")
            else:
                user.hashed_password = hash_password(pwd)
                user.full_name = name
                user.is_active = True
                db.commit()
            user_map[role] = user

        candidate_user = user_map[UserRole.CANDIDATE.value]

        # 3. Seed EXACTLY ONE Job Requisition: Junior Python Developer
        logger.info("2. Seeding single Job Requisition: 'Junior Python Developer'...")
        req_skills = ["Python", "SQL", "FastAPI", "REST API", "Git", "Object-Oriented Programming"]
        pref_skills = ["React.js", "JavaScript", "MySQL"]
        description = (
            "We are looking for a Junior Python Developer with knowledge of Python, SQL, "
            "FastAPI and REST API development. The candidate should understand database operations, "
            "object-oriented programming and Git. The candidate will work on backend development, "
            "API integration, debugging and application maintenance."
        )

        job_text = f"Junior Python Developer {description} {' '.join(req_skills)}"
        emb = get_embedding(job_text)

        single_job = Job(
            title="Junior Python Developer",
            description=description,
            required_skills_json=json.dumps(req_skills),
            preferred_skills_json=json.dumps(pref_skills),
            min_experience=0.0,
            max_experience=2.0,
            education_requirement="B.Sc. Computer Science",
            location="Pune, Maharashtra (Hybrid)",
            employment_type="Full-time",
            status="Active",
            embedding_json=json.dumps(emb.tolist() if hasattr(emb, "tolist") else list(emb))
        )
        db.add(single_job)
        db.commit()
        db.refresh(single_job)
        logger.info(f"   Created Job #{single_job.id}: {single_job.title} (Status: Active)")

        # 4. Seed EXACTLY ONE Candidate Profile: Aarav Sharma
        logger.info("3. Seeding single Candidate Profile: 'Aarav Sharma'...")
        cand_skills = ["Python", "SQL", "FastAPI", "REST API", "Git", "OOP", "MySQL", "React.js"]
        cand_experience = [
            {
                "company": "Tech Innovators Pvt Ltd",
                "title": "Junior Python Intern",
                "duration": "1 year",
                "responsibilities": "Assisted in building REST APIs with FastAPI, writing SQL queries, and maintaining Git repositories."
            }
        ]
        cand_education = [
            {
                "degree": "B.Sc. Computer Science",
                "institution": "Savitribai Phule Pune University",
                "year": "2025"
            }
        ]
        cand_summary = (
            "Aarav Sharma is a passionate Junior Python Developer based in Pune, Maharashtra with 1 year "
            "of hands-on experience developing REST APIs using FastAPI and SQL."
        )

        cand_profile = CandidateProfile(
            user_id=candidate_user.id,
            full_name="Aarav Sharma",
            email=candidate_user.email,
            phone="+91 98765 43210",
            location="Pune, Maharashtra",
            total_experience_years=1.0,
            education_level="B.Sc. Computer Science",
            skills_json=json.dumps(cand_skills),
            experience_json=json.dumps(cand_experience),
            education_json=json.dumps(cand_education),
            projects_json=json.dumps([
                {
                    "title": "FastAPI Recruitment Service",
                    "description": "Developed backend REST APIs for applicant tracking with SQL database.",
                    "tech_stack": ["Python", "FastAPI", "SQL"]
                }
            ]),
            raw_text=(
                "Aarav Sharma\nEmail: candidate@recruitment.ai | Location: Pune, Maharashtra\n"
                "1 year of experience as Junior Python Developer in FastAPI, SQL, REST APIs, Git, OOP, MySQL, React.js."
            ),
            profile_summary=cand_summary
        )
        db.add(cand_profile)
        db.commit()
        db.refresh(cand_profile)

        # 5. Link Resume File
        resume_path = Path("sample_data/resumes/aarav_sharma_python.docx")
        resume = Resume(
            candidate_id=cand_profile.id,
            filename="aarav_sharma_python.docx",
            file_type="docx",
            file_size=resume_path.stat().st_size if resume_path.exists() else 1024,
            file_path=str(resume_path),
            parsing_status="Completed"
        )
        db.add(resume)
        db.commit()
        logger.info(f"   Created Candidate Profile #{cand_profile.id}: {cand_profile.full_name} ({cand_profile.email})")

        logger.info("Pruned database successfully: Exactly 1 Job Requisition + 1 Candidate Profile ready for testing.")
        print("\n" + "=" * 60)
        print(" SINGLE SAMPLE RECRUITMENT WORKFLOW CONFIGURED")
        print("=" * 60)
        print(" Requisition:       Junior Python Developer (Active)")
        print(" Candidate Profile: Aarav Sharma (candidate@recruitment.ai)")
        print(" Admin Account:     admin@recruitment.ai / AdminPass123!")
        print(" Interviewer:       interviewer@recruitment.ai / InterviewerPass123!")
        print(" Candidate:         candidate@recruitment.ai / CandidatePass123!")
        print("=" * 60 + "\n")

    except Exception as e:
        logger.error(f"Seeding failed: {e}")
        db.rollback()
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_single_workflow()
