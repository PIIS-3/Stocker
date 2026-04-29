from typing import Optional
from datetime import datetime

from pydantic import ConfigDict
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
    role_id: int = Field(foreign_key="role.id_role", description="ID del rol asignado.")
    store_id: int = Field(foreign_key="store.id_store", description="ID de la tienda asignada.")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "first_name": "Juan",
                "last_name": "García Pérez",
                "username": "jgarcia",
                "status": "Active",
                "role_id": 1,
                "store_id": 1
            }
        }
    )


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
    first_name: Optional[str] = Field(
        default=None,
        min_length=1,
        description="Nombre del empleado."
    )
    last_name: Optional[str] = Field(
        default=None,
        min_length=1,
        description="Apellidos del empleado."
    )
    username: Optional[str] = Field(
        default=None,
        min_length=1,
        description="Nombre de usuario único del empleado."
    )
    status: Optional[StatusEnum] = Field(
        default=None,
        description="Estado del empleado (Active / Inactive)."
    )
    role_id: Optional[int] = Field(
        default=None,
        description="ID del rol del empleado."
    )
    store_id: Optional[int] = Field(
        default=None,
        description="ID de la tienda asignada."
    )
    hashed_password: Optional[str] = Field(
        default=None,
        min_length=1,
        description="Hash de contraseña ya preparado. El CRUD no lo calcula.",
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "first_name": "María",
                "status": "Inactive",
                "role_id": 2
            }
        }
    )


# ── Employee ─────────────────────────────────────────────────────────
# Modelo ORM — representa la tabla 'employee' en PostgreSQL.
# No se usa directamente en request/response de la API.
class Employee(TimestampMixin, EmployeeBase, table=True):
    # None antes de persistir; PostgreSQL asigna el ID vía secuencia SERIAL.
    id_employee: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str

    # Relaciones lazy: FastAPI las serializa en EmployeeResponse como RoleBase / StoreBase
    # (solo los campos de negocio, sin recursión).
    role: Optional[Role] = Relationship(back_populates="employees")
    store: Optional[Store] = Relationship(back_populates="employees")


# ── EmployeeResponse ─────────────────────────────────────────────────
# Schema de salida para todas las respuestas de la API.
# No expone hashed_password.
class EmployeeResponse(EmployeeBase):
    id_employee: int = Field(description="ID único del empleado.")
    created_at: Optional[datetime] = Field(default=None, description="Fecha de registro.")
    updated_at: Optional[datetime] = Field(
        default=None, description="Fecha de última actualización."
    )
    role: Optional[RoleBase] = Field(default=None, description="Información detallada del rol.")
    store: Optional[StoreBase] = Field(
        default=None, description="Información detallada de la tienda."
    )
