from datetime import datetime, timezone
from typing import TYPE_CHECKING

from pydantic import ConfigDict
from sqlmodel import Field, Relationship, SQLModel

from .enums import SaleStatusEnum
from .mixins import TimestampMixin

if TYPE_CHECKING:
    from .employee import Employee
    from .sale_item import SaleItem
    from .store import Store


# ── SaleBase ─────────────────────────────────────────────────────────
# Campos de negocio compartidos por SaleCreate y SaleResponse.
class SaleBase(SQLModel):
    store_id: int = Field(
        foreign_key="store.id_store",
        description="ID de la tienda donde se realizó la venta.",
    )
    employee_id: int = Field(
        foreign_key="employee.id_employee",
        description="ID del empleado que procesó la venta.",
    )
    total_amount: float = Field(
        ge=0,
        description="Importe total de la venta (suma de subtotales de líneas).",
    )
    status: SaleStatusEnum = Field(
        default=SaleStatusEnum.Completed,
        description="Estado de la venta (Completed / Cancelled / Pending).",
    )
    sale_date: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Fecha y hora en que se realizó la venta.",
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "store_id": 1,
                "employee_id": 2,
                "total_amount": 250.00,
                "status": "Completed",
                "sale_date": "2026-05-16T10:30:00Z",
            }
        }
    )


# ── SaleCreate ───────────────────────────────────────────────────────
# Schema de entrada para POST /sales/.
class SaleCreate(SaleBase):
    pass


# ── SaleUpdate ───────────────────────────────────────────────────────
# Schema de entrada para PATCH /sales/{id}.
# Solo se permite actualizar el estado (ej. cancelar una venta).
class SaleUpdate(SQLModel):
    status: SaleStatusEnum | None = Field(
        default=None,
        description="Nuevo estado de la venta.",
    )
    total_amount: float | None = Field(
        default=None,
        ge=0,
        description="Nuevo importe total (si se recalcula).",
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "status": "Cancelled",
            }
        }
    )


# ── Sale ─────────────────────────────────────────────────────────────
# Modelo ORM — representa la tabla 'sale' en PostgreSQL.
class Sale(TimestampMixin, SaleBase, table=True):
    __tablename__ = "sale"

    id_sale: int | None = Field(default=None, primary_key=True)

    store: "Store | None" = Relationship(back_populates="sales")
    employee: "Employee | None" = Relationship(back_populates="sales")
    items: list["SaleItem"] = Relationship(back_populates="sale")


# ── SaleResponse ─────────────────────────────────────────────────────
# Schema de salida para todas las respuestas de la API.
class SaleResponse(SaleBase):
    id_sale: int = Field(description="ID único de la venta.")
    created_at: datetime | None = Field(default=None, description="Fecha de registro.")
    updated_at: datetime | None = Field(
        default=None, description="Fecha de última actualización."
    )
