from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List

from ... import models
from ...crud import categories as crud_categories
from ...database import get_db

router = APIRouter()


@router.get("/", response_model=List[models.CategoryResponse])
def read_categories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Obtiene la lista de categorías con paginación.
    
    Parámetros:
    - **skip**: Número de registros a saltar (por defecto 0)
    - **limit**: Número máximo de registros a retornar (por defecto 100)
    """
    categories = crud_categories.get_categories(db, skip=skip, limit=limit)
    return categories


@router.get("/{category_id}", response_model=models.CategoryResponse)
def read_category(category_id: int, db: Session = Depends(get_db)):
    """
    Obtiene los detalles de una categoría específica.
    
    Parámetros:
    - **category_id**: ID de la categoría a obtener
    """
    category = crud_categories.get_category(db, category_id)
    return category


@router.post("/", response_model=models.CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    category: models.CategoryBase,
    db: Session = Depends(get_db)
):
    """
    Crea una nueva categoría.
    
    Validaciones:
    - El nombre de la categoría debe ser único
    - El nombre no puede estar vacío
    - La descripción es opcional (máximo 500 caracteres)
    """
    return crud_categories.create_category(db, category)


@router.put("/{category_id}", response_model=models.CategoryResponse)
def update_category(
    category_id: int,
    category: models.CategoryBase,
    db: Session = Depends(get_db)
):
    """
    Actualiza una categoría existente.
    
    Parámetros:
    - **category_id**: ID de la categoría a actualizar
    
    Validaciones:
    - El nombre de la categoría debe ser único
    - El nombre no puede estar vacío
    """
    return crud_categories.update_category(db, category_id, category)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    """
    Elimina una categoría.
    
    Parámetros:
    - **category_id**: ID de la categoría a eliminar
    
    Nota: No se puede eliminar una categoría que tenga productos asociados.
    """
    crud_categories.delete_category(db, category_id)
    return None
