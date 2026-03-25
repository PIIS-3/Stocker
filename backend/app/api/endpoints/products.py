from fastapi import APIRouter, Depends
from sqlmodel import Session
from typing import List

from ... import models
from ...crud import products as crud_products
from ...database import get_db

router = APIRouter()

@router.get("/", response_model=List[models.ProductTemplateResponse])
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Obtiene la lista de plantillas de producto con paginación.
    """
    products = crud_products.get_product_templates(db, skip=skip, limit=limit)
    return products
