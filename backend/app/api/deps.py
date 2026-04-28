from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlmodel import Session

from ..core.config import settings
from ..crud import employees as crud_employees
from ..database import get_db
from .. import models
from ..models.enums import RoleEnum

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Roles con permisos de escritura sobre el catálogo:
#   SuperAdmin → administrador global de la BD
#   Manager    → administrador de tienda
_ADMIN_ROLES = {RoleEnum.SuperAdmin, RoleEnum.Manager}

_CREDENTIALS_EXCEPTION = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="No se pudieron validar las credenciales.",
    headers={"WWW-Authenticate": "Bearer"},
)

_FORBIDDEN_EXCEPTION = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail="No tienes permisos suficientes para realizar esta acción.",
)


def get_current_employee(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> models.Employee:
    """Valida el token JWT y devuelve el empleado autenticado. 401 si el token es inválido."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        employee_id: int | None = payload.get("id_employee")
        if employee_id is None:
            raise _CREDENTIALS_EXCEPTION
    except JWTError:
        raise _CREDENTIALS_EXCEPTION

    employee = crud_employees.get_employee_by_id(db, employee_id=employee_id)
    if employee is None:
        raise _CREDENTIALS_EXCEPTION
    return employee


def get_current_admin(
    token: str = Depends(oauth2_scheme),
    current_employee: models.Employee = Depends(get_current_employee),
) -> models.Employee:
    """403 si el empleado autenticado no tiene rol de administrador (SuperAdmin o Manager)."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        role = RoleEnum(payload.get("role", ""))
    except (JWTError, ValueError):
        raise _FORBIDDEN_EXCEPTION

    if role not in _ADMIN_ROLES:
        raise _FORBIDDEN_EXCEPTION
    return current_employee
