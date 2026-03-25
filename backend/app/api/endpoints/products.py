from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List

from ... import models
from ...crud import products as crud_products
from ...database import get_db

router = APIRouter()


@router.get("/", response_model=List[models.ProductTemplateResponse])
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Obtiene la lista de plantillas de producto con paginación."""
    return crud_products.get_product_templates(db, skip=skip, limit=limit)


@router.post("/", response_model=models.ProductTemplateResponse, status_code=status.HTTP_201_CREATED)
def create_product(product: models.ProductTemplateBase, db: Session = Depends(get_db)):
    """Crea una nueva plantilla de producto."""
    return crud_products.create_product_template(db, product)


@router.get("/{product_id}", response_model=models.ProductTemplateResponse)
def read_product(product_id: int, db: Session = Depends(get_db)):
    """Obtiene una plantilla de producto por su ID."""
    db_product = db.get(models.ProductTemplate, product_id)
    if not db_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con id {product_id} no encontrado.",
        )
    return db_product
