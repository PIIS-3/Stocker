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

_credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="No se pudieron validar las credenciales.",
    headers={"WWW-Authenticate": "Bearer"},
)

# SuperAdmin → administrador global; Manager → administrador de tienda
_ADMIN_ROLES = {RoleEnum.SuperAdmin, RoleEnum.Manager}

_forbidden_exception = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail="No tienes permisos suficientes para realizar esta acción.",
)


def get_current_employee(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> models.Employee:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        employee_id: int | None = payload.get("id_employee")
        if employee_id is None:
            raise _credentials_exception
    except JWTError:
        raise _credentials_exception

    employee = crud_employees.get_employee_by_id(db, employee_id=employee_id)
    if employee is None:
        raise _credentials_exception
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
        raise _forbidden_exception

    if role not in _ADMIN_ROLES:
        raise _forbidden_exception
    return current_employee
