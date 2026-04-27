from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship

from .enums import StatusEnum
from .mixins import TimestampMixin

if TYPE_CHECKING:
    from .employee import Employee


# ── StoreBase ────────────────────────────────────────────────────────
# Campos de negocio compartidos por StoreCreate y StoreResponse.
# No se usa directamente en la API.
class StoreBase(SQLModel):
    store_name: str = Field(
        unique=True, index=True, min_length=1, description="Nombre único de la tienda."
    )
    address: str = Field(min_length=1, description="Dirección física completa.")
    status: StatusEnum = Field(
        default=StatusEnum.Active, description="Estado operativo (Active / Inactive)."
    )


# ── StoreCreate ──────────────────────────────────────────────────────
# Schema de entrada para POST /stores/.
# No incluye id_store, created_at ni updated_at — los genera la BD.
class StoreCreate(StoreBase):
    pass


# ── StoreUpdate ──────────────────────────────────────────────────────
# Schema de entrada para PATCH /stores/{id}.
# Todos los campos son opcionales para permitir actualizaciones parciales.
# No hereda StoreBase para no forzar campos obligatorios en un PATCH.
class StoreUpdate(SQLModel):
    store_name: Optional[str] = Field(
        default=None, min_length=1, description="Nuevo nombre (debe ser único)."
    )
    address: Optional[str] = Field(
        default=None, min_length=1, description="Nueva dirección física."
    )
    status: Optional[StatusEnum] = Field(default=None, description="Nuevo estado operativo.")


# ── Store ────────────────────────────────────────────────────────────
# Modelo ORM — representa la tabla 'store' en PostgreSQL.
# No se usa directamente en request/response de la API.
class Store(TimestampMixin, StoreBase, table=True):
    # None antes de persistir; PostgreSQL asigna el ID vía secuencia SERIAL.
    id_store: Optional[int] = Field(default=None, primary_key=True)

    # Relación lazy uno-a-muchos. No se incluye en StoreResponse,
    # por lo que FastAPI nunca lo devuelve en los JSON de la API.
    employees: List["Employee"] = Relationship(back_populates="store")


# ── StoreResponse ────────────────────────────────────────────────────
# Schema de salida para todas las respuestas de la API.
# Extiende StoreBase añadiendo id y timestamps generados por la BD.
class StoreResponse(StoreBase):
    id_store: int = Field(description="ID único de la tienda.")
    created_at: Optional[datetime] = Field(default=None, description="Fecha de registro.")
    updated_at: Optional[datetime] = Field(default=None, description="Fecha de última actualización.")

