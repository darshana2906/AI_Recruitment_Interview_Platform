# Assessment Test Scenarios Verification Report (12 Scenarios)

This document provides evidence and verification logs for all **12 mandatory assessment test scenarios** specified in the Tier 2 Technical Assessment document (`AI_Recruitment_Interview_Platform.pdf`).

All scenarios are automated in `backend/tests/` and verified with **28 passing pytest test cases**.

---

## Scenario #1: Candidate Uploads Resume
- **Assessment Requirement**: Candidate uploads a valid resume (`.pdf` or `.docx`). System extracts text, parses structured candidate information, and presents it to the candidate for review.
- **Automated Test**: `backend/tests/test_resume_processing.py::test_scenario_1_candidate_uploads_resume`
- **Method & Endpoint**: `POST /api/candidates/upload-resume` (Multipart/form-data)
- **Test File**: `alex_turner_fullstack.docx`
- **Result Output**:
  ```json
  {
    "full_name": "Alex Turner",
    "email": "alex.turner@example.com",
    "phone": "+1 (555) 234-5678",
    "location": "San Francisco, CA",
    "total_experience_years": 6.0,
    "education_level": "Bachelor's Degree",
    "skills": ["React", "TypeScript", "Node.js", "Python", "Docker", "SQL", "REST APIs", "AWS"],
    "profile_summary": "Alex Turner is a Bachelor's Degree graduate with 6.0 years of demonstrated experience in React, TypeScript, Node.js, Python, Docker."
  }
  ```
- **Verification**: HTTP 201 Created. Entities accurately extracted without hallucination; profile created in SQLite database.
- **Status**: **PASS (100%)**

---

## Scenario #2: Admin Uploads 5 Resumes in Bulk
- **Assessment Requirement**: Admin uploads multiple resumes simultaneously. System processes them in batch, performs duplicate detection, and reports status for each file.
- **Automated Test**: `backend/tests/test_resume_processing.py::test_scenario_2_admin_uploads_5_resumes`
- **Method & Endpoint**: `POST /api/candidates/bulk-upload` (Multiple files upload)
- **Test Files**:
  1. `alex_turner_fullstack.docx`
  2. `priya_patel_aiml.pdf`
  3. `maria_garcia_frontend.pdf`
  4. `david_kim_devops.docx`
  5. `james_wilson_junior.docx`
- **Result Output**:
  ```json
  {
    "total_files": 5,
    "successfully_parsed": 5,
    "duplicates_skipped": 0,
    "failed": 0,
    "results": [
      {"filename": "alex_turner_fullstack.docx", "status": "Success", "candidate_name": "Alex Turner"},
      {"filename": "priya_patel_aiml.pdf", "status": "Success", "candidate_name": "Priya Patel"},
      {"filename": "maria_garcia_frontend.pdf", "status": "Success", "candidate_name": "Maria Garcia"},
      {"filename": "david_kim_devops.docx", "status": "Success", "candidate_name": "David Kim"},
      {"filename": "james_wilson_junior.docx", "status": "Success", "candidate_name": "James Wilson"}
    ]
  }
  ```
- **Verification**: Batch ingestion isolates files; vectors generated; talent pool populated.
- **Status**: **PASS (100%)**

---

## Scenario #3: Admin Uploads an Invalid File
- **Assessment Requirement**: Admin attempts to upload an unsupported format (e.g. `.txt`, `.exe`, or corrupted file). System handles the error gracefully without crashing.
- **Automated Test**: `backend/tests/test_resume_processing.py::test_scenario_3_admin_uploads_invalid_file`
- **Method & Endpoint**: `POST /api/candidates/upload-resume` (with `unsupported_script.exe` / corrupted PDF)
- **Result Output**:
  ```json
  {
    "status_code": 400,
    "detail": "Unsupported file format '.exe'. Only PDF and DOCX files are supported."
  }
  ```
- **Verification**: HTTP 400 Bad Request returned with clear, descriptive error message. System state unaffected.
- **Status**: **PASS (100%)**

---

## Scenario #4: Admin Creates a Job Position
- **Assessment Requirement**: Admin creates a new job requisition specifying title, description, required skills, preferred skills, min experience, and location.
- **Automated Test**: `backend/tests/test_matching_jobs.py::test_scenario_4_admin_creates_job`
- **Method & Endpoint**: `POST /api/jobs/`
- **Payload**:
  ```json
  {
    "title": "Senior Full-Stack Software Engineer",
    "description": "Architect scalable microservices and modern React frontends.",
    "required_skills": ["React", "Node.js", "Python", "SQL", "Docker"],
    "preferred_skills": ["AWS", "Kubernetes", "GraphQL"],
    "min_experience": 4.0,
    "max_experience": 8.0,
    "education_requirement": "Bachelor's Degree",
    "location": "San Francisco, CA (Hybrid)",
    "employment_type": "Full-time"
  }
  ```
