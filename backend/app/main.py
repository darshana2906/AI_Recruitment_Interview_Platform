import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.models.user import User, UserRole
from app.core.security import hash_password
from app.routers import (
    auth_router,
    users_router,
    candidates_router,
    jobs_router,
    applications_router,
    interviews_router,
)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("recruitment-platform")


def auto_seed_users():
    """Seed initial demo accounts if not already present."""
    db = SessionLocal()
    try:
        defaults = [
            ("admin@recruitment.ai", "AdminPass123!", "System Administrator", UserRole.ADMIN.value),
            ("interviewer@recruitment.ai", "InterviewerPass123!", "Technical Interviewer", UserRole.INTERVIEWER.value),
            ("candidate@recruitment.ai", "CandidatePass123!", "John Doe (Candidate)", UserRole.CANDIDATE.value),
        ]
        for email, pwd, name, role in defaults:
            exists = db.query(User).filter(User.email == email).first()
            if not exists:
                user = User(
                    email=email,
                    hashed_password=hash_password(pwd),
                    full_name=name,
                    role=role,
                    is_active=True
                )
                db.add(user)
                logger.info(f"Seeded default demo user: {email} ({role})")
        db.commit()
    except Exception as e:
        logger.error(f"Error seeding default users: {e}")
        db.rollback()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables in SQLite
    logger.info("Initializing SQLite database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized successfully.")
    
    # Auto-seed default accounts
    auto_seed_users()
    
    yield
    # Shutdown
    logger.info("Shutting down application...")


app = FastAPI(
    title="AI-Powered Recruitment & Interview Management Platform",
    description=(
        "Production-grade REST API backend built with FastAPI, SQLite, SQLAlchemy, "
        "and Role-Based Access Control (RBAC) for Candidates, Admins, and Interviewers."
    ),
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan
)

# CORS Middleware
origins = [
    settings.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(candidates_router, prefix="/api")
app.include_router(jobs_router, prefix="/api")
app.include_router(applications_router, prefix="/api")
app.include_router(interviews_router, prefix="/api")


@app.get("/", tags=["Root"])
def root():
    return {
        "platform": "AI-Powered Recruitment & Interview Management Platform",
        "version": "1.0.0",
        "status": "online",
        "documentation": "/api/docs",
    }


@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "environment": settings.ENVIRONMENT,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
