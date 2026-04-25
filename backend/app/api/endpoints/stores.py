from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List

from ... import models
from ...crud import stores as crud_stores
from ...database import get_db

router = APIRouter()

# Respuestas comunes documentadas en Swagger para todos los endpoints.
_404 = {404: {"description": "Tienda no encontrada."}}
_409 = {409: {"description": "Ya existe una tienda con ese nombre."}}


# ── GET /stores/ ─────────────────────────────────────────────────────

@router.get("/", response_model=List[models.StoreResponse])
def read_stores(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """Devuelve la lista de tiendas con paginación."""
    return crud_stores.get_stores(db, skip=skip, limit=limit)


# ── GET /stores/by-name/{store_name} ────────────────────────────────
# IMPORTANTE: debe declararse ANTES de /{store_id} para que FastAPI
# no trate la cadena "by-name" como un valor entero de store_id.

@router.get("/by-name/{store_name}", response_model=models.StoreResponse, responses=_404)
def read_store_by_name(store_name: str, db: Session = Depends(get_db)):
    """Devuelve una tienda por su nombre exacto."""
    db_store = crud_stores.get_store_by_name(db, store_name=store_name)
    if db_store is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tienda no encontrada.")
    return db_store


# ── GET /stores/{store_id} ───────────────────────────────────────────

@router.get("/{store_id}", response_model=models.StoreResponse, responses=_404)
def read_store(store_id: int, db: Session = Depends(get_db)):
    """Devuelve una tienda por su ID numérico."""
    db_store = crud_stores.get_store_by_id(db, store_id=store_id)
    if db_store is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tienda no encontrada.")
    return db_store


# ── POST /stores/ ────────────────────────────────────────────────────

@router.post(
    "/",
    response_model=models.StoreResponse,
    status_code=status.HTTP_201_CREATED,
    responses=_409,
)
def create_store(store_in: models.StoreCreate, db: Session = Depends(get_db)):
    """Crea una nueva tienda."""
    if crud_stores.get_store_by_name(db, store_name=store_in.store_name):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe una tienda con ese nombre."
        )
    return crud_stores.create_store(db, store_in=store_in)


# ── PATCH /stores/{store_id} ─────────────────────────────────────────

@router.patch(
    "/{store_id}",
    response_model=models.StoreResponse,
    responses={**_404, **_409},
)
def update_store(
    store_id: int,
    store_in: models.StoreUpdate,
    db: Session = Depends(get_db),
):
    """Actualiza parcialmente una tienda. Solo se modifican los campos enviados."""
    # Validar unicidad de nombre solo si el cliente envió store_name.
    # Se comprueba con `is not None` (no truthy) porque una cadena vacía
    # ya la rechaza Pydantic por min_length=1 antes de llegar aquí.
    if store_in.store_name is not None:
        existing = crud_stores.get_store_by_name(db, store_name=store_in.store_name)
        # Si la tienda encontrada ES la misma que estamos editando, no es conflicto.
        # Esto permite enviar el mismo nombre sin obtener un 409 innecesario.
        if existing is not None and existing.id_store != store_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Ya existe una tienda con ese nombre."
            )

    updated = crud_stores.update_store(db, store_id=store_id, store_in=store_in)
    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tienda no encontrada.")
    return updated


# ── DELETE /stores/{store_id} ────────────────────────────────────────

@router.delete("/{store_id}", response_model=models.StoreResponse, responses=_404)
def delete_store(store_id: int, db: Session = Depends(get_db)):
    """Elimina una tienda por su ID. Devuelve el registro tal como era antes de borrarse."""
    deleted = crud_stores.delete_store(db, store_id=store_id)
    if deleted is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tienda no encontrada.")
    return deleted