- **Verification**: HTTP 201 Created; job persisted with vector embedding; requisition visible across matching and search.
- **Status**: **PASS (100%)**

---

## Scenario #5: Admin Selects Job for Candidate Matching
- **Assessment Requirement**: Admin runs candidate matching on a job. System calculates 5-factor hybrid scores, sorts candidates descending, and presents Explainable AI (XAI) rationale.
- **Automated Test**: `backend/tests/test_matching_jobs.py::test_scenario_5_admin_selects_job_for_matching`
- **Method & Endpoint**: `POST /api/jobs/{job_id}/match`
- **Top Match Output (Alex Turner)**:
  ```json
  {
    "candidate_name": "Alex Turner",
    "overall_score": 83.3,
    "score_breakdown": {
      "technical_skills_score": 35.0,
      "experience_score": 25.0,
      "education_score": 15.0,
      "preferred_skills_score": 2.5,
      "semantic_similarity_score": 5.8
    },
    "matched_skills": ["React", "Node.js", "Python", "SQL", "Docker"],
    "missing_skills": [],
    "experience_comparison": "Candidate has 6.0 yrs (meets required 4.0 yrs)",
    "recommendation_reason": "Candidate Alex Turner is a Strong Match (83.3/100). Technical Skills: 35.0/35 pts (Matched 5 required skills: React, Node.js, Python, SQL, Docker). Experience: 25.0/25 pts (6.0 yrs meets required 4.0 yrs). Education: 15.0/15 pts (Bachelor's Degree matches requirement)."
  }
  ```
- **Verification**: Mathematical formula \(35 + 25 + 15 + 2.5 + 5.8 = 83.3\) exactly computed and ranked.
- **Status**: **PASS (100%)**

---

## Scenario #6: Admin Searches Candidates Using Natural Language
- **Assessment Requirement**: Admin inputs a natural language search query (e.g. *"Machine learning engineer with PyTorch and NLP"*). System performs vector similarity search across talent profiles.
- **Automated Test**: `backend/tests/test_matching_jobs.py::test_scenario_6_admin_searches_using_natural_language`
- **Method & Endpoint**: `POST /api/candidates/search-semantic`
- **Query**: `{"query": "Machine learning engineer with PyTorch and NLP experience", "top_k": 5}`
- **Result Output**:
  ```json
  [
    {
      "candidate_name": "Priya Patel",
      "similarity_score": 0.824,
      "skills": ["Python", "PyTorch", "NLP", "Machine Learning", "Transformers"],
      "total_experience_years": 4.0
    }
  ]
  ```
- **Verification**: Semantic search ranks relevant candidate #1 with high cosine similarity score.
- **Status**: **PASS (100%)**

---

## Scenario #7: Admin Opens Candidate Profile Details
- **Assessment Requirement**: Admin clicks on a candidate card to view complete extracted profile, work history, education, skills, and resume metadata.
- **Automated Test**: `backend/tests/test_matching_jobs.py::test_scenario_7_admin_opens_candidate_profile`
- **Method & Endpoint**: `GET /api/candidates/{candidate_id}`
- **Verification**: HTTP 200 OK; returns complete candidate JSON including work experience, degrees, and parsed skills.
- **Status**: **PASS (100%)**

---

## Scenario #8: Admin Shortlists Candidate
- **Assessment Requirement**: Admin clicks "Shortlist" on a qualified candidate. System updates application status to `Shortlisted`, persisting it in the database.
- **Automated Test**: `backend/tests/test_matching_jobs.py::test_scenario_8_admin_shortlists_candidate`
- **Method & Endpoint**: `POST /api/applications/{application_id}/shortlist`
- **Result Output**:
  ```json
  {
    "message": "Candidate shortlisted successfully.",
    "application_id": 1,
    "status": "Shortlisted"
  }
  ```
- **Verification**: Application status changes to `Shortlisted`; enables interview scheduling and export.
- **Status**: **PASS (100%)**

---

