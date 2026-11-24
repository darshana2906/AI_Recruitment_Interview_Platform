import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    """Verify system health endpoint."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"


def test_user_registration_success():
    """Verify new candidate registration creates user and returns JWT token."""
    payload = {
        "email": "brand_new_candidate@test.com",
        "password": "Password123!",
        "full_name": "New Candidate",
        "role": "candidate"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "brand_new_candidate@test.com"
    assert data["user"]["role"] == "candidate"


def test_user_registration_duplicate_email():
    """Verify duplicate email registration is rejected with 400 Bad Request."""
    payload = {
        "email": "test_candidate@test.com",  # Already exists
        "password": "AnyPassword123!",
        "full_name": "Duplicate Candidate",
        "role": "candidate"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_login_success():
    """Verify login with correct credentials returns valid JWT token."""
    payload = {
        "email": "test_admin@test.com",
        "password": "AdminPass123!"
    }
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "test_admin@test.com"
    assert data["user"]["role"] == "admin"


def test_login_invalid_password():
    """Verify login with incorrect password returns 401 Unauthorized."""
    payload = {
        "email": "test_admin@test.com",
        "password": "WrongPassword999!"
    }
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]


def test_login_nonexistent_email():
    """Verify login with non-existent email returns 401 Unauthorized."""
    payload = {
        "email": "does_not_exist@test.com",
        "password": "AnyPassword123!"
    }
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 401


def test_unauthenticated_protected_route():
    """Verify unauthenticated requests to protected endpoints return 401."""
    response = client.get("/api/users/profile")
    assert response.status_code == 401


def test_authenticated_profile_access():
    """Verify valid JWT token allows access to own user profile."""
    # Login as candidate
    login_res = client.post("/api/auth/login", json={
        "email": "test_candidate@test.com",
        "password": "CandidatePass123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/api/users/profile", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test_candidate@test.com"
    assert data["role"] == "candidate"


def test_rbac_candidate_denied_admin_endpoint():
    """Verify candidate attempting to access admin-only endpoint receives 403 Forbidden."""
    login_res = client.post("/api/auth/login", json={
        "email": "test_candidate@test.com",
        "password": "CandidatePass123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/api/users/admin-only", headers=headers)
    assert response.status_code == 403
    assert "Access denied" in response.json()["detail"]


def test_rbac_admin_allowed_admin_endpoint():
    """Verify admin user can successfully access admin-only endpoint."""
    login_res = client.post("/api/auth/login", json={
        "email": "test_admin@test.com",
        "password": "AdminPass123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/api/users/admin-only", headers=headers)
    assert response.status_code == 200
    assert "Access granted to Admin area" in response.json()["message"]


def test_rbac_interviewer_portal_access():
    """Verify interviewer can access interviewer portal, but candidate cannot."""
    # 1. Interviewer accesses -> 200 OK
    login_res = client.post("/api/auth/login", json={
        "email": "test_interviewer@test.com",
        "password": "InterviewerPass123!"
    })
    interviewer_token = login_res.json()["access_token"]
    res = client.get("/api/users/interviewer-portal", headers={"Authorization": f"Bearer {interviewer_token}"})
    assert res.status_code == 200

    # 2. Candidate attempts -> 403 Forbidden
    login_cand = client.post("/api/auth/login", json={
        "email": "test_candidate@test.com",
        "password": "CandidatePass123!"
    })
    candidate_token = login_cand.json()["access_token"]
    res_denied = client.get("/api/users/interviewer-portal", headers={"Authorization": f"Bearer {candidate_token}"})
    assert res_denied.status_code == 403
