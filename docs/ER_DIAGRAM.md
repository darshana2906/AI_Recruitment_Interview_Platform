# Database Entity-Relationship (ER) Diagram

This document models the relational schema powering the **AI-Powered Recruitment & Interview Management Platform**. The database uses **SQLite** orchestrated with **SQLAlchemy ORM**, featuring strict referential integrity, foreign key cascades, and typed entity structures.

---

## 1. Relational Entity Architecture

```mermaid
erDiagram
    USERS ||--o| CANDIDATE_PROFILES : "associates candidate account"
    USERS ||--o{ RESUMES : "uploads resumes"
    USERS ||--o{ JOBS : "creates job requisitions (Admin)"
    USERS ||--o{ INTERVIEWS : "conducts interviews (Interviewer)"

    RESUMES ||--o| CANDIDATE_PROFILES : "extracted into"

    CANDIDATE_PROFILES ||--o{ APPLICATIONS : "submits"
    CANDIDATE_PROFILES ||--o{ INTERVIEWS : "interviewee"

    JOBS ||--o{ APPLICATIONS : "receives"
    JOBS ||--o{ INTERVIEWS : "requisition for"

    APPLICATIONS ||--o| INTERVIEWS : "scheduled for"

    USERS {
        int id PK
        string email UK "Indexed, unique"
        string hashed_password "Bcrypt hashed"
        string full_name
        string role "Admin | Interviewer | Candidate"
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    RESUMES {
        int id PK
        int user_id FK "Nullable for bulk uploaded resumes"
        string filename
        string file_type "pdf | docx"
        int file_size "Bytes"
        string storage_path "Physical disk path"
        text extracted_text "PyMuPDF / python-docx raw text"
        datetime upload_timestamp
        boolean is_parsed
    }

    CANDIDATE_PROFILES {
        int id PK
        int user_id FK "Nullable for bulk ingested talent pool"
        int resume_id FK "Source document link"
        string full_name
        string email "Indexed"
        string phone
        string location
        string current_title
        text summary
        float total_experience_years
        string education_level "Bachelor | Master | PhD"
        string degree
        string institution
        int graduation_year
        json skills "Extracted technical & soft skills list"
        json work_experience "Array of past roles, companies, durations"
        json education "Academic degrees & institutions"
        json certifications "Industry credentials"
        json raw_llm_response "Full Gemini API entity extraction"
        blob embedding_vector "384-d float32 L2-normalized vector"
        datetime created_at
        datetime updated_at
    }

    JOBS {
        int id PK
        string title "Position title"
        string department "Engineering | Product | AI"
        string location "City, State or Remote"
        string employment_type "Full-time | Contract | Hybrid"
        float min_experience "Minimum years required"
        float max_experience "Preferred upper ceiling"
        string education_requirement "Bachelor | Master | PhD"
        json required_skills "Mandatory technical skills list"
        json preferred_skills "Bonus competencies"
        text description "Full role overview"
        json responsibilities "Key deliverable bullets"
        string status "Active | Closed | Draft"
        int created_by FK "Recruiter admin user_id"
        datetime created_at
        datetime updated_at
    }

    APPLICATIONS {
        int id PK
        int candidate_id FK "CandidateProfile ID"
        int job_id FK "Job ID"
        string status "Applied | Shortlisted | Interview Scheduled | Selected | Rejected | Evaluated"
        float final_score "0-100 composite match score"
        json score_breakdown "5-factor points: Tech, Exp, Edu, Pref, Semantic"
        json matched_skills "Overlap with required_skills"
        json missing_skills "Gaps against required_skills"
        text recommendation_reason "Explainable AI (XAI) rationale"
        float human_override_score "Audited manual override (0-100)"
        text human_override_reason "Recruiter justification"
        text internal_notes "Private hiring team feedback"
        datetime created_at
        datetime updated_at
    }

    INTERVIEWS {
        int id PK
        int application_id FK "Application reference"
        int candidate_id FK "Candidate reference"
        int interviewer_id FK "Assigned evaluator User ID"
        int job_id FK "Job Requisition reference"
        datetime scheduled_at "Meeting timestamp"
        int duration_minutes "Default 45 mins"
        string meeting_link "Google Meet / Video conference URL"
        text notes "Agenda & briefing notes"
        string status "Scheduled | Completed | Cancelled | Rescheduled"
        float technical_rating "1.0 - 5.0"
        float communication_rating "1.0 - 5.0"
        float problem_solving_rating "1.0 - 5.0"
        float culture_fit_rating "1.0 - 5.0"
        string overall_recommendation "Strong Hire | Hire | Hold | Do Not Hire"
        text feedback_remarks "Qualitative evaluation remarks"
        datetime feedback_submitted_at
        datetime created_at
        datetime updated_at
    }
```

---

## 2. Table Schemas & Relational Integrity

### `users`
- **Primary Key**: `id` (Auto-increment integer)
- **Unique Constraint**: `email`
- **Role Constraint**: Validated against `UserRole` Enum (`Candidate`, `Admin`, `Interviewer`).
- **Cascade**: Deleting a user does not delete job records, but orphans candidate profile references safely.

### `resumes`
- **Primary Key**: `id`
- **Foreign Key**: `user_id -> users.id` (Nullable: enables bulk recruiter ingestion without requiring account creation).
- **Physical Isolation**: Raw PDF/DOCX files are stored under `backend/uploads/resumes/` with unique filenames. Extracted raw text is persisted directly in SQLite.

### `candidate_profiles`
- **Primary Key**: `id`
- **Foreign Keys**: `user_id -> users.id`, `resume_id -> resumes.id`
- **Vector Field**: `embedding_vector` stores a packed binary array of 384 IEEE-754 32-bit floats (`np.ndarray.tobytes()`), generated from the structured profile text and normalized via L2 Euclidean norm.

### `jobs`
- **Primary Key**: `id`
- **Foreign Key**: `created_by -> users.id`
- **JSON Fields**: `required_skills`, `preferred_skills`, `responsibilities` stored as JSON arrays for structured querying.

### `applications`
- **Primary Key**: `id`
- **Composite Unique**: (`candidate_id`, `job_id`) ensures a candidate cannot apply multiple times to the same requisition.
- **Audit Columns**: `human_override_score` and `human_override_reason` ensure full audit compliance when an AI recommendation is altered by a human recruiter.

### `interviews`
- **Primary Key**: `id`
- **Foreign Keys**: `application_id -> applications.id`, `candidate_id -> candidate_profiles.id`, `interviewer_id -> users.id`, `job_id -> jobs.id`.
- **5-Dimension Evaluation**: Tracks numerical ratings across 4 core competencies (1.0 to 5.0) plus a categorical recommendation (`Strong Hire`, `Hire`, `Hold`, `Do Not Hire`) and qualitative justification.
