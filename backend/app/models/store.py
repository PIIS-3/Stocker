from datetime import datetime
from typing import TYPE_CHECKING

from pydantic import ConfigDict
from sqlmodel import Field, Relationship, SQLModel

from .enums import StatusEnum
from .mixins import TimestampMixin

if TYPE_CHECKING:
    from .employee import Employee
    from .sale import Sale
    from .stock import Stock


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

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "store_name": "Stocker Central - Madrid",
                "address": "Calle de la Gran Vía, 28, 28013 Madrid, España",
                "status": "Active",
            }
        }
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
    store_name: str | None = Field(
        default=None, min_length=1, description="Nuevo nombre (debe ser único)."
    )
    address: str | None = Field(default=None, min_length=1, description="Nueva dirección física.")
    status: StatusEnum | None = Field(default=None, description="Nuevo estado operativo.")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "store_name": "Stocker Express - Chamberí",
                "address": "Calle de Fuencarral, 120, 28010 Madrid",
                "status": "Inactive",
            }
        }
    )


# ── Store ────────────────────────────────────────────────────────────
# Modelo ORM — representa la tabla 'store' en PostgreSQL.
# No se usa directamente en request/response de la API.
class Store(TimestampMixin, StoreBase, table=True):
    # None antes de persistir; PostgreSQL asigna el ID vía secuencia SERIAL.
    id_store: int | None = Field(default=None, primary_key=True)

    # Relación lazy uno-a-muchos. No se incluye en StoreResponse,
    # por lo que FastAPI nunca lo devuelve en los JSON de la API.
    employees: list["Employee"] = Relationship(back_populates="store")
    stocks: list["Stock"] = Relationship(back_populates="store")
    sales: list["Sale"] = Relationship(back_populates="store")


# ── StoreResponse ────────────────────────────────────────────────────
# Schema de salida para todas las respuestas de la API.
# Extiende StoreBase añadiendo id y timestamps generados por la BD.
class StoreResponse(StoreBase):
    id_store: int = Field(description="ID único de la tienda.")
    created_at: datetime | None = Field(default=None, description="Fecha de registro.")
    updated_at: datetime | None = Field(default=None, description="Fecha de última actualización.")
