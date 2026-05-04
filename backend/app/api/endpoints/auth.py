from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Field, Session, SQLModel

from ... import models
from ...core import security
from ...crud import employees as crud_employees
from ...database import get_db

router = APIRouter(tags=["Autenticación"])

_401 = {401: {"description": "Usuario o contraseña incorrectos."}}


class LoginRequest(SQLModel):
    username: str = Field(min_length=1, description="Nombre de usuario.")
    password: str = Field(min_length=1, description="Contraseña en texto plano.")


# ── POST /auth/login ─────────────────────────────────────────────────


@router.post(
    "/login",
    response_model=models.Token,
    responses=_401,
    summary="Iniciar sesión",
    description=(
        "Autentica al empleado con username y password. "
        "Devuelve un token JWT Bearer válido para acceder al resto de endpoints."
    ),
)
def login(login_in: LoginRequest, db: Session = Depends(get_db)):
    employee = crud_employees.get_employee_by_username(db, username=login_in.username)
    is_valid = employee and security.verify_password(login_in.password, employee.hashed_password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    db.refresh(employee)
    role_name = employee.role.role_name.value if employee.role else ""
    token_data = {
        "id_employee": employee.id_employee,
        "username": employee.username,
        "role": role_name,
    }
    access_token = security.create_access_token(data=token_data)
    return models.Token(access_token=access_token, token_type="bearer")
