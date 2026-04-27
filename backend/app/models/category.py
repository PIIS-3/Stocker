from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship

from .enums import StatusEnum
from .mixins import TimestampMixin

if TYPE_CHECKING:
    from .product import ProductTemplate


# ── CategoryBase ─────────────────────────────────────────────────────────
# Campos de negocio compartidos por CategoryCreate y CategoryResponse.
# No se usa directamente en la API.
class CategoryBase(SQLModel):
    category_name: str = Field(
        unique=True, index=True, min_length=1, description="Nombre único de la categoría."
    )
    description: Optional[str] = Field(
        default=None, description="Descripción detallada de la categoría."
    )
    status: StatusEnum = Field(
        default=StatusEnum.Active, description="Estado operativo (Active / Inactive)."
    )


# ── CategoryCreate ───────────────────────────────────────────────────────
# Schema de entrada para POST /categories/.
# No incluye id_category, created_at ni updated_at — los genera la BD.
class CategoryCreate(CategoryBase):
    pass


# ── CategoryUpdate ───────────────────────────────────────────────────────
# Schema de entrada para PATCH /categories/{id}.
# Todos los campos son opcionales para permitir actualizaciones parciales.
class CategoryUpdate(SQLModel):
    category_name: Optional[str] = Field(
        default=None, min_length=1, description="Nuevo nombre (debe ser único)."
    )
    description: Optional[str] = Field(
        default=None, description="Nueva descripción detallada."
    )
    status: Optional[StatusEnum] = Field(
        default=None, description="Nuevo estado operativo."
    )


# ── Category ─────────────────────────────────────────────────────────────
# Modelo ORM — representa la tabla 'category' en PostgreSQL.
# No se usa directamente en request/response de la API.
class Category(TimestampMixin, CategoryBase, table=True):
    # None antes de persistir; PostgreSQL asigna el ID vía secuencia SERIAL.
    id_category: Optional[int] = Field(default=None, primary_key=True)

    # Relación lazy uno-a-muchos. No se incluye en CategoryResponse,
    # por lo que FastAPI nunca lo devuelve en los JSON de la API.
    products: List["ProductTemplate"] = Relationship(back_populates="category")


# ── CategoryResponse ─────────────────────────────────────────────────────
# Schema de salida para todas las respuestas de la API.
# Extiende CategoryBase añadiendo id y timestamps generados por la BD.
class CategoryResponse(CategoryBase):
    id_category: int = Field(description="ID único de la categoría.")
    created_at: Optional[datetime] = Field(default=None, description="Fecha de registro.")
    updated_at: Optional[datetime] = Field(default=None, description="Fecha de última actualización.")
