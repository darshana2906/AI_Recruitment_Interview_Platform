# Assessment Test Scenarios Verification Report (12 Scenarios)

This document provides definitive evidence and verification logs for all **12 mandatory assessment test scenarios** specified in Section 5 of the Tier 2 Technical Assessment document (`AI_Recruitment_Interview_Platform.pdf`).

All scenarios are automated in `backend/tests/` and verified with **30 passing pytest test cases**.

---

## Mandatory Test Scenarios Summary Table

| # | Test Scenario (PDF) | Expected Result (PDF) | Automated Test Name | Test Status |
|:---:|:---|:---|:---|:---:|
| **1** | Candidate uploads a resume | Profile is created with extracted information | `test_scenario_1_candidate_uploads_resume` | **PASS** |
| **2** | Admin uploads 5 resumes | All resumes are processed individually | `test_scenario_2_admin_uploads_5_resumes` | **PASS** |
| **3** | Admin uploads an invalid file | System handles the error without affecting other uploads | `test_scenario_3_admin_uploads_invalid_file` | **PASS** |
| **4** | Admin creates a job | Job is saved with all required details | `test_scenario_4_admin_creates_job` | **PASS** |
| **5** | Admin selects a job for matching | Suitable candidates are ranked with scores | `test_scenario_5_admin_selects_job_for_matching` | **PASS** |
| **6** | Admin searches using natural language | Relevant candidates are retrieved using semantic search | `test_scenario_6_admin_searches_using_natural_language` | **PASS** |
| **7** | Admin opens a candidate profile | Complete profile and matching explanation are displayed | `test_scenario_7_admin_opens_candidate_profile` | **PASS** |
| **8** | Admin shortlists candidates | Candidates are added to the job-specific shortlist | `test_scenario_8_admin_shortlists_candidate` | **PASS** |
| **9** | Admin approves a candidate | Candidate receives an interview notification | `test_scenario_9_admin_approves_candidate` | **PASS** |
| **10** | Admin schedules an interview | Interview details are saved and visible to the candidate | `test_scenario_10_admin_schedules_interview` | **PASS** |
| **11** | Interviewer submits feedback | Feedback is stored and visible to authorized admins | `test_scenario_11_interviewer_submits_feedback` | **PASS** |
| **12** | Candidate attempts to access another candidate's profile | Access is denied | `test_candidate_cannot_access_another_candidates_profile` | **PASS** |

---

## Detailed Scenario Verification & Evidence

### Scenario #1: Candidate Uploads Resume
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
- **Verification**: HTTP 201 Created. Entities extracted without hallucination; profile created in SQLite database.
- **Status**: **PASS (100%)**

---

### Scenario #2: Admin Uploads 5 Resumes in Bulk
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
- **Verification**: Batch ingestion processes each file individually; vectors generated; talent pool populated.
- **Status**: **PASS (100%)**

---

### Scenario #3: Admin Uploads an Invalid File
- **Assessment Requirement**: Admin attempts to upload an unsupported format (e.g. `.exe`, `.txt`, or corrupted file). System handles the error gracefully without affecting other uploads.
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

### Scenario #4: Admin Creates a Job Position
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

