from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

from .enums import StatusEnum, RoleEnum
from .mixins import TimestampMixin

if TYPE_CHECKING:
    from .employee import Employee


# ── RoleBase ──────────────────────────────────────────────────────────
# Campos de negocio compartidos.
class RoleBase(SQLModel):
    role_name: RoleEnum = Field(
        unique=True,
        description="Nombre único del rol (SuperAdmin, Manager, Staff)."
    )
    status: StatusEnum = Field(
        default=StatusEnum.Active,
        description="Estado operativo del rol (Active / Inactive)."
    )


# ── Role ──────────────────────────────────────────────────────────────
# Modelo ORM — representa la tabla 'role' en PostgreSQL.
class Role(TimestampMixin, RoleBase, table=True):
    # None antes de persistir; PostgreSQL asigna el ID vía secuencia SERIAL.
    id_role: Optional[int] = Field(default=None, primary_key=True)

    # Relación uno-a-muchos con empleados.
    employees: List["Employee"] = Relationship(back_populates="role")

