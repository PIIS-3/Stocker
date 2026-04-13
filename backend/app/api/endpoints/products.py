from fastapi import APIRouter, Depends, HTTPException
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
    products = crud_products.get_products(db, skip=skip, limit=limit)
    return products


@router.get("/{product_id}", response_model=models.ProductTemplateResponse)
def read_product_by_id(product_id: int, db: Session = Depends(get_db)):
    """Obtiene una plantilla de producto por su ID."""
    product = crud_products.get_product_by_id(db, product_id=product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
