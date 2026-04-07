from sqlmodel import Session, select
from fastapi import HTTPException, status
from .. import models


def get_product_templates(db: Session, skip: int = 0, limit: int = 100):
    """Consulta paginada de plantillas de producto desde la base de datos."""
    statement = select(models.ProductTemplate).offset(skip).limit(limit)
    return db.exec(statement).all()


def create_product_template(db: Session, product: models.ProductTemplateBase) -> models.ProductTemplate:
    """Crea una nueva plantilla de producto con validaciones de negocio."""
    # Precio negativo
    if product.fixed_selling_price < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El precio de venta no puede ser negativo.",
        )

    # SKU duplicado
    existing = db.exec(
        select(models.ProductTemplate).where(models.ProductTemplate.sku == product.sku)
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Ya existe un producto con el SKU '{product.sku}'.",
        )

    # Categoría inexistente
    category = db.get(models.Category, product.category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"La categoría con id {product.category_id} no existe.",
        )

    db_product = models.ProductTemplate.model_validate(product)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product
