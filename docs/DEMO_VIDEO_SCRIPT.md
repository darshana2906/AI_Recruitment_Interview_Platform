# 7–10 Minute Screen-Recorded Demo Video Script
**Assessment Deliverable**: Section 7, Item 12  
**Project**: AI-Powered Recruitment & Interview Management Platform  
**Target Video Duration**: Approximately 7 to 9 minutes  

---

## 1. Demonstration Scenario Parameters (Single Consistent Workflow)

To fulfill Assessment Section 7 and demonstration requirements, this walkthrough follows **ONE consistent end-to-end scenario**:

| Entity | Parameter | Value in System |
| :--- | :--- | :--- |
| **Job Requisition** | Position Title | **Senior Full-Stack Software Engineer** (Job ID: `1`) |
| | Required Skills | `React`, `Node.js`, `Python`, `SQL`, `Docker` |
| | Min Experience | `4.0` Years |
| **Candidate** | Candidate Name | **Alex Turner** (Candidate ID: `1`, User ID: `3`) |
| | Email | `candidate@recruitment.ai` |
| | Password | `CandidatePass123!` (or `Candidate@12345` on quick-fill) |
| | Resume File | `sample_data/resumes/alex_turner_fullstack.docx` |
| **Interviewer** | Evaluator Name | **Alex Vance** (Lead Architect, User ID: `2`) |
| | Email | `interviewer@recruitment.ai` |
| | Password | `InterviewerPass123!` (or `Interviewer@12345` on quick-fill) |
| **Administrator** | Recruiter Lead | **Talent Acquisition Admin** (User ID: `1`) |
| | Email | `admin@recruitment.ai` |
| | Password | `AdminPass123!` (or `Admin@12345` on quick-fill) |

---

## 2. Step-by-Step Video Walkthrough Script

### Scene 1: Platform Overview & Architecture (0:00 – 1:15)
- **Visual**: Show the modern dark obsidian landing page (`http://localhost:5173`).
- **Narration**:
  > *"Welcome to the demonstration of the AI-Powered Recruitment & Interview Management Platform. This platform automates the end-to-end recruitment lifecycle: from resume ingestion and AI-powered entity extraction, to 5-factor hybrid candidate matching, natural language semantic talent search, and structured 5-dimension interview evaluation."*
- **Action**:
  - Scroll down through the 6 feature cards: AI Resume Parsing, 5-Factor Candidate Matching, Semantic Search, Explainable AI, Interview Scheduling, and Recruitment Analytics.
  - Show the 4-step workflow and about pillars.
  - Click **Sign In** on the top right.

---

### Scene 2: Candidate Experience – Resume Upload & Profile Verification (1:15 – 2:45)
- **Visual**: Login screen (`http://localhost:5173/login`).
- **Action**:
  - Click the **Candidate** 1-click quick-fill button (`candidate@recruitment.ai`).
  - Click **Sign In**.
  - Dashboard loads: Welcome Alex Turner.
  - In the Resume Upload section, drag and drop `sample_data/resumes/alex_turner_fullstack.docx` (or click upload).
  - Show the parsing progress: PyMuPDF/python-docx extracts text; AI extracts structured entities.
  - Show the **Profile Review & Correction** screen:
    - Point out extracted fields: Full Name (*Alex Turner*), Email, Phone, 6.0 Years Experience, Bachelor's Degree.
    - Verified Skills: `React`, `TypeScript`, `Node.js`, `Python`, `Docker`, `SQL`, `REST APIs`, `AWS`.
  - In the Available Jobs section, find **Senior Full-Stack Software Engineer** and click **Apply Now**.
  - Show the application pipeline card update to **Applied**.
  - Click **Logout** in the top navigation bar.

---

### Scene 3: Admin Console – Requisitions, Bulk Ingestion & Semantic Search (2:45 – 4:30)
- **Visual**: Sign in as Admin (`admin@recruitment.ai`).
- **Action**:
  - Show the **Recruitment Dashboard** displaying the 7 KPI stats: Total Candidates, Total Resumes, Active Jobs, Total Applications, Shortlisted Candidates, Interviews Scheduled, Selected Candidates.
  - Navigate to **Job Requisitions**: Show the created requisition *Senior Full-Stack Software Engineer* with required/preferred skills and 4.0 yrs min experience.
  - Navigate to **Bulk Upload**:
    - Demonstrate uploading multiple resumes simultaneously.
    - Mention duplicate candidate detection and invalid/corrupted file isolation without stopping the batch.
  - Navigate to **Semantic Search**:
    - In the natural language query input, type:  
      `"Full-stack engineer with React, Python and microservices experience"`
    - Click **Search Candidates**.
    - Show the vector search results: Alex Turner ranks #1 with a dense vector cosine similarity score > 0.80.

