from sqlmodel import Session, select
from .. import models
from fastapi import HTTPException


def get_categories(db: Session, skip: int = 0, limit: int = 100):
    """Obtiene una lista paginada de categorías."""
    statement = select(models.Category).offset(skip).limit(limit)
    return db.exec(statement).all()


def get_category(db: Session, category_id: int):
    """Obtiene una categoría por ID."""
    statement = select(models.Category).where(
        models.Category.id_category == category_id
    )
    category = db.exec(statement).first()
    if not category:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return category


def create_category(db: Session, category: models.CategoryBase):
    """Crea una nueva categoría."""
    # Validar que el nombre sea único
    existing = db.exec(
        select(models.Category).where(
            models.Category.category_name == category.category_name
        )
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="La categoría ya existe")
    
    db_category = models.Category(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


def update_category(db: Session, category_id: int, category: models.CategoryBase):
    """Actualiza una categoría existente."""
    db_category = db.get(models.Category, category_id)
    if not db_category:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    
    # Validar que el nuevo nombre sea único (si cambió)
    if category.category_name != db_category.category_name:
        existing = db.exec(
            select(models.Category).where(
                models.Category.category_name == category.category_name
            )
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="La categoría ya existe")
    
    category_data = category.dict(exclude_unset=True)
    db_category.sqlmodel_update(category_data)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


def delete_category(db: Session, category_id: int):
    """Elimina una categoría."""
    db_category = db.get(models.Category, category_id)
    if not db_category:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    
    # Validar que no tenga productos asociados
    if db_category.products:
        raise HTTPException(
            status_code=400,
            detail=f"No se puede eliminar la categoría porque tiene {len(db_category.products)} producto(s) asociado(s)"
        )
    
    db.delete(db_category)
    db.commit()
    return {"detail": "Categoría eliminada correctamente"}
