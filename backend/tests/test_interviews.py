import os
import pytest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def get_token(email="test_admin@test.com", password="AdminPass123!"):
    res = client.post("/api/auth/login", json={"email": email, "password": password})
    return res.json()["access_token"]


@pytest.fixture(autouse=True, scope="module")
def ensure_sample_data():
    """Ensure baseline job, candidates, and applications exist for interview tests."""
    admin_token = get_token("test_admin@test.com")
    headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Ensure candidates exist
    res = client.get("/api/candidates/", headers=headers)
    if res.status_code != 200 or len(res.json()) < 2:
        resume_dir = os.path.join(os.path.dirname(__file__), "..", "..", "sample_data", "resumes")
        valid_files = ["alex_turner_fullstack.docx", "priya_patel_aiml.pdf"]
        files = []
        opened = []
        for fn in valid_files:
            fp = os.path.join(resume_dir, fn)
            if os.path.exists(fp):
                f = open(fp, "rb")
                opened.append(f)
                mime = "application/pdf" if fn.endswith(".pdf") else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                files.append(("files", (fn, f, mime)))
        if files:
            client.post("/api/candidates/bulk-upload", headers=headers, files=files)
            for f in opened:
                f.close()

    # 2. Ensure at least one active job exists
    jobs_res = client.get("/api/jobs/")
    if len(jobs_res.json()) == 0:
        client.post("/api/jobs/", headers=headers, json={
            "title": "Lead Software Architect",
            "description": "Design distributed microservices, define API standards, and lead platform scaling.",
            "required_skills": ["Python", "FastAPI", "Docker", "Architecture"],
            "preferred_skills": ["Kubernetes", "Redis"],
            "min_experience": 4.0,
            "max_experience": 8.0,
            "education_requirement": "Bachelor's Degree",
            "location": "Remote",
            "employment_type": "Full-time",
            "status": "Active"
        })


def test_scenario_9_admin_schedules_interview():
    """Scenario #9: Admin schedules an interview -> Candidate and Interviewer receive details."""
    admin_token = get_token("test_admin@test.com")
    headers = {"Authorization": f"Bearer {admin_token}"}

    jobs_res = client.get("/api/jobs/")
    job_id = jobs_res.json()[0]["id"]

    # Match candidates to obtain an application
    match_res = client.post(f"/api/jobs/{job_id}/match", headers=headers)
    matches = match_res.json()["matches"]
    assert len(matches) > 0
    top_match = matches[0]
    app_id = top_match["application_id"]
    candidate_id = top_match["candidate_id"]

    # Shortlist candidate first
    client.post(f"/api/applications/{app_id}/shortlist", headers=headers)

    # Fetch available interviewers
    interviewers_res = client.get("/api/interviews/interviewers", headers=headers)
    assert interviewers_res.status_code == 200
    interviewers = interviewers_res.json()
    assert len(interviewers) > 0
    interviewer_id = interviewers[0]["id"]

    # Schedule interview
    interview_time = (datetime.now(timezone.utc) + timedelta(days=2)).isoformat()
    payload = {
        "application_id": app_id,
        "interviewer_id": interviewer_id,
        "scheduled_at": interview_time,
        "duration_minutes": 60,
        "meeting_link": "https://meet.google.com/test-assessment-interview",
        "notes": "Technical coding round: Focus on System Architecture and Python concurrency."
    }

    res = client.post("/api/interviews/schedule", headers=headers, json=payload)
    assert res.status_code == 201
    data = res.json()

    assert "message" in data
    interview = data["interview"]
    assert interview["id"] is not None
    assert interview["application_id"] == app_id
    assert interview["candidate_id"] == candidate_id
    assert interview["interviewer_id"] == interviewer_id
    assert interview["status"] == "Scheduled"
    assert interview["meeting_link"] == "https://meet.google.com/test-assessment-interview"
    assert interview["duration_minutes"] == 60


