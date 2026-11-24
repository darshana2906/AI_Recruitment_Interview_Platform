import os
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def get_token(email="test_admin@test.com", password="AdminPass123!"):
    res = client.post("/api/auth/login", json={"email": email, "password": password})
    return res.json()["access_token"]


@pytest.fixture(autouse=True, scope="module")
def ensure_sample_candidates():
    admin_token = get_token("test_admin@test.com")
    headers = {"Authorization": f"Bearer {admin_token}"}

    res = client.get("/api/candidates/", headers=headers)
    if res.status_code == 200 and len(res.json()) >= 4:
        return

    resume_dir = os.path.join(os.path.dirname(__file__), "..", "..", "sample_data", "resumes")
    valid_files = [
        "alex_turner_fullstack.docx",
        "priya_patel_aiml.pdf",
        "david_kim_devops.docx",
        "maria_garcia_frontend.pdf",
        "james_wilson_junior.docx"
    ]
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


def test_scenario_4_admin_creates_job():
    """Scenario #4: Admin creates a job -> Job is saved with all required details."""
    admin_token = get_token("test_admin@test.com")
    headers = {"Authorization": f"Bearer {admin_token}"}

    job_payload = {
        "title": "Senior AI / Backend Engineer",
        "description": "Architect scalable AI microservices, build REST APIs, and implement RAG pipelines using Python and Docker.",
        "required_skills": ["Python", "FastAPI", "Docker", "SQL", "Machine Learning"],
        "preferred_skills": ["PyTorch", "Redis", "FAISS", "Kubernetes"],
        "min_experience": 3.0,
        "max_experience": 7.0,
        "education_requirement": "Bachelor's Degree in Computer Science or related field",
        "location": "San Francisco, CA (Hybrid)",
        "employment_type": "Full-time",
        "deadline": "2026-12-31",
        "status": "Active"
    }

    response = client.post("/api/jobs/", headers=headers, json=job_payload)
    assert response.status_code == 201
    job = response.json()
    assert job["id"] is not None
    assert job["title"] == "Senior AI / Backend Engineer"
    assert "FastAPI" in job["required_skills"]
    assert "PyTorch" in job["preferred_skills"]
    assert job["min_experience"] == 3.0
    assert job["max_experience"] == 7.0
    assert job["status"] == "Active"


def test_scenario_5_admin_selects_job_for_matching():
    """Scenario #5: Admin selects a job for matching -> Suitable candidates are ranked with scores."""
    admin_token = get_token("test_admin@test.com")
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Fetch jobs to find the created job
    jobs_res = client.get("/api/jobs/")
    assert jobs_res.status_code == 200
    jobs = jobs_res.json()
    assert len(jobs) > 0
    job_id = jobs[0]["id"]

    # Trigger candidate matching for this job
    match_res = client.post(f"/api/jobs/{job_id}/match", headers=headers)
    assert match_res.status_code == 200
    match_data = match_res.json()

    assert match_data["job_id"] == job_id
    assert match_data["total_candidates_evaluated"] > 0
    matches = match_data["matches"]

    # Verify ranking: matches should be sorted in descending order of score
    scores = [m["overall_score"] for m in matches]
    assert scores == sorted(scores, reverse=True)

    # Verify score structure and explainability
    top_match = matches[0]
    assert 0.0 <= top_match["overall_score"] <= 100.0
    assert "score_breakdown" in top_match
    assert "technical_skills_score" in top_match["score_breakdown"]
    assert "experience_score" in top_match["score_breakdown"]
    assert "semantic_similarity_score" in top_match["score_breakdown"]
    assert isinstance(top_match["matched_skills"], list)
    assert isinstance(top_match["missing_skills"], list)
    assert len(top_match["recommendation_reason"]) > 10


def test_scenario_6_admin_searches_using_natural_language():
    """Scenario #6: Admin searches using natural language -> Relevant candidates are retrieved using semantic search."""
    admin_token = get_token("test_admin@test.com")
    headers = {"Authorization": f"Bearer {admin_token}"}

    search_query = {
        "query": "Senior software engineer with strong React, Node.js, and TypeScript frontend capabilities",
        "top_k": 5
    }

    response = client.post("/api/candidates/search-semantic", headers=headers, json=search_query)
    assert response.status_code == 200
    results = response.json()
    assert len(results) > 0

    # Ensure results are sorted by semantic similarity score
    sim_scores = [r["similarity_score"] for r in results]
    assert sim_scores == sorted(sim_scores, reverse=True)

    # Alex Turner (Fullstack React/Node engineer) should rank high
    candidate_names = [r["candidate_name"] for r in results]
    assert any("Alex" in name for name in candidate_names)


