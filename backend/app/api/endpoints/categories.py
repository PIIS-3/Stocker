from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List

from ... import models
from ...crud import categories as crud_categories
from ...database import get_db

router = APIRouter(tags=["Categorías"])

# Respuestas comunes documentadas en Swagger para todos los endpoints.
_404 = {404: {"description": "Categoría no encontrada."}}
_409 = {409: {"description": "Ya existe una categoría con ese nombre."}}


# ── GET /categories/ ─────────────────────────────────────────────────

@router.get(
    "/",
    response_model=List[models.CategoryResponse],
    summary="Listar categorías",
    description="Devuelve una lista de todas las categorías de productos disponibles, con soporte para paginación.",
)
def read_categories(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    return crud_categories.get_categories(db, skip=skip, limit=limit)


# ── GET /categories/by-name/{category_name} ──────────────────────────

@router.get(
    "/by-name/{category_name}",
    response_model=models.CategoryResponse,
    responses=_404,
    summary="Obtener categoría por nombre",
    description="Busca una categoría específica mediante su nombre exacto. Ideal para búsquedas rápidas desde el frontend.",
)
def read_category_by_name(category_name: str, db: Session = Depends(get_db)):
    db_category = crud_categories.get_category_by_name(db, category_name=category_name)
    if db_category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Categoría no encontrada."
        )
    return db_category


# ── GET /categories/{category_id} ────────────────────────────────────

@router.get(
    "/{category_id}",
    response_model=models.CategoryResponse,
    responses=_404,
    summary="Obtener categoría por ID",
    description="Recupera la información completa de una categoría utilizando su identificador único numérico.",
)
def read_category(category_id: int, db: Session = Depends(get_db)):
    db_category = crud_categories.get_category_by_id(db, category_id=category_id)
    if db_category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Categoría no encontrada."
        )
    return db_category


# ── POST /categories/ ────────────────────────────────────────────────

@router.post(
    "/",
    response_model=models.CategoryResponse,
    status_code=status.HTTP_201_CREATED,
    responses=_409,
    summary="Crear nueva categoría",
    description="Registra una nueva categoría en el catálogo. El nombre debe ser único.",
)
def create_category(category_in: models.CategoryCreate, db: Session = Depends(get_db)):
    if crud_categories.get_category_by_name(db, category_name=category_in.category_name):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe una categoría con ese nombre."
        )
    return crud_categories.create_category(db, category_in=category_in)


# ── PATCH /categories/{category_id} ──────────────────────────────────

@router.patch(
    "/{category_id}",
    response_model=models.CategoryResponse,
    responses={**_404, **_409},
    summary="Actualizar categoría",
    description="Permite modificar parcialmente los datos de una categoría. Solo se actualizarán los campos que se incluyan en el cuerpo de la petición.",
)
def update_category(
    category_id: int,
    category_in: models.CategoryUpdate,
    db: Session = Depends(get_db),
):
    # Validar unicidad de nombre solo si el cliente envió category_name.
    if category_in.category_name is not None:
        existing = crud_categories.get_category_by_name(db, category_name=category_in.category_name)
        if existing is not None and existing.id_category != category_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Ya existe una categoría con ese nombre."
            )

    updated = crud_categories.update_category(db, category_id=category_id, category_in=category_in)
    if updated is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Categoría no encontrada."
        )
    return updated


# ── DELETE /categories/{category_id} ─────────────────────────────────

@router.delete(
    "/{category_id}",
    response_model=models.CategoryResponse,
    responses=_404,
    summary="Eliminar categoría",
    description="Borra una categoría del sistema utilizando su ID. No se recomienda borrar categorías que ya tengan productos asociados.",
)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    deleted = crud_categories.delete_category(db, category_id=category_id)
    if deleted is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Categoría no encontrada."
        )
    return deleted

