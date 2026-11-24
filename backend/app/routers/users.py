from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, MessageResponse
from app.core.dependencies import get_current_active_user
from app.core.rbac import (
    require_admin,
    require_interviewer,
    require_candidate,
)

router = APIRouter(prefix="/users", tags=["Users & RBAC Verification"])


@router.get("/profile", response_model=UserResponse)
def get_my_profile(current_user: User = Depends(get_current_active_user)):
    """Any authenticated user (Candidate, Admin, or Interviewer) can access their profile."""
    return UserResponse.model_validate(current_user)


@router.get("/admin-only", response_model=MessageResponse)
def admin_only_endpoint(current_user: User = Depends(require_admin)):
    """Protected API: ONLY users with role='admin' are authorized."""
    return MessageResponse(
        message="Access granted to Admin area.",
        detail=f"Authenticated as Admin: {current_user.email} (ID: {current_user.id})"
    )


@router.get("/interviewer-portal", response_model=MessageResponse)
def interviewer_portal_endpoint(current_user: User = Depends(require_interviewer)):
    """Protected API: Accessible to users with role='interviewer' or role='admin'."""
    return MessageResponse(
        message="Access granted to Interviewer Portal.",
        detail=f"Authenticated as {current_user.role}: {current_user.email}"
    )


@router.get("/candidate-portal", response_model=MessageResponse)
def candidate_portal_endpoint(current_user: User = Depends(require_candidate)):
    """Protected API: Accessible to users with role='candidate' or role='admin'."""
    return MessageResponse(
        message="Access granted to Candidate Portal.",
        detail=f"Authenticated as {current_user.role}: {current_user.email}"
    )


@router.get("/", response_model=List[UserResponse])
def list_all_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin-only API: List all registered users."""
    users = db.query(User).offset(skip).limit(limit).all()
    return [UserResponse.model_validate(u) for u in users]