def test_scenario_7_admin_opens_candidate_profile():
    """Scenario #7: Admin opens a candidate profile -> Complete profile and matching explanation are displayed."""
    admin_token = get_token("test_admin@test.com")
    headers = {"Authorization": f"Bearer {admin_token}"}

    candidates_res = client.get("/api/candidates/", headers=headers)
    assert candidates_res.status_code == 200
    candidates = candidates_res.json()
    assert len(candidates) > 0
    cand_id = candidates[0]["id"]

    response = client.get(f"/api/candidates/{cand_id}", headers=headers)
    assert response.status_code == 200
    profile = response.json()

    assert profile["id"] == cand_id
    assert "full_name" in profile
    assert "skills" in profile
    assert "experience" in profile
    assert "education" in profile
    assert "projects" in profile
    assert "profile_summary" in profile


def test_scenario_8_admin_shortlists_candidate():
    """Scenario #8: Admin shortlists candidates -> Candidates are added to the job-specific shortlist."""
    admin_token = get_token("test_admin@test.com")
    headers = {"Authorization": f"Bearer {admin_token}"}

    jobs_res = client.get("/api/jobs/")
    job_id = jobs_res.json()[0]["id"]

    # Match to get an application ID
    match_res = client.post(f"/api/jobs/{job_id}/match", headers=headers)
    top_match = match_res.json()["matches"][0]
    app_id = top_match["application_id"]
    assert app_id is not None

    # Shortlist the candidate
    shortlist_res = client.post(f"/api/applications/{app_id}/shortlist", headers=headers)
    assert shortlist_res.status_code == 200
    assert shortlist_res.json()["status"] == "Shortlisted"

    # Query job shortlist
    list_res = client.get(f"/api/applications/job/{job_id}/shortlist", headers=headers)
    assert list_res.status_code == 200
    shortlisted = list_res.json()
    assert any(a["application_id"] == app_id for a in shortlisted)


def test_human_in_the_loop_score_override():
    """Requirement: Human-in-the-Loop: Allow admins to review and override AI recommendations."""
    admin_token = get_token("test_admin@test.com")
    headers = {"Authorization": f"Bearer {admin_token}"}

    jobs_res = client.get("/api/jobs/")
    job_id = jobs_res.json()[0]["id"]

    match_res = client.post(f"/api/jobs/{job_id}/match", headers=headers)
    app_id = match_res.json()["matches"][0]["application_id"]

    # Override AI score to 95.0
    override_payload = {
        "override_score": 95.0,
        "override_reason": "Candidate performed exceptionally well during initial phone screening."
    }
    override_res = client.post(f"/api/applications/{app_id}/override", headers=headers, json=override_payload)
    assert override_res.status_code == 200
    data = override_res.json()
    assert data["effective_score"] == 95.0
    assert "phone screening" in data["override_reason"]


def test_job_crud_update_and_delete():
    """Verify Job CRUD operations: update and delete."""
    admin_token = get_token("test_admin@test.com")
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Create temporary job
    create_res = client.post("/api/jobs/", headers=headers, json={
        "title": "Temp Job To Delete",
        "description": "Temporary job description.",
        "required_skills": ["Python"],
        "min_experience": 1.0,
        "max_experience": 2.0,
        "education_requirement": "Bachelor's Degree",
        "location": "Remote",
        "employment_type": "Contract",
        "status": "Draft"
    })
    job_id = create_res.json()["id"]

    # Update job
    update_res = client.put(f"/api/jobs/{job_id}", headers=headers, json={
        "title": "Updated Temp Job Title",
        "status": "Active"
    })
    assert update_res.status_code == 200
    assert update_res.json()["title"] == "Updated Temp Job Title"
    assert update_res.json()["status"] == "Active"

    # Delete job
    del_res = client.delete(f"/api/jobs/{job_id}", headers=headers)
    assert del_res.status_code == 204

    # Verify deleted
    get_res = client.get(f"/api/jobs/{job_id}")
    assert get_res.status_code == 404


def test_recruitment_dashboard_7_kpis_stats():
    """Verify Section C.1: 7 Dashboard Recruitment KPIs.
    1. Total candidates
    2. Total resumes
    3. Active jobs
    4. Total applications
    5. Shortlisted candidates
    6. Interviews scheduled
    7. Selected candidates
    """
    admin_token = get_token("test_admin@test.com")
    headers = {"Authorization": f"Bearer {admin_token}"}

    stats_res = client.get("/api/applications/stats", headers=headers)
    assert stats_res.status_code == 200
    data = stats_res.json()
    assert "total_candidates" in data
    assert "total_resumes" in data
    assert "active_jobs" in data
    assert "total_applications" in data
    assert "shortlisted_candidates" in data
    assert "interviews_scheduled" in data
    assert "selected_candidates" in data
    assert data["total_candidates"] >= 1
    assert data["active_jobs"] >= 1

    # Verify applications list endpoint
    apps_res = client.get("/api/applications/", headers=headers)
    assert apps_res.status_code == 200
    assert isinstance(apps_res.json(), list)
