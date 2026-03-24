from typing import Optional, TYPE_CHECKING
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Relationship
from .enums import StatusEnum

if TYPE_CHECKING:
    from .category import Category, CategoryBase

class ProductTemplateBase(SQLModel):
    sku: str = Field(unique=True, index=True)
    product_name: str
    brand: Optional[str] = None
    fixed_selling_price: float
    status: StatusEnum = Field(default=StatusEnum.Active)
    category_id: int = Field(foreign_key="category.id_category")

class ProductTemplate(ProductTemplateBase, table=True):
    __tablename__ = "product_template"
    id_product: Optional[int] = Field(default=None, primary_key=True)
    created_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))

    category: Optional["Category"] = Relationship(back_populates="products")

class ProductTemplateResponse(ProductTemplateBase):
    id_product: int
    created_at: Optional[datetime] = None
    category: Optional["CategoryBase"] = None
