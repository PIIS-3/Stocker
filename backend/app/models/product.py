from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship

from .enums import StatusEnum
from .category import Category, CategoryBase
from .mixins import TimestampMixin


class ProductTemplateBase(SQLModel):
    sku: str = Field(unique=True, index=True)
    product_name: str
    brand: Optional[str] = None
    fixed_selling_price: float
    status: StatusEnum = Field(default=StatusEnum.Active)
    category_id: int = Field(foreign_key="category.id_category")


# Hereda TimestampMixin para created_at y updated_at centralizados.
class ProductTemplate(TimestampMixin, ProductTemplateBase, table=True):
    __tablename__ = "product_template"
    id_product: Optional[int] = Field(default=None, primary_key=True)

    category: Optional[Category] = Relationship(back_populates="products")


class ProductTemplateResponse(ProductTemplateBase):
    id_product: int
    created_at: Optional[datetime] = None
    category: Optional[CategoryBase] = None
