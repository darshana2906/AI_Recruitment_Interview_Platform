import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db
from app.models.user import User, UserRole
from app.core.security import hash_password

TEST_DATABASE_URL = "sqlite:///./test_unified.db"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    
    # Pre-seed baseline test users
    db = TestingSessionLocal()
    users = [
        User(
            email="test_admin@test.com",
            full_name="Test Admin",
            hashed_password=hash_password("AdminPass123!"),
            role=UserRole.ADMIN.value,
            is_active=True,
        ),
        User(
            email="test_interviewer@test.com",
            full_name="Test Interviewer",
            hashed_password=hash_password("InterviewerPass123!"),
            role=UserRole.INTERVIEWER.value,
            is_active=True,
        ),
        User(
            email="test_candidate@test.com",
            full_name="Test Candidate",
            hashed_password=hash_password("CandidatePass123!"),
            role=UserRole.CANDIDATE.value,
            is_active=True,
        ),
        User(
            email="alex.turner@example.com",
            full_name="Alex Turner",
            hashed_password=hash_password("CandidatePass123!"),
            role=UserRole.CANDIDATE.value,
            is_active=True,
        ),
        User(
            email="second_candidate@example.com",
            full_name="Second Candidate",
            hashed_password=hash_password("CandidatePass123!"),
            role=UserRole.CANDIDATE.value,
            is_active=True,
        ),
    ]
    for u in users:
        db.add(u)
    db.commit()
    db.close()
    
    yield
    
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client
