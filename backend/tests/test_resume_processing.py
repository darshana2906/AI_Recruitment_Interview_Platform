import os
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

SAMPLE_RESUME_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "sample_data", "resumes")


def get_token(email, password="AdminPass123!"):
    res = client.post("/api/auth/login", json={"email": email, "password": password})
    return res.json()["access_token"]


def test_scenario_1_candidate_uploads_resume():
    """Scenario #1: Candidate uploads a resume -> Profile is created with extracted information."""
    candidate_token = get_token("alex.turner@example.com", "CandidatePass123!")
    headers = {"Authorization": f"Bearer {candidate_token}"}

    docx_path = os.path.join(SAMPLE_RESUME_DIR, "alex_turner_fullstack.docx")
    assert os.path.exists(docx_path), f"File {docx_path} does not exist"

    with open(docx_path, "rb") as f:
        response = client.post(
            "/api/candidates/upload-resume",
            headers=headers,
            files={"file": ("alex_turner_fullstack.docx", f, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
        )

    assert response.status_code == 201
    data = response.json()
    assert data["full_name"] == "Alex Turner"
    assert "React" in data["skills"]
    assert "TypeScript" in data["skills"]
    assert data["total_experience_years"] >= 3.0
    assert len(data["skills"]) >= 5


def test_candidate_reviews_and_updates_profile():
    """Requirement: Allow candidates to review and correct their extracted information."""
    candidate_token = get_token("alex.turner@example.com", "CandidatePass123!")
    headers = {"Authorization": f"Bearer {candidate_token}"}

    # Fetch profile
    get_res = client.get("/api/candidates/me", headers=headers)
    assert get_res.status_code == 200
    profile_data = get_res.json()

    # Update phone and add a skill
    profile_data["phone"] = "+1 (555) 999-8888"
    profile_data["skills"].append("GraphQL")

    put_res = client.put("/api/candidates/me", headers=headers, json=profile_data)
    assert put_res.status_code == 200
    updated = put_res.json()
    assert updated["phone"] == "+1 (555) 999-8888"
    assert "GraphQL" in updated["skills"]


def test_scenario_2_admin_uploads_5_resumes():
    """Scenario #2: Admin uploads 5 resumes -> All resumes are processed individually."""
    admin_token = get_token("test_admin@test.com")
    headers = {"Authorization": f"Bearer {admin_token}"}

    resume_filenames = [
        ("priya_patel_aiml.pdf", "application/pdf"),
        ("maria_garcia_frontend.pdf", "application/pdf"),
        ("david_kim_devops.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
        ("james_wilson_junior.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
        ("alex_turner_fullstack.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    ]

    files_payload = []
    file_handles = []
    try:
        for fname, mime in resume_filenames:
            fpath = os.path.join(SAMPLE_RESUME_DIR, fname)
            f = open(fpath, "rb")
            file_handles.append(f)
            files_payload.append(("files", (fname, f, mime)))

        response = client.post("/api/candidates/bulk-upload", headers=headers, files=files_payload)
    finally:
        for fh in file_handles:
            fh.close()

    assert response.status_code == 200
    data = response.json()
    assert data["total_uploaded"] == 5
    # Alex Turner was uploaded previously in Scenario 1, so it is identified as a duplicate!
    assert data["duplicates"] >= 1
    assert data["successful"] + data["duplicates"] == 5
    assert len(data["results"]) == 5


def test_scenario_3_admin_uploads_invalid_file():
    """Scenario #3: Admin uploads an invalid file -> System handles the error without affecting other uploads."""
    admin_token = get_token("test_admin@test.com")
    headers = {"Authorization": f"Bearer {admin_token}"}

    corrupt_path = os.path.join(SAMPLE_RESUME_DIR, "corrupted_sample.pdf")
    valid_path = os.path.join(SAMPLE_RESUME_DIR, "david_kim_devops.docx")

    with open(corrupt_path, "rb") as f_bad, open(valid_path, "rb") as f_good:
        files = [
            ("files", ("corrupted_sample.pdf", f_bad, "application/pdf")),
            ("files", ("david_kim_devops.docx", f_good, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")),
        ]
        response = client.post("/api/candidates/bulk-upload", headers=headers, files=files)

    assert response.status_code == 200
    data = response.json()
    assert data["total_uploaded"] == 2
    assert data["failed"] >= 1  # Corrupted file failed

    # Verify that the corrupted file failure did not stop the valid file from being processed
    results_map = {r["filename"]: r["status"] for r in data["results"]}
    assert results_map["corrupted_sample.pdf"] == "Failed"
    assert results_map["david_kim_devops.docx"] in ["Completed", "Duplicate"]


def test_candidate_cannot_access_another_candidates_profile():
    """Scenario #12 Preview: Candidate attempts to access another candidate's profile -> 403 Forbidden."""
    cand2_token = get_token("second_candidate@example.com", "CandidatePass123!")
    headers = {"Authorization": f"Bearer {cand2_token}"}

    # Candidate 2 attempts to access Candidate 1's profile (id=1, Alex Turner)
    response = client.get("/api/candidates/1", headers=headers)
    assert response.status_code == 403
    assert "Access denied" in response.json()["detail"]
