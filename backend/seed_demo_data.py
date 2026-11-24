"""Demo Data Seeding Script for AI Recruitment Platform.

Populates the SQLite database with:
- Default Admin, Interviewer, and Candidate accounts.
- Realistic sample Job Requisitions from sample_data/jobs/sample_jobs.json.
- Parsed sample resumes from sample_data/resumes/ with vector embeddings.
- Sample applications with 5-factor matching scores.
- A scheduled technical interview for live testing.
"""
import os
import json
import logging
from datetime import datetime, timezone, timedelta
from pathlib import Path

from app.database import engine, Base, SessionLocal
from app.models.user import User, UserRole
from app.models.job import Job, Application
from app.models.candidate import CandidateProfile
from app.models.resume import Resume
from app.models.interview import Interview
from app.core.security import hash_password
from app.services.document_parser import extract_text_from_file
from app.services.llm_parser import parse_resume_text
from app.services.embedding_service import get_embedding
from app.services.matching_service import compute_hybrid_matching_score

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("seed-script")


def seed_database():
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Users
        logger.info("1. Seeding default demo users...")
        user_specs = [
            ("admin@recruitment.ai", "AdminPass123!", "System Administrator", UserRole.ADMIN.value),
            ("interviewer@recruitment.ai", "InterviewerPass123!", "Alex Vance (Lead Architect)", UserRole.INTERVIEWER.value),
            ("candidate@recruitment.ai", "CandidatePass123!", "Alex Turner (Full-Stack)", UserRole.CANDIDATE.value),
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
                db.commit()
            user_map[role] = user

        candidate_user = user_map[UserRole.CANDIDATE.value]
        interviewer_user = user_map[UserRole.INTERVIEWER.value]

        # 2. Seed Jobs
        logger.info("2. Seeding sample job requisitions...")
        jobs_file = Path("sample_data/jobs/sample_jobs.json")
        jobs_list = []
        if jobs_file.exists():
            with open(jobs_file, "r", encoding="utf-8") as f:
                jobs_data = json.load(f)

            for jd in jobs_data:
                existing_job = db.query(Job).filter(Job.title == jd["title"]).first()
                if not existing_job:
                    req_skills = jd.get("required_skills", [])
                    pref_skills = jd.get("preferred_skills", [])
                    job_text = f"{jd['title']} {jd['description']} {' '.join(req_skills)}"
                    emb = get_embedding(job_text)

                    job = Job(
                        title=jd["title"],
                        description=jd["description"],
                        required_skills_json=json.dumps(req_skills),
                        preferred_skills_json=json.dumps(pref_skills),
                        min_experience=jd.get("min_experience", 2.0),
                        max_experience=jd.get("max_experience", 6.0),
                        education_requirement=jd.get("education_requirement", "Bachelor's Degree"),
                        location=jd.get("location", "Remote"),
                        employment_type=jd.get("employment_type", "Full-time"),
                        status="Active",
                        embedding_json=json.dumps(emb.tolist() if hasattr(emb, "tolist") else list(emb))
                    )
                    db.add(job)
                    db.commit()
                    db.refresh(job)
                    logger.info(f"   Created Job Requisition: {job.title}")
                    jobs_list.append(job)
                else:
                    jobs_list.append(existing_job)

        # 3. Seed Resumes & Candidate Profiles
        logger.info("3. Parsing and seeding sample resumes...")
        resumes_dir = Path("sample_data/resumes")
        sample_files = [
            "alex_turner_fullstack.docx",
            "priya_patel_aiml.pdf",
            "maria_garcia_frontend.pdf",
            "david_kim_devops.docx",
            "james_wilson_junior.docx"
        ]

        candidate_profiles = []
        for filename in sample_files:
            file_path = resumes_dir / filename
            if not file_path.exists():
                continue

            with open(file_path, "rb") as f:
                file_bytes = f.read()

            extracted_text = extract_text_from_file(filename, file_bytes)
            if not extracted_text:
                continue

            extracted_data = parse_resume_text(extracted_text)
            candidate_email = extracted_data.get("email") or f"{Path(filename).stem}@example.com"

            existing_profile = db.query(CandidateProfile).filter(CandidateProfile.email == candidate_email).first()
            if not existing_profile:
                user_id_to_link = candidate_user.id if "alex_turner" in filename else None

                profile = CandidateProfile(
                    user_id=user_id_to_link,
                    full_name=extracted_data.get("full_name") or filename.split("_")[0].capitalize(),
                    email=candidate_email,
                    phone=extracted_data.get("phone"),
                    location=extracted_data.get("location"),
                    total_experience_years=float(extracted_data.get("total_experience_years") or 3.0),
                    education_level=extracted_data.get("education_level", "Bachelor's Degree"),
                    skills_json=json.dumps(extracted_data.get("skills", [])),
                    experience_json=json.dumps(extracted_data.get("experience", [])),
                    education_json=json.dumps(extracted_data.get("education", [])),
                    projects_json=json.dumps(extracted_data.get("projects", [])),
                    raw_text=extracted_text,
                    profile_summary=extracted_data.get("profile_summary", "")
                )
                db.add(profile)
                db.commit()
                db.refresh(profile)

                # Resume record
                resume = Resume(
                    candidate_id=profile.id,
                    filename=filename,
                    file_type=file_path.suffix.lstrip(".").lower(),
                    file_size=len(file_bytes),
                    file_path=str(file_path),
                    parsing_status="Completed"
                )
                db.add(resume)
                db.commit()

                logger.info(f"   Created Candidate Profile: {profile.full_name} ({profile.email})")
                candidate_profiles.append(profile)
            else:
                candidate_profiles.append(existing_profile)

        # 4. Create Applications with 5-factor scoring
        logger.info("4. Calculating 5-factor match scores and creating applications...")
        for job in jobs_list:
            for profile in candidate_profiles:
                existing_app = db.query(Application).filter(
                    Application.candidate_id == profile.id,
                    Application.job_id == job.id
                ).first()

                if not existing_app:
                    match_result = compute_hybrid_matching_score(profile, job)
                    overall = match_result.get("overall_score", 0)
                    initial_status = "Shortlisted" if overall >= 65 else "Applied"

                    app = Application(
                        candidate_id=profile.id,
                        job_id=job.id,
                        status=initial_status,
                        ai_match_score=float(overall),
                        matched_skills_json=json.dumps(match_result.get("matched_skills", [])),
                        missing_skills_json=json.dumps(match_result.get("missing_skills", [])),
                        experience_comparison=match_result.get("experience_comparison", ""),
                        ai_recommendation_reason=match_result.get("recommendation_reason", ""),
                        internal_notes="Evaluated via automated 5-factor hybrid recruitment matching."
                    )
                    db.add(app)
                    db.commit()
                    db.refresh(app)
                    logger.info(f"   Application: {profile.full_name} -> {job.title} ({overall} pts, Status: {initial_status})")

        # 5. Seed a Scheduled Interview for Alex Turner
        logger.info("5. Seeding scheduled technical interview...")
        alex_app = db.query(Application).join(CandidateProfile).filter(
            CandidateProfile.email.like("%alex%"),
            Application.status == "Shortlisted"
        ).first()

        if alex_app:
            existing_interview = db.query(Interview).filter(Interview.application_id == alex_app.id).first()
            if not existing_interview:
                scheduled_time = datetime.now(timezone.utc) + timedelta(days=1, hours=3)
                interview = Interview(
                    application_id=alex_app.id,
                    candidate_id=alex_app.candidate_id,
                    interviewer_id=interviewer_user.id,
                    job_id=alex_app.job_id,
                    scheduled_at=scheduled_time,
                    duration_minutes=45,
                    meeting_link="https://meet.google.com/rec-demo-interview",
                    notes="Round 1 Technical Evaluation: Distributed systems architecture, React state management, and API design.",
                    status="Scheduled"
                )
                alex_app.status = "Interview Scheduled"
                db.add(interview)
                db.commit()
                logger.info(f"   Scheduled Interview for Alex Turner with {interviewer_user.full_name}")

        logger.info("Database seeding successfully completed!")
        print("\n" + "=" * 60)
        print(" DEMO DATABASE READY FOR TESTING")
        print("=" * 60)
        print(" Admin Login:        admin@recruitment.ai / AdminPass123!")
        print(" Interviewer Login:  interviewer@recruitment.ai / InterviewerPass123!")
        print(" Candidate Login:    candidate@recruitment.ai / CandidatePass123!")
        print("=" * 60 + "\n")

    except Exception as e:
        logger.error(f"Seeding failed: {e}")
        db.rollback()
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
