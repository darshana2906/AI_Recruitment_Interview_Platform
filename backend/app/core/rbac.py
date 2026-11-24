from typing import List, Union
from fastapi import Depends, HTTPException, status
from app.models.user import User, UserRole
from app.core.dependencies import get_current_active_user


class RequireRole:
    """Dependency that enforces Role-Based Access Control (RBAC).

    Raises HTTP 403 Forbidden if the authenticated user does not have one of the required roles.
    """

    def __init__(self, allowed_roles: List[Union[UserRole, str]]):
        self.allowed_roles = [
            r.value if isinstance(r, UserRole) else str(r) for r in allowed_roles
        ]

    def __call__(self, current_user: User = Depends(get_current_active_user)) -> User:
        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"Access denied. Required role: {self.allowed_roles}. "
                    f"Your current role '{current_user.role}' lacks sufficient permissions."
                ),
            )
        return current_user


# Role guards
require_admin = RequireRole([UserRole.ADMIN])
require_interviewer = RequireRole([UserRole.INTERVIEWER, UserRole.ADMIN])
require_candidate = RequireRole([UserRole.CANDIDATE, UserRole.ADMIN])
require_any_authenticated = RequireRole([
    UserRole.ADMIN,
    UserRole.INTERVIEWER,
    UserRole.CANDIDATE,
])
