from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.api.deps import get_current_user
from app.core.security import create_access_token
from app.crud.auth import authenticate_employee
from app.database import get_db
from app.models.employee import Employee
from app.schemas.auth import CurrentUserResponse, LoginRequest, TokenResponse

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
def login(login_in: LoginRequest, db: Session = Depends(get_db)):
    employee = authenticate_employee(db, login_in.username, login_in.password)

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
        )

    role_name = employee.role.role_name.value if employee.role else "Staff"

    access_token = create_access_token(
        subject=employee.id_employee,
        role=role_name,
    )

    return TokenResponse(access_token=access_token)


@router.get("/me", response_model=CurrentUserResponse)
def read_me(current_user: Employee = Depends(get_current_user)):
    return CurrentUserResponse(
        id_employee=current_user.id_employee,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        username=current_user.username,
        status=current_user.status,
        role_id=current_user.role_id,
        store_id=current_user.store_id,
        role_name=current_user.role.role_name if current_user.role else None,
    )