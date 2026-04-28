from typing import Optional
from datetime import datetime
from pydantic import ConfigDict
from sqlmodel import SQLModel, Field, Relationship

from .enums import StatusEnum
from .category import Category, CategoryBase
from .mixins import TimestampMixin


class ProductTemplateBase(SQLModel):
    sku: str = Field(
        unique=True,
        index=True,
        description="Código único de Stock Keeping Unit (SKU) del producto."
    )
    product_name: str = Field(description="Nombre del producto.")
    brand: Optional[str] = Field(
        default=None,
        description="Marca del producto (opcional)."
    )
    fixed_selling_price: float = Field(
        description="Precio de venta fijo del producto."
    )
    status: StatusEnum = Field(
        default=StatusEnum.Active,
        description="Estado operativo del producto (Active / Inactive)."
    )
    category_id: int = Field(
        foreign_key="category.id_category",
        description="ID de la categoría a la que pertenece el producto."
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "sku": "ELEC-SMART-001",
                "product_name": "iPhone 15 Pro",
                "brand": "Apple",
                "fixed_selling_price": 1200.00,
                "status": "Active",
                "category_id": 1
            }
        }
    )


# Hereda TimestampMixin para created_at y updated_at centralizados.
class ProductTemplate(TimestampMixin, ProductTemplateBase, table=True):
    __tablename__ = "product_template"
    id_product: Optional[int] = Field(default=None, primary_key=True)

    category: Optional[Category] = Relationship(back_populates="products")


class ProductTemplateResponse(ProductTemplateBase):
    id_product: int = Field(description="ID único de la plantilla de producto.")
    created_at: Optional[datetime] = Field(default=None, description="Fecha de registro.")
    category: Optional[CategoryBase] = Field(
        default=None, description="Información de la categoría asociada."
    )
