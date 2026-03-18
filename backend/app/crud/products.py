from sqlmodel import Session, select
from .. import models

def get_product_templates(db: Session, skip: int = 0, limit: int = 100):
    statement = select(models.ProductTemplate).offset(skip).limit(limit)
    return db.exec(statement).all()
