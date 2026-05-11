from datetime import datetime

from pydantic import ConfigDict
from sqlmodel import Field, Relationship, SQLModel

from .category import Category, CategoryBase
from .enums import StatusEnum
from .mixins import TimestampMixin


# ── ProductTemplateBase ──────────────────────────────────────────────
# Campos de negocio compartidos por ProductTemplateCreate y ProductTemplateResponse.
# No se usa directamente en la API.
class ProductTemplateBase(SQLModel):
    sku: str = Field(
        unique=True,
        index=True,
        min_length=1,
        description="Código único de Stock Keeping Unit (SKU) del producto.",
    )
    product_name: str = Field(
        min_length=1,
        description="Nombre descriptivo del producto.",
    )
    brand: str | None = Field(
        default=None,
        description="Marca del producto (opcional).",
    )
    fixed_selling_price: float = Field(
        ge=0,
        description="Precio de venta fijo del producto (≥ 0).",
    )
    status: StatusEnum = Field(
        default=StatusEnum.Active,
        description="Estado operativo del producto (Active / Inactive).",
    )
    category_id: int = Field(
        foreign_key="category.id_category",
        description="ID de la categoría a la que pertenece el producto.",
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "sku": "ELEC-SMART-001",
                "product_name": "iPhone 15 Pro",
                "brand": "Apple",
                "fixed_selling_price": 1200.00,
                "status": "Active",
                "category_id": 1,
            }
        }
    )


# ── ProductTemplateCreate ────────────────────────────────────────────
# Schema de entrada para POST /products/.
# No incluye id_product, created_at ni updated_at — los genera la BD.
class ProductTemplateCreate(ProductTemplateBase):
    pass


# ── ProductTemplateUpdate ────────────────────────────────────────────
# Schema de entrada para PATCH /products/{id}.
# Todos los campos son opcionales para permitir actualizaciones parciales.
# No hereda ProductTemplateBase para no forzar campos obligatorios en un PATCH.
class ProductTemplateUpdate(SQLModel):
    sku: str | None = Field(
        default=None,
        min_length=1,
        description="Nuevo código SKU (debe ser único).",
    )
    product_name: str | None = Field(
        default=None,
        min_length=1,
        description="Nuevo nombre del producto.",
    )
    brand: str | None = Field(
        default=None,
        description="Nueva marca del producto.",
    )
    fixed_selling_price: float | None = Field(
        default=None,
        ge=0,
        description="Nuevo precio de venta fijo (≥ 0).",
    )
    status: StatusEnum | None = Field(
        default=None,
        description="Nuevo estado operativo (Active / Inactive).",
    )
    category_id: int | None = Field(
        default=None,
        description="ID de la nueva categoría asociada.",
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "product_name": "iPhone 15 Pro Max",
                "fixed_selling_price": 1350.00,
                "status": "Inactive",
            }
        }
    )


# ── ProductTemplate ──────────────────────────────────────────────────
# Modelo ORM — representa la tabla 'product_template' en PostgreSQL.
# No se usa directamente en request/response de la API.
class ProductTemplate(TimestampMixin, ProductTemplateBase, table=True):
    __tablename__ = "product_template"
    # None antes de persistir; PostgreSQL asigna el ID vía secuencia SERIAL.
    id_product: int | None = Field(default=None, primary_key=True)

    # Relación lazy muchos-a-uno. Se serializa en ProductTemplateResponse
    # como CategoryBase (sin la lista de productos anidados).
    category: Category | None = Relationship(back_populates="products")


# ── ProductTemplateResponse ──────────────────────────────────────────
# Schema de salida para todas las respuestas de la API.
# Extiende ProductTemplateBase añadiendo id, timestamps y categoría anidada.
class ProductTemplateResponse(ProductTemplateBase):
    id_product: int = Field(description="ID único de la plantilla de producto.")
    created_at: datetime | None = Field(default=None, description="Fecha de registro.")
    updated_at: datetime | None = Field(default=None, description="Fecha de última actualización.")
    category: CategoryBase | None = Field(
        default=None, description="Información de la categoría asociada."
    )
