from sqlmodel import Session, select
from .. import models
from fastapi import HTTPException


def get_product_templates(db: Session, skip: int = 0, limit: int = 100):
    """Obtiene una lista paginada de plantillas de producto."""
    statement = select(models.ProductTemplate).offset(skip).limit(limit)
    return db.exec(statement).all()


def get_product_template(db: Session, product_id: int):
    """Obtiene una plantilla de producto por ID."""
    statement = select(models.ProductTemplate).where(
        models.ProductTemplate.id_product == product_id
    )
    product = db.exec(statement).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return product


def create_product_template(db: Session, product: models.ProductTemplateBase):
    """Crea una nueva plantilla de producto."""
    # Validar que la categoría existe
    category = db.get(models.Category, product.category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    
    # Validar que el SKU sea único
    existing = db.exec(
        select(models.ProductTemplate).where(
            models.ProductTemplate.sku == product.sku
        )
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="El SKU ya existe")
    
    db_product = models.ProductTemplate(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


def update_product_template(db: Session, product_id: int, product: models.ProductTemplateBase):
    """Actualiza una plantilla de producto existente."""
    db_product = db.get(models.ProductTemplate, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    # Validar que la categoría existe
    category = db.get(models.Category, product.category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    
    # Validar que el nuevo SKU sea único (si cambió)
    if product.sku != db_product.sku:
        existing = db.exec(
            select(models.ProductTemplate).where(
                models.ProductTemplate.sku == product.sku
            )
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="El SKU ya existe")
    
    product_data = product.dict(exclude_unset=True)
    db_product.sqlmodel_update(product_data)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


def delete_product_template(db: Session, product_id: int):
    """Elimina una plantilla de producto."""
    db_product = db.get(models.ProductTemplate, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    db.delete(db_product)
    db.commit()
    return {"detail": "Producto eliminado correctamente"}