### Scenario #5: Admin Selects Job for Candidate Matching
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
    "recommendation_reason": "Candidate Alex Turner is a Strong Match (83.3/100). Technical Skills: 35.0/35 pts. Experience: 25.0/25 pts. Education: 15.0/15 pts."
  }
  ```
- **Verification**: 5-factor formula computed deterministically; candidates ranked descending.
- **Status**: **PASS (100%)**

---

### Scenario #6: Admin Searches Candidates Using Natural Language
- **Assessment Requirement**: Admin inputs a natural language search query. System performs vector similarity search across talent profiles.
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
- **Verification**: Semantic search retrieves and ranks relevant candidate with cosine similarity score > 0.80.
- **Status**: **PASS (100%)**

---

### Scenario #7: Admin Opens Candidate Profile Details
- **Assessment Requirement**: Admin clicks on a candidate card to view complete extracted profile, work history, education, skills, and resume metadata.
- **Automated Test**: `backend/tests/test_matching_jobs.py::test_scenario_7_admin_opens_candidate_profile`
- **Method & Endpoint**: `GET /api/candidates/{candidate_id}`
- **Verification**: HTTP 200 OK; returns complete candidate JSON including work experience, degrees, parsed skills, and recommendation rationale.
- **Status**: **PASS (100%)**

---

### Scenario #8: Admin Shortlists Candidate
- **Assessment Requirement**: Admin clicks "Shortlist" on a qualified candidate. System updates application status to `Shortlisted`, persisting it in the database.
- **Automated Test**: `backend/tests/test_matching_jobs.py::test_scenario_8_admin_shortlists_candidate`
- **Method & Endpoint**: `POST /api/applications/{application_id}/shortlist`
- **Result Output**:
  ```json
  {
    "message": "Candidate #1 has been successfully added to the shortlist for job 'Senior Full-Stack Software Engineer'.",
    "application_id": 1,
    "status": "Shortlisted"
  }
  ```
- **Verification**: Application status changes to `Shortlisted`; enables CSV export and interview workflow.
- **Status**: **PASS (100%)**

---

### Scenario #9: Admin Approves Candidate for Interview
- **Assessment Requirement**: Admin approves a candidate for an interview. System updates status to `Approved` and candidate receives an interview notification.
- **Automated Test**: `backend/tests/test_interviews.py::test_scenario_9_admin_approves_candidate`
- **Method & Endpoint**: `POST /api/applications/{application_id}/approve`
- **Result Output**:
  ```json
  {
    "message": "Candidate #1 has been approved for an interview for job 'Senior Full-Stack Software Engineer'. Candidate has been notified.",
    "application_id": 1,
    "candidate_id": 1,
    "status": "Approved",
    "notification_sent": true,
    "notification_message": "Congratulations! Your application for 'Senior Full-Stack Software Engineer' has been approved for an interview. An evaluator will schedule your session shortly."
  }
  ```
- **Verification**: Application status set to `Approved`; notification payload created; candidate portal displays interview invitation notice.
- **Status**: **PASS (100%)**

---

### Scenario #10: Admin Schedules an Interview
- **Assessment Requirement**: Admin schedules an interview specifying date/time, duration, meeting link, and evaluator. Interview details are saved and visible to candidate.
- **Automated Test**: `backend/tests/test_interviews.py::test_scenario_10_admin_schedules_interview`
- **Method & Endpoint**: `POST /api/interviews/schedule`
- **Payload**:
  ```json
  {
    "application_id": 1,
    "interviewer_id": 2,
    "scheduled_at": "2026-11-26T14:00:00Z",
    "duration_minutes": 60,
    "meeting_link": "https://meet.google.com/test-assessment-interview",
    "notes": "Technical coding round: Focus on System Architecture and Python concurrency."
  }
  ```
- **Result Output**:
  ```json
  {
    "message": "Interview successfully scheduled. Candidate and interviewer notified.",
    "interview": {
      "id": 1,
      "candidate_id": 1,
      "interviewer_id": 2,
      "status": "Scheduled",
      "meeting_link": "https://meet.google.com/test-assessment-interview",
      "duration_minutes": 60
    }
  }
  ```
- **Verification**: HTTP 201 Created. Interview status `Scheduled`; application status updated to `Interview Scheduled`; details visible in candidate portal.
- **Status**: **PASS (100%)**

---

### Scenario #11: Interviewer Submits Evaluation Feedback
- **Assessment Requirement**: Interviewer completes interview and submits ratings across 4 dimensions (Technical, Communication, Problem Solving, Culture Fit) plus recommendation and remarks. Feedback is stored and visible to authorized admins.
- **Automated Test**: `backend/tests/test_interviews.py::test_scenario_11_interviewer_submits_feedback`
- **Method & Endpoint**: `POST /api/interviews/{interview_id}/feedback`
- **Payload**:
  ```json
  {
    "technical_rating": 4.5,
    "communication_rating": 4.0,
    "problem_solving_rating": 5.0,
    "culture_fit_rating": 4.5,
    "overall_recommendation": "Strong Hire",
    "feedback_remarks": "Outstanding candidate. Excellent grasp of asynchronous systems, data structures, and production architecture."
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
      "problem_solving_rating": 5.0,
      "culture_fit_rating": 4.5,
      "overall_recommendation": "Strong Hire",
      "average_rating": 4.5
    }
  }
  ```
- **Verification**: Interview status becomes `Completed`; ratings saved; visible in Admin Interview Console.
- **Status**: **PASS (100%)**

---

### Scenario #12: Role-Based Access Control (RBAC) Enforcement
- **Assessment Requirement**: Candidate attempts to access another candidate's profile. Access is denied.
- **Automated Test**: `backend/tests/test_resume_processing.py::test_candidate_cannot_access_another_candidates_profile`
- **Method & Endpoint**: `GET /api/candidates/{other_candidate_id}` (authenticated as Candidate A)
- **Result Output**:
  ```json
  {
    "status_code": 403,
    "detail": "Access denied: Candidates cannot view other candidate profiles."
  }
  ```
- **Verification**: HTTP 403 Forbidden properly returned. Candidate domains strictly isolated.
- **Status**: **PASS (100%)**

---

## Final Automated Test Suite Verification

```text
tests/test_auth_rbac.py::test_health_check PASSED                        [  3%]
tests/test_auth_rbac.py::test_user_registration_success PASSED           [  6%]
tests/test_auth_rbac.py::test_user_registration_duplicate_email PASSED   [ 10%]
tests/test_auth_rbac.py::test_login_success PASSED                       [ 13%]
tests/test_auth_rbac.py::test_login_invalid_password PASSED              [ 16%]
tests/test_auth_rbac.py::test_login_nonexistent_email PASSED             [ 20%]
tests/test_auth_rbac.py::test_unauthenticated_protected_route PASSED     [ 23%]
tests/test_auth_rbac.py::test_authenticated_profile_access PASSED         [ 26%]
tests/test_auth_rbac.py::test_rbac_candidate_denied_admin_endpoint PASSED [ 30%]
tests/test_auth_rbac.py::test_rbac_admin_allowed_admin_endpoint PASSED   [ 33%]
tests/test_auth_rbac.py::test_rbac_interviewer_portal_access PASSED     [ 36%]
tests/test_interviews.py::test_scenario_9_admin_approves_candidate PASSED [ 40%]
tests/test_interviews.py::test_scenario_10_admin_schedules_interview PASSED [ 43%]
tests/test_interviews.py::test_scenario_11_interviewer_submits_feedback PASSED [ 46%]
tests/test_interviews.py::test_scenario_11b_candidate_views_interview_status PASSED [ 50%]
tests/test_interviews.py::test_shortlist_export_csv_and_json PASSED     [ 53%]
tests/test_interviews.py::test_reschedule_and_cancel_interview PASSED   [ 56%]
tests/test_matching_jobs.py::test_scenario_4_admin_creates_job PASSED   [ 60%]
tests/test_matching_jobs.py::test_scenario_5_admin_selects_job_for_matching PASSED [ 63%]
tests/test_matching_jobs.py::test_scenario_6_admin_searches_using_natural_language PASSED [ 66%]
tests/test_matching_jobs.py::test_scenario_7_admin_opens_candidate_profile PASSED [ 70%]
tests/test_matching_jobs.py::test_scenario_8_admin_shortlists_candidate PASSED [ 73%]
tests/test_matching_jobs.py::test_human_in_the_loop_score_override PASSED [ 76%]
tests/test_matching_jobs.py::test_job_crud_update_and_delete PASSED     [ 80%]
tests/test_matching_jobs.py::test_recruitment_dashboard_7_kpis_stats PASSED [ 83%]
tests/test_resume_processing.py::test_scenario_1_candidate_uploads_resume PASSED [ 86%]
tests/test_resume_processing.py::test_candidate_reviews_and_updates_profile PASSED [ 90%]
tests/test_resume_processing.py::test_scenario_2_admin_uploads_5_resumes PASSED [ 93%]
tests/test_resume_processing.py::test_scenario_3_admin_uploads_invalid_file PASSED [ 96%]
tests/test_resume_processing.py::test_candidate_cannot_access_another_candidates_profile PASSED [100%]

============================= 30 passed in 24.16s =============================
```

- **Total Mandatory Scenarios Tested**: 12 / 12
- **Scenarios Passing**: 12 / 12 (**100% PASS Rate**)
