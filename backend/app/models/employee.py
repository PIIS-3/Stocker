from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship

from .enums import StatusEnum
from .role import Role, RoleBase
from .store import Store, StoreBase
from .mixins import TimestampMixin


class EmployeeBase(SQLModel):
    first_name: str
    last_name: str
    username: str = Field(unique=True, index=True)
    status: StatusEnum = Field(default=StatusEnum.Active)
    role_id: int = Field(foreign_key="role.id_role")
    store_id: int = Field(foreign_key="store.id_store")


class EmployeeCreate(EmployeeBase):
    password: str


# ── EmployeeUpdate ────────────────────────────────────────────────────
# Schema de entrada para PATCH /employees/{id}.
# Todos los campos son opcionales para permitir actualizaciones parciales.
# No hereda EmployeeBase para no forzar campos obligatorios en un PATCH.
class EmployeeUpdate(SQLModel):
    first_name: Optional[str] = Field(default=None, min_length=1)
    last_name: Optional[str] = Field(default=None, min_length=1)
    username: Optional[str] = Field(
        default=None, min_length=1, description="Nuevo username (debe ser único)."
    )
    status: Optional[StatusEnum] = Field(default=None)
    role_id: Optional[int] = Field(default=None)
    store_id: Optional[int] = Field(default=None)
    password: Optional[str] = Field(
        default=None, min_length=1, description="Nueva contraseña en texto plano. Se almacenará hasheada."
    )


# ── Employee ──────────────────────────────────────────────────────────
# Modelo ORM — representa la tabla 'employee' en PostgreSQL.
# No se usa directamente en request/response de la API.
# Hereda TimestampMixin para created_at y updated_at centralizados.
class Employee(TimestampMixin, EmployeeBase, table=True):
    id_employee: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str

    role: Optional[Role] = Relationship(back_populates="employees")
    store: Optional[Store] = Relationship(back_populates="employees")


# ── EmployeeResponse ──────────────────────────────────────────────────
# Schema de salida para todas las respuestas de la API.
# Nunca incluye password ni hashed_password.
class EmployeeResponse(EmployeeBase):
    id_employee: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    role: Optional[RoleBase] = None
    store: Optional[StoreBase] = None