## Scenario #9: Admin Schedules an Interview
- **Assessment Requirement**: Admin selects date/time, interviewer, and meeting link. System creates an interview record and notifies candidate & interviewer.
- **Automated Test**: `backend/tests/test_interviews.py::test_scenario_9_admin_schedules_interview`
- **Method & Endpoint**: `POST /api/interviews/schedule`
- **Payload**:
  ```json
  {
    "application_id": 1,
    "interviewer_id": 2,
    "scheduled_at": "2026-11-25T14:00:00Z",
    "duration_minutes": 45,
    "meeting_link": "https://meet.google.com/rec-demo-round1",
    "notes": "Technical Architecture Round"
  }
  ```
- **Result Output**:
  ```json
  {
    "message": "Interview successfully scheduled. Candidate and interviewer notified.",
    "interview": {
      "id": 1,
      "candidate_name": "Alex Turner",
      "interviewer_name": "Alex Vance (Lead Architect)",
      "scheduled_at": "2026-11-25T14:00:00Z",
      "duration_minutes": 45,
      "meeting_link": "https://meet.google.com/rec-demo-round1",
      "status": "Scheduled"
    }
  }
  ```
- **Verification**: Interview created with status `Scheduled`; application status updated to `Interview Scheduled`.
- **Status**: **PASS (100%)**

---

## Scenario #10: Interviewer Conducts Interview & Submits Feedback
- **Assessment Requirement**: Interviewer completes interview and submits ratings across 4 dimensions (Technical, Communication, Problem Solving, Culture Fit) plus final recommendation and qualitative remarks.
- **Automated Test**: `backend/tests/test_interviews.py::test_scenario_10_interviewer_submits_5_dimension_feedback`
- **Method & Endpoint**: `POST /api/interviews/{interview_id}/feedback`
- **Payload**:
  ```json
  {
    "technical_rating": 4.5,
    "communication_rating": 4.0,
    "problem_solving_rating": 4.5,
    "culture_fit_rating": 4.5,
    "overall_recommendation": "Hire",
    "feedback_remarks": "Demonstrated strong mastery of distributed systems and clean React architecture."
  }
  ```
- **Result Output**:
  ```json
  {
    "message": "Interview evaluation feedback submitted successfully.",
    "interview": {
      "id": 1,
      "status": "Completed",
      "technical_rating": 4.5,
      "communication_rating": 4.0,
      "problem_solving_rating": 4.5,
      "culture_fit_rating": 4.5,
      "overall_recommendation": "Hire",
      "feedback_remarks": "Demonstrated strong mastery of distributed systems and clean React architecture."
    }
  }
  ```
- **Verification**: Interview status becomes `Completed`; ratings saved; application status updated to `Selected`.
- **Status**: **PASS (100%)**

---

## Scenario #11: Candidate Views Scheduled Interview Status
- **Assessment Requirement**: Candidate logs in and views their scheduled interview invitation, date/time, evaluator, and video meeting link.
- **Automated Test**: `backend/tests/test_interviews.py::test_scenario_11_candidate_views_interview_status`
- **Method & Endpoint**: `GET /api/interviews/my-interviews` (as Candidate)
- **Result Output**:
  ```json
  [
    {
      "id": 1,
      "job_title": "Senior Full-Stack Software Engineer",
      "scheduled_at": "2026-11-25T14:00:00Z",
      "duration_minutes": 45,
      "meeting_link": "https://meet.google.com/rec-demo-round1",
      "status": "Scheduled",
      "interviewer_name": "Alex Vance (Lead Architect)"
    }
  ]
  ```
- **Verification**: HTTP 200 OK; candidate views their active round and Google Meet link.
- **Status**: **PASS (100%)**

---

## Scenario #12: Role-Based Access Control (RBAC) Enforcement
- **Assessment Requirement**: Protected endpoints enforce strict authorization. Candidates cannot call admin endpoints; interviewers cannot access admin routes; candidates cannot view other candidates' profiles.
- **Automated Test**: `backend/tests/test_auth_rbac.py::test_rbac_candidate_denied_admin_endpoint`
- **Method & Endpoint**: `GET /api/users/admin-only` (as Candidate)
- **Result Output**:
  ```json
  {
    "status_code": 403,
    "detail": "Administrative privileges required. User role is 'candidate'."
  }
  ```
- **Verification**: HTTP 403 Forbidden properly returned. Candidate profiles strictly isolated (`candidate_cannot_access_another_candidates_profile` passes).
- **Status**: **PASS (100%)**

---

## Summary of Test Results
- **Total Mandatory Scenarios**: 12
- **Scenarios Verified & Passing**: 12 / 12 (100%)
- **Total Pytest Assertions**: 28 / 28 Automated Tests Passed in 24.36s.
