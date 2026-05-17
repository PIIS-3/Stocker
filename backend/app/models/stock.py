from datetime import datetime
from typing import TYPE_CHECKING, Optional

import sqlalchemy as sa
from pydantic import ConfigDict
from sqlmodel import Field, Relationship, SQLModel

from .mixins import TimestampMixin

if TYPE_CHECKING:
    from .product import ProductTemplate
    from .store import Store


# ── StockBase ────────────────────────────────────────────────────────
# Campos de negocio compartidos por StockCreate y StockResponse.
class StockBase(SQLModel):
    quantity: int = Field(
        ge=0,
        default=0,
        description="Cantidad actual disponible en stock.",
    )
    min_stock: int = Field(
        ge=0,
        default=0,
        description="Umbral mínimo de stock para alertas en el dashboard.",
    )
    product_id: int = Field(
        foreign_key="product_template.id_product",
        description="ID del producto al que pertenece este stock.",
    )
    store_id: int = Field(
        foreign_key="store.id_store",
        description="ID de la tienda donde se almacena el stock.",
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "quantity": 50,
                "min_stock": 10,
                "product_id": 1,
                "store_id": 1,
            }
        }
    )


# ── StockCreate ──────────────────────────────────────────────────────
# Schema de entrada para POST /stock/.
class StockCreate(StockBase):
    pass


# ── StockUpdate ──────────────────────────────────────────────────────
# Schema de entrada para PATCH /stock/{id}.
# Todos los campos son opcionales para permitir actualizaciones parciales.
class StockUpdate(SQLModel):
    quantity: int | None = Field(
        default=None,
        ge=0,
        description="Nueva cantidad en stock.",
    )
    min_stock: int | None = Field(
        default=None,
        ge=0,
        description="Nuevo umbral mínimo de stock.",
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "quantity": 75,
                "min_stock": 15,
            }
        }
    )


# ── Stock ────────────────────────────────────────────────────────────
# Modelo ORM — representa la tabla 'stock' en PostgreSQL.
# Restricción única (product_id, store_id): cada producto tiene un único
# registro de stock por tienda.
class Stock(TimestampMixin, StockBase, table=True):
    __tablename__ = "stock"
    __table_args__ = (
        sa.UniqueConstraint("product_id", "store_id", name="uq_stock_product_store"),
    )

    id_stock: int | None = Field(default=None, primary_key=True)

    product: Optional["ProductTemplate"] = Relationship(back_populates="stocks")
    store: Optional["Store"] = Relationship(back_populates="stocks")


# ── StockResponse ────────────────────────────────────────────────────
# Schema de salida para todas las respuestas de la API.
class StockResponse(StockBase):
    id_stock: int = Field(description="ID único del registro de stock.")
    created_at: datetime | None = Field(default=None, description="Fecha de registro.")
    updated_at: datetime | None = Field(
        default=None, description="Fecha de última actualización."
    )
