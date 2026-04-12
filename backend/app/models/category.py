from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Relationship

from .enums import StatusEnum

if TYPE_CHECKING:
    from .product import ProductTemplate


class CategoryBase(SQLModel):
    category_name: str = Field(unique=True, index=True)
    description: Optional[str] = None
    status: StatusEnum = Field(default=StatusEnum.Active)


class Category(CategoryBase, table=True):
    __tablename__ = "category"
    id_category: Optional[int] = Field(default=None, primary_key=True)
    created_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))

    products: List["ProductTemplate"] = Relationship(back_populates="category")
