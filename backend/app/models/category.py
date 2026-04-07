from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Relationship
from pydantic import field_validator

from .enums import StatusEnum

if TYPE_CHECKING:
    from .product import ProductTemplate


class CategoryBase(SQLModel):
    category_name: str = Field(min_length=1, max_length=100, index=True, description="Nombre único de la categoría")
    description: Optional[str] = Field(default=None, max_length=500, description="Descripción de la categoría")
    status: StatusEnum = Field(default=StatusEnum.Active, description="Estado de la categoría")

    @field_validator("category_name")
    @classmethod
    def validate_category_name(cls, v):
        """Valida que el nombre de la categoría no esté vacío o solo con espacios."""
        if isinstance(v, str) and not v.strip():
            raise ValueError("El nombre de la categoría no puede estar vacío")
        return v.strip() if isinstance(v, str) else v

    @field_validator("description")
    @classmethod
    def validate_description(cls, v):
        """Valida que la descripción no sea solo espacios."""
        if v is not None and isinstance(v, str) and not v.strip():
            return None
        return v.strip() if isinstance(v, str) else v


class Category(CategoryBase, table=True):
    id_category: Optional[int] = Field(default=None, primary_key=True)
    created_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))

    products: List["ProductTemplate"] = Relationship(back_populates="category")


class CategoryResponse(CategoryBase):
    id_category: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
