from datetime import datetime
from typing import TYPE_CHECKING, Optional

from pydantic import ConfigDict
from sqlmodel import Field, Relationship, SQLModel

from .mixins import TimestampMixin

if TYPE_CHECKING:
    from .product import ProductTemplate
    from .sale import Sale


# ── SaleItemBase ─────────────────────────────────────────────────────
# Campos de negocio compartidos por SaleItemCreate y SaleItemResponse.
class SaleItemBase(SQLModel):
    sale_id: int = Field(
        foreign_key="sale.id_sale",
        description="ID de la venta a la que pertenece esta línea.",
    )
    product_id: int = Field(
        foreign_key="product_template.id_product",
        description="ID del producto vendido.",
    )
    quantity: int = Field(
        ge=1,
        description="Cantidad de unidades vendidas.",
    )
    unit_price: float = Field(
        ge=0,
        description="Precio unitario en el momento de la venta (snapshot del precio).",
    )
    subtotal: float = Field(
        ge=0,
        description="Subtotal de la línea (quantity × unit_price).",
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "sale_id": 1,
                "product_id": 3,
                "quantity": 2,
                "unit_price": 125.00,
                "subtotal": 250.00,
            }
        }
    )


# ── SaleItemCreate ───────────────────────────────────────────────────
# Schema de entrada para POST /sales/{id}/items.
class SaleItemCreate(SaleItemBase):
    pass


# ── SaleItemUpdate ───────────────────────────────────────────────────
# Schema de entrada para PATCH /sales/{id}/items/{item_id}.
class SaleItemUpdate(SQLModel):
    quantity: int | None = Field(
        default=None,
        ge=1,
        description="Nueva cantidad de unidades.",
    )
    unit_price: float | None = Field(
        default=None,
        ge=0,
        description="Nuevo precio unitario.",
    )
    subtotal: float | None = Field(
        default=None,
        ge=0,
        description="Nuevo subtotal de la línea.",
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "quantity": 3,
                "unit_price": 125.00,
                "subtotal": 375.00,
            }
        }
    )


# ── SaleItem ─────────────────────────────────────────────────────────
# Modelo ORM — representa la tabla 'sale_item' en PostgreSQL.
# Cada fila es una línea de producto dentro de una venta.
class SaleItem(TimestampMixin, SaleItemBase, table=True):
    __tablename__ = "sale_item"

    id_sale_item: int | None = Field(default=None, primary_key=True)

    sale: Optional["Sale"] = Relationship(back_populates="items")
    product: Optional["ProductTemplate"] = Relationship(back_populates="sale_items")


# ── SaleItemResponse ─────────────────────────────────────────────────
# Schema de salida para todas las respuestas de la API.
class SaleItemResponse(SaleItemBase):
    id_sale_item: int = Field(description="ID único de la línea de venta.")
    created_at: datetime | None = Field(default=None, description="Fecha de registro.")
    updated_at: datetime | None = Field(default=None, description="Fecha de última actualización.")
