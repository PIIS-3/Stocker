from fastapi import APIRouter, Depends, HTTPException, status
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
    
    Parámetros:
    - **skip**: Número de registros a saltar (por defecto 0)
    - **limit**: Número máximo de registros a retornar (por defecto 100)
    """
    products = crud_products.get_product_templates(db, skip=skip, limit=limit)
    return products


@router.get("/{product_id}", response_model=models.ProductTemplateResponse)
def read_product(product_id: int, db: Session = Depends(get_db)):
    """
    Obtiene los detalles de una plantilla de producto específica.
    
    Parámetros:
    - **product_id**: ID del producto a obtener
    """
    product = crud_products.get_product_template(db, product_id)
    return product


@router.post("/", response_model=models.ProductTemplateResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product: models.ProductTemplateBase,
    db: Session = Depends(get_db)
):
    """
    Crea una nueva plantilla de producto.
    
    Validaciones:
    - El SKU debe ser único
    - La categoría debe existir
    - El precio debe ser mayor a 0
    - El nombre del producto no puede estar vacío
    """
    return crud_products.create_product_template(db, product)


@router.put("/{product_id}", response_model=models.ProductTemplateResponse)
def update_product(
    product_id: int,
    product: models.ProductTemplateBase,
    db: Session = Depends(get_db)
):
    """
    Actualiza una plantilla de producto existente.
    
    Parámetros:
    - **product_id**: ID del producto a actualizar
    
    Validaciones:
    - El SKU debe ser único
    - La categoría debe existir
    - El precio debe ser mayor a 0
    """
    return crud_products.update_product_template(db, product_id, product)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    """
    Elimina una plantilla de producto.
    
    Parámetros:
    - **product_id**: ID del producto a eliminar
    """
    crud_products.delete_product_template(db, product_id)
    return None
