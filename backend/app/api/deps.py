from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlmodel import Session

from ..core.config import settings
from ..crud import employees as crud_employees
from ..database import get_db
from .. import models

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

_credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="No se pudieron validar las credenciales.",
    headers={"WWW-Authenticate": "Bearer"},
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
