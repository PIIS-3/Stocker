from typing import Optional
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Relationship
from pydantic import field_validator

from .enums import StatusEnum
from .category import Category, CategoryBase


class ProductTemplateBase(SQLModel):
    sku: str = Field(min_length=1, max_length=50, index=True, description="SKU único del producto")
    product_name: str = Field(min_length=1, max_length=255, description="Nombre del producto")
    brand: Optional[str] = Field(default=None, max_length=100, description="Marca del producto")
    fixed_selling_price: float = Field(gt=0, description="Precio de venta fijo (debe ser mayor a 0)")
    status: StatusEnum = Field(default=StatusEnum.Active, description="Estado del producto")
    category_id: int = Field(description="ID de la categoría del producto")

    @field_validator("product_name", "sku")
    @classmethod
    def validate_no_empty_strings(cls, v):
        """Valida que campos de texto no estén vacíos o solo con espacios."""
        if isinstance(v, str) and not v.strip():
            raise ValueError("El campo no puede estar vacío")
        return v.strip() if isinstance(v, str) else v

    @field_validator("fixed_selling_price")
    @classmethod
    def validate_price(cls, v):
        """Valida que el precio sea un número decimal válido."""
        if v <= 0:
            raise ValueError("El precio debe ser mayor a 0")
        # Redondear a 2 decimales
        return round(v, 2)


class ProductTemplate(ProductTemplateBase, table=True):
    __tablename__ = "product_template"
    id_product: Optional[int] = Field(default=None, primary_key=True)
    category_id: int = Field(foreign_key="category.id_category")
    created_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))

    category: Optional[Category] = Relationship(back_populates="products")


class ProductTemplateResponse(ProductTemplateBase):
    id_product: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    category: Optional[CategoryBase] = None
