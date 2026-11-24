from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse, MessageResponse
from app.core.security import hash_password, verify_password, create_access_token
from app.core.dependencies import get_current_active_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """Register a new user (Candidate, Admin, or Interviewer).

    - Validates email uniqueness
    - Securely hashes password using bcrypt
    - Generates JWT access token
    """
    # 1. Check if email already registered
    existing_user = db.query(User).filter(User.email == user_in.email.lower().strip()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"An account with email '{user_in.email}' already exists.",
        )

    # 2. Hash password & persist
    hashed_pwd = hash_password(user_in.password)
    user = User(
        email=user_in.email.lower().strip(),
        full_name=user_in.full_name.strip(),
        hashed_password=hashed_pwd,
        role=user_in.role.value if isinstance(user_in.role, UserRole) else str(user_in.role),
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # 3. Create access token
    token_payload = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
        "full_name": user.full_name,
    }
    access_token = create_access_token(token_payload)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Authenticate an existing user using email and password.

    - Validates credentials against bcrypt hash
    - Issues signed JWT access token
    """
    email_clean = credentials.email.lower().strip()
    user = db.query(User).filter(User.email == email_clean).first()
    
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is disabled. Please contact an administrator.",
        )

    token_payload = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
        "full_name": user.full_name,
    }
    access_token = create_access_token(token_payload)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_active_user)):
    """Retrieve the currently authenticated user's profile."""
    return UserResponse.model_validate(current_user)


@router.post("/seed-users", response_model=MessageResponse)
def seed_default_users(db: Session = Depends(get_db)):
    """Seed default test accounts for all 3 assessment roles.

    Creates:
    - Admin: admin@recruitment.ai / Admin@12345
    - Interviewer: interviewer@recruitment.ai / Interviewer@12345
    - Candidate: candidate@recruitment.ai / Candidate@12345
    """
    defaults = [
        {
            "email": "admin@recruitment.ai",
            "password": "Admin@12345",
            "full_name": "System Administrator",
            "role": UserRole.ADMIN.value,
        },
        {
            "email": "interviewer@recruitment.ai",
            "password": "Interviewer@12345",
            "full_name": "Technical Interviewer",
            "role": UserRole.INTERVIEWER.value,
        },
        {
            "email": "candidate@recruitment.ai",
            "password": "Candidate@12345",
            "full_name": "John Doe (Candidate)",
            "role": UserRole.CANDIDATE.value,
        },
    ]

    created_count = 0
    for item in defaults:
        existing = db.query(User).filter(User.email == item["email"]).first()
        if not existing:
            user = User(
                email=item["email"],
                full_name=item["full_name"],
                hashed_password=hash_password(item["password"]),
                role=item["role"],
                is_active=True,
            )
            db.add(user)
            created_count += 1

    db.commit()
    return MessageResponse(
        message=f"Seeding completed. {created_count} users created.",
        detail="Accounts: admin@recruitment.ai, interviewer@recruitment.ai, candidate@recruitment.ai",
    )
