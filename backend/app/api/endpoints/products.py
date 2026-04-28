from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List

from ... import models
from ...crud import products as crud_products
from ...database import get_db

router = APIRouter(tags=["Productos"])

# Respuestas comunes documentadas en Swagger.
_404 = {404: {"description": "Producto no encontrado."}}


@router.get(
    "/",
    response_model=List[models.ProductTemplateResponse],
    summary="Listar productos",
    description="Obtiene la lista completa de plantillas de producto con soporte para paginación.",
)
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    products = crud_products.get_products(db, skip=skip, limit=limit)
    return products


@router.get(
    "/{product_id}",
    response_model=models.ProductTemplateResponse,
    responses=_404,
    summary="Obtener producto por ID",
    description=(
        "Recupera la información detallada de una plantilla de producto "
        "mediante su identificador único."
    ),
)
def read_product_by_id(product_id: int, db: Session = Depends(get_db)):
    product = crud_products.get_product_by_id(db, product_id=product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado."
        )
    return product