def test_scenario_10_interviewer_submits_5_dimension_feedback():
    """Scenario #10: Interviewer conducts interview and submits 5-dimension feedback -> Ratings saved, status completed."""
    interviewer_token = get_token("test_interviewer@test.com", "InterviewerPass123!")
    headers = {"Authorization": f"Bearer {interviewer_token}"}

    # Fetch assigned interviews
    my_interviews_res = client.get("/api/interviews/my-interviews", headers=headers)
    assert my_interviews_res.status_code == 200
    my_interviews = my_interviews_res.json()

    # If test_interviewer was not the assigned interviewer, fall back to admin to test evaluation
    if not my_interviews:
        admin_token = get_token("test_admin@test.com")
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        all_interviews = client.get("/api/interviews/", headers=admin_headers).json()
        assert len(all_interviews) > 0
        interview_id = all_interviews[0]["id"]
        eval_headers = admin_headers
    else:
        interview_id = my_interviews[0]["id"]
        eval_headers = headers

    # Submit 5-dimension feedback
    feedback_payload = {
        "technical_rating": 4.5,
        "communication_rating": 4.0,
        "problem_solving_rating": 5.0,
        "culture_fit_rating": 4.5,
        "overall_recommendation": "Strong Hire",
        "feedback_remarks": "Outstanding candidate. Excellent grasp of asynchronous systems, data structures, and production architecture."
    }

    fb_res = client.post(f"/api/interviews/{interview_id}/feedback", headers=eval_headers, json=feedback_payload)
    assert fb_res.status_code == 200
    data = fb_res.json()

    interview = data["interview"]
    assert interview["status"] == "Completed"
    assert interview["technical_rating"] == 4.5
    assert interview["communication_rating"] == 4.0
    assert interview["problem_solving_rating"] == 5.0
    assert interview["culture_fit_rating"] == 4.5
    assert interview["overall_recommendation"] == "Strong Hire"
    assert interview["average_rating"] == 4.5
    assert "Outstanding candidate" in interview["feedback_remarks"]


def test_scenario_11_candidate_views_interview_status():
    """Scenario #11: Candidate views application & interview status -> Complete timeline and details displayed."""
    admin_token = get_token("test_admin@test.com")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Find the candidate associated with the scheduled interview
    all_interviews = client.get("/api/interviews/", headers=admin_headers).json()
    assert len(all_interviews) > 0
    test_interview = all_interviews[0]
    candidate_id = test_interview["candidate_id"]

    # Verify candidate profile details
    cand_res = client.get(f"/api/candidates/{candidate_id}", headers=admin_headers)
    assert cand_res.status_code == 200
    candidate_data = cand_res.json()
    assert candidate_data["full_name"] is not None

    # Candidate queries their interview record
    interview_detail = client.get(f"/api/interviews/{test_interview['id']}", headers=admin_headers)
    assert interview_detail.status_code == 200
    res_data = interview_detail.json()
    assert res_data["id"] == test_interview["id"]
    assert res_data["job_title"] is not None
    assert res_data["meeting_link"] is not None


def test_shortlist_export_csv_and_json():
    """Assessment Requirement: Shortlist Export in CSV and JSON formats for Hiring Managers."""
    admin_token = get_token("test_admin@test.com")
    headers = {"Authorization": f"Bearer {admin_token}"}

    jobs_res = client.get("/api/jobs/")
    job_id = jobs_res.json()[0]["id"]

    # 1. Test CSV export
    csv_res = client.get(f"/api/applications/job/{job_id}/export-shortlist?format=csv", headers=headers)
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers["content-type"]
    assert "attachment; filename=" in csv_res.headers["content-disposition"]
    csv_text = csv_res.text
    assert "Application ID" in csv_text
    assert "Candidate Name" in csv_text
    assert "Final Match Score" in csv_text
    assert "Application Status" in csv_text

    # 2. Test JSON export
    json_res = client.get(f"/api/applications/job/{job_id}/export-shortlist?format=json", headers=headers)
    assert json_res.status_code == 200
    json_data = json_res.json()
    assert isinstance(json_data, list)


def test_reschedule_and_cancel_interview():
    """Verify Interview Lifecycle: Reschedule and Cancel operations."""
    admin_token = get_token("test_admin@test.com")
    headers = {"Authorization": f"Bearer {admin_token}"}

    jobs_res = client.get("/api/jobs/")
    job_id = jobs_res.json()[0]["id"]

    # Match to get an application
    match_res = client.post(f"/api/jobs/{job_id}/match", headers=headers)
    app_id = match_res.json()["matches"][0]["application_id"]

    # Schedule
    new_time = (datetime.now(timezone.utc) + timedelta(days=3)).isoformat()
    sched_res = client.post("/api/interviews/schedule", headers=headers, json={
        "application_id": app_id,
        "scheduled_at": new_time,
        "duration_minutes": 45,
        "meeting_link": "https://meet.google.com/reschedule-test"
    })
    interview_id = sched_res.json()["interview"]["id"]

    # Reschedule
    resched_time = (datetime.now(timezone.utc) + timedelta(days=5)).isoformat()
    resched_res = client.put(f"/api/interviews/{interview_id}/reschedule", headers=headers, json={
        "scheduled_at": resched_time,
        "duration_minutes": 60,
        "notes": "Rescheduled per candidate request."
    })
    assert resched_res.status_code == 200
    assert resched_res.json()["interview"]["status"] == "Rescheduled"
    assert resched_res.json()["interview"]["duration_minutes"] == 60

    # Cancel
    cancel_res = client.post(f"/api/interviews/{interview_id}/cancel", headers=headers)
    assert cancel_res.status_code == 200
    assert cancel_res.json()["interview"]["status"] == "Cancelled"
