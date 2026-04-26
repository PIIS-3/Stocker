from typing import Optional
from datetime import datetime

from sqlmodel import SQLModel, Field, Relationship

from .enums import StatusEnum
from .role import Role, RoleBase
from .store import Store, StoreBase
from .mixins import TimestampMixin


# ── EmployeeBase ─────────────────────────────────────────────────────
# Campos de negocio compartidos por EmployeeCreate y EmployeeResponse.
# No incluye id_employee, timestamps ni hashed_password de salida.
class EmployeeBase(SQLModel):
    first_name: str = Field(min_length=1, description="Nombre del empleado.")
    last_name: str = Field(min_length=1, description="Apellidos del empleado.")
    username: str = Field(
        unique=True,
        index=True,
        min_length=1,
        description="Nombre de usuario único del empleado.",
    )
    status: StatusEnum = Field(
        default=StatusEnum.Active,
        description="Estado del empleado (Active / Inactive).",
    )
    role_id: int = Field(foreign_key="role.id_role")
    store_id: int = Field(foreign_key="store.id_store")


# ── EmployeeCreate ───────────────────────────────────────────────────
# Schema de entrada para POST /employees/.
# Se mantiene hashed_password como dato técnico porque la tabla lo requiere,
# pero este CRUD NO implementa hashing ni autenticación. Eso queda para auth/JWT.
class EmployeeCreate(EmployeeBase):
    hashed_password: str = Field(
        min_length=1,
        description="Hash de contraseña ya preparado. El CRUD no lo calcula.",
    )


# ── EmployeeUpdate ───────────────────────────────────────────────────
# Schema de entrada para PATCH /employees/{id}.
# Todos los campos son opcionales para permitir actualizaciones parciales.
class EmployeeUpdate(SQLModel):
    first_name: Optional[str] = Field(default=None, min_length=1)
    last_name: Optional[str] = Field(default=None, min_length=1)
    username: Optional[str] = Field(default=None, min_length=1)
    status: Optional[StatusEnum] = None
    role_id: Optional[int] = None
    store_id: Optional[int] = None
    hashed_password: Optional[str] = Field(
        default=None,
        min_length=1,
        description="Hash ya preparado. No se calcula ni valida en este CRUD.",
    )


# ── Employee ─────────────────────────────────────────────────────────
# Modelo ORM — representa la tabla 'employee' en PostgreSQL.
class Employee(TimestampMixin, EmployeeBase, table=True):
    id_employee: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str

    role: Optional[Role] = Relationship(back_populates="employees")
    store: Optional[Store] = Relationship(back_populates="employees")


# ── EmployeeResponse ─────────────────────────────────────────────────
# Schema de salida para todas las respuestas de la API.
# No expone hashed_password.
class EmployeeResponse(EmployeeBase):
    id_employee: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    role: Optional[RoleBase] = None
    store: Optional[StoreBase] = None
