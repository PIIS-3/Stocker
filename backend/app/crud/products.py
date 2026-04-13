from sqlmodel import Session, select
from .. import models


def get_products(db: Session, skip: int = 0, limit: int = 100):
    """Obtiene plantillas de producto con paginación usando la sesión activa."""
    statement = select(models.ProductTemplate).offset(skip).limit(limit)
    return db.exec(statement).all()


def get_product_by_id(db: Session, product_id: int):
    """Obtiene una plantilla de producto por su ID primario."""
    statement = select(models.ProductTemplate).where(
        models.ProductTemplate.id_product == product_id
    )
    return db.exec(statement).first()


def get_product_templates(db: Session, skip: int = 0, limit: int = 100):
    """Alias legado para compatibilidad retroactiva."""
    return get_products(db, skip=skip, limit=limit)
