from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlmodel import Session

from .. import models
from ..core.config import settings
from ..crud import employees as crud_employees
from ..database import get_db
from ..models.enums import RoleEnum, StatusEnum

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

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

    if employee.status == StatusEnum.Inactive:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Su cuenta está desactivada.",
        )
    return employee


def get_current_admin(
    current_employee: models.Employee = Depends(get_current_employee),
) -> models.Employee:
    """Devuelve el empleado si es SuperAdmin o Manager."""
    if current_employee.role is None or current_employee.role.role_name not in _ADMIN_ROLES:
        raise _forbidden_exception
    return current_employee


def get_current_superadmin(
    current_employee: models.Employee = Depends(get_current_employee),
) -> models.Employee:
    """Devuelve el empleado SOLO si es SuperAdmin."""
    if current_employee.role is None or current_employee.role.role_name != RoleEnum.SuperAdmin:
        raise _forbidden_exception
    return current_employee
