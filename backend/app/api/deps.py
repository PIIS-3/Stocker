from collections.abc import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlmodel import Session

from app.core.security import decode_token
from app.crud.auth import get_employee_by_id
from app.database import get_db
from app.models.employee import Employee
from app.models.enums import RoleEnum

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> Employee:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No autenticado",
        )

    token = credentials.credentials

    try:
        payload = decode_token(token)
        employee_id = int(payload["sub"])
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
        )

    employee = get_employee_by_id(db, employee_id)
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado",
        )

    return employee


def require_roles(*allowed_roles: RoleEnum) -> Callable:
    def dependency(current_user: Employee = Depends(get_current_user)) -> Employee:
        if current_user.role is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="El usuario no tiene rol asignado",
            )

        if current_user.role.role_name not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos para realizar esta acción",
            )

        return current_user

    return dependency