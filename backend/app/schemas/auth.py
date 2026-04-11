from typing import Optional

from pydantic import BaseModel

from app.models.enums import RoleEnum, StatusEnum


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: str
    role: str
    type: str = "access"
    exp: int


class CurrentUserResponse(BaseModel):
    id_employee: int
    first_name: str
    last_name: str
    username: str
    status: StatusEnum
    role_id: int
    store_id: int
    role_name: Optional[RoleEnum] = None