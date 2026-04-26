from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List

from ... import models
from ...crud import categories as crud_categories
from ...database import get_db

router = APIRouter()

# Respuestas comunes documentadas en Swagger para todos los endpoints.
_404 = {404: {"description": "Categoría no encontrada."}}
_409 = {409: {"description": "Ya existe una categoría con ese nombre."}}


# ── GET /categories/ ─────────────────────────────────────────────────

@router.get("/", response_model=List[models.CategoryResponse])
def read_categories(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """Devuelve la lista de categorías con paginación."""
    return crud_categories.get_categories(db, skip=skip, limit=limit)


# ── GET /categories/by-name/{category_name} ──────────────────────────
# IMPORTANTE: debe declararse ANTES de /{category_id} para que FastAPI
# no trate la cadena "by-name" como un valor entero de category_id.

@router.get("/by-name/{category_name}", response_model=models.CategoryResponse, responses=_404)
def read_category_by_name(category_name: str, db: Session = Depends(get_db)):
    """Devuelve una categoría por su nombre exacto."""
    db_category = crud_categories.get_category_by_name(db, category_name=category_name)
    if db_category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoría no encontrada.")
    return db_category


# ── GET /categories/{category_id} ────────────────────────────────────

@router.get("/{category_id}", response_model=models.CategoryResponse, responses=_404)
def read_category(category_id: int, db: Session = Depends(get_db)):
    """Devuelve una categoría por su ID numérico."""
    db_category = crud_categories.get_category_by_id(db, category_id=category_id)
    if db_category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoría no encontrada.")
    return db_category


# ── POST /categories/ ────────────────────────────────────────────────

@router.post(
    "/",
    response_model=models.CategoryResponse,
    status_code=status.HTTP_201_CREATED,
    responses=_409,
)
def create_category(category_in: models.CategoryCreate, db: Session = Depends(get_db)):
    """Crea una nueva categoría."""
    if crud_categories.get_category_by_name(db, category_name=category_in.category_name):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe una categoría con ese nombre.",
        )
    return crud_categories.create_category(db, category_in=category_in)


# ── PATCH /categories/{category_id} ──────────────────────────────────

@router.patch(
    "/{category_id}",
    response_model=models.CategoryResponse,
    responses={**_404, **_409},
)
def update_category(
    category_id: int,
    category_in: models.CategoryUpdate,
    db: Session = Depends(get_db),
):
    """Actualiza parcialmente una categoría. Solo se modifican los campos enviados."""
    # Validar unicidad de nombre solo si el cliente envió category_name.
    # Se comprueba con `is not None` (no truthy) porque una cadena vacía
    # ya la rechaza Pydantic por min_length=1 antes de llegar aquí.
    if category_in.category_name is not None:
        existing = crud_categories.get_category_by_name(db, category_name=category_in.category_name)
        # Si la categoría encontrada ES la misma que estamos editando, no es conflicto.
        # Esto permite enviar el mismo nombre sin obtener un 409 innecesario.
        if existing is not None and existing.id_category != category_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Ya existe una categoría con ese nombre.",
            )

    updated = crud_categories.update_category(db, category_id=category_id, category_in=category_in)
    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoría no encontrada.")
    return updated


# ── DELETE /categories/{category_id} ─────────────────────────────────

@router.delete("/{category_id}", response_model=models.CategoryResponse, responses=_404)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    """Elimina una categoría por su ID. Devuelve el registro tal como era antes de borrarse."""
    deleted = crud_categories.delete_category(db, category_id=category_id)
    if deleted is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoría no encontrada.")
    return deleted
