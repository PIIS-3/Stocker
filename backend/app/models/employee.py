from typing import Optional
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Relationship
from pydantic import field_validator

from .enums import StatusEnum
from .role import Role, RoleBase
from .store import Store, StoreBase


class EmployeeBase(SQLModel):
    first_name: str
    last_name: str
    username: str = Field(unique=True, index=True)
    status: StatusEnum = Field(default=StatusEnum.Active)
    role_id: int = Field(foreign_key="role.id_role")
    store_id: int = Field(foreign_key="store.id_store")


class EmployeeCreate(EmployeeBase):
    password: str


class Employee(EmployeeBase, table=True):
    id_employee: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str
    created_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))

    role: Optional[Role] = Relationship(back_populates="employees")
    store: Optional[Store] = Relationship(back_populates="employees")


class EmployeeResponse(EmployeeBase):
    id_employee: int
    created_at: datetime
    role: Optional[RoleBase] = None
    store: Optional[StoreBase] = None


# ── Schemas de API para /users ────────────────────────────────────────

class UserCreate(SQLModel):
    """Schema de entrada para crear un usuario (POST /users)."""
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=8)
    status: StatusEnum = Field(default=StatusEnum.Active)
    role_id: int
    store_id: int

    @field_validator("first_name", "last_name")
    @classmethod
    def not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("El campo no puede estar vacío o contener solo espacios")
        return v.strip()

    @field_validator("username")
    @classmethod
    def username_not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("El username no puede estar vacío o contener solo espacios")
        return v.strip().lower()


class UserUpdate(SQLModel):
    """Schema de entrada para actualizar un usuario (PUT /users/{id}). Todos opcionales."""
    first_name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    username: Optional[str] = Field(default=None, min_length=3, max_length=50)
    status: Optional[StatusEnum] = None
    role_id: Optional[int] = None
    store_id: Optional[int] = None

    @field_validator("first_name", "last_name")
    @classmethod
    def not_blank(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            raise ValueError("El campo no puede estar vacío o contener solo espacios")
        return v.strip() if v else v

    @field_validator("username")
    @classmethod
    def username_not_blank(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            raise ValueError("El username no puede estar vacío o contener solo espacios")
        return v.strip().lower() if v else v


class UserResponse(SQLModel):
    """Schema de salida para devolver datos de usuario (GET). Sin contraseña."""
    id_employee: int
    first_name: str
    last_name: str
    username: str
    status: StatusEnum
    role_id: int
    store_id: int
    role: Optional[RoleBase] = None
    store: Optional[StoreBase] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