---

### Scene 4: 5-Factor Hybrid Matching & Explainable AI (XAI) (4:30 – 6:00)
- **Visual**: Navigate to **Candidate Matching** (`/admin/matching`).
- **Action**:
  - Select the job requisition: **Senior Full-Stack Software Engineer**.
  - Click **Match Candidates**.
  - The matching engine ranks all candidates:
    - **Alex Turner** appears at the top with a composite score of **~83.3% (Strong Match)**.
  - Explain the **5-Factor Score Breakdown**:
    1. *Technical Skills* (35.0 pts): 5/5 required skills matched (`React`, `Node.js`, `Python`, `SQL`, `Docker`).
    2. *Experience* (25.0 pts): 6.0 years meets required 4.0 years.
    3. *Education* (15.0 pts): Bachelor's degree verified.
    4. *Preferred Skills* (2.5 pts): Partial match on bonus qualifications.
    5. *Semantic Similarity* (5.8 pts): Dense vector alignment.
  - Point out the **Explainable AI Rationale**: Clear narrative explanation justifying the recommendation.
  - Demonstrate **Human-in-the-Loop Override**:
    - Click **Override Score**.
    - Adjust score to `90.0%` with reason: *"Candidate possesses exceptional architectural knowledge and open-source contributions."*
    - Click **Save Override**. Show the amber `Human Overridden` badge and audit trail.
  - Click **Shortlist Candidate**: Status updates to `Shortlisted`.
  - Click **Approve for Interview**: Status updates to `Approved for Interview`.
  - Click **Export Shortlist (CSV)**: Demonstrate instant download of the shortlisted candidates CSV file.

---

### Scene 5: Interview Coordination & Scheduling (6:00 – 7:00)
- **Visual**: In Candidate Matching, click **Schedule Interview** for Alex Turner.
- **Action**:
  - In the Schedule Interview modal:
    - Select Evaluator: **Alex Vance (Lead Architect)** (`interviewer@recruitment.ai`).
    - Date & Time: Set upcoming date/time.
    - Duration: 45 Minutes.
    - Meeting Link: `https://meet.google.com/rec-demo-round1` (live Google Meet link).
    - Notes: *"Technical architecture round: Focus on distributed concurrency and React scaling."*
  - Click **Confirm & Schedule**.
  - Status updates to `Interview Scheduled`.
  - Log out of Admin.

---

### Scene 6: Candidate Portal – Live Notification & Meeting Link (7:00 – 7:45)
- **Visual**: Sign in as Candidate (`candidate@recruitment.ai`).
- **Action**:
  - Show the updated **Application Pipeline**: Status is `Interview Scheduled`.
  - Show the **Scheduled Interview Invitations** card:
    - Job Title: *Senior Full-Stack Software Engineer*
    - Date & Time displayed.
    - Evaluator: *Alex Vance (Lead Architect)*.
    - Validated **Google Meet** video conference link with clickable join button.
  - Log out of Candidate.

---

### Scene 7: Interviewer Workspace & 5-Dimension Scorecard (7:45 – 8:45)
- **Visual**: Sign in as Interviewer (`interviewer@recruitment.ai`).
- **Action**:
  - Interviewer dashboard displays the assigned round for Alex Turner.
  - View candidate briefing, verified skills, and Google Meet room.
  - Click **Conduct Evaluation**:
    - Technical Competence: `4.5 / 5.0`
    - Communication Skills: `4.0 / 5.0`
    - Problem Solving: `5.0 / 5.0`
    - Culture & Team Fit: `4.5 / 5.0`
    - Overall Recommendation: **Strong Hire**
    - Qualitative Remarks: *"Outstanding candidate. Demonstrated deep mastery of asynchronous systems, clean React patterns, and production-grade architecture."*
  - Click **Submit Evaluation**.
  - Show status update to **Completed** with an average rating of `4.50 / 5.0`.

---

### Scene 8: Final Review & Conclusion (8:45 – 9:15)
- **Visual**: Sign back in to Admin (`admin@recruitment.ai`) & open Interviews Management.
- **Action**:
  - Show the completed evaluation with full scorecard visible to authorized admins.
  - Conclude:
    > *"All 12 mandatory assessment scenarios, automated tests, and Section 7 deliverables are verified and operational across the platform. Thank you."*
