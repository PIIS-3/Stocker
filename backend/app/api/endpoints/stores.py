from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from ... import models
from ...crud import stores as crud_stores
from ...database import get_db

router = APIRouter()


# ── GET /stores/ — Listar tiendas ────────────────────────────────────

@router.get(
    "/",
    response_model=List[models.StoreResponse],
    summary="Listar tiendas",
    description="Devuelve la lista paginada de todas las tiendas.",
)
def list_stores(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    return crud_stores.get_stores(db, skip=skip, limit=limit)


# ── GET /stores/{store_id} — Detalle de tienda ───────────────────────

@router.get(
    "/{store_id}",
    response_model=models.StoreResponse,
    summary="Obtener tienda por ID",
    description="Devuelve el detalle de una tienda concreta.",
)
def get_store(store_id: int, db: Session = Depends(get_db)):
    store = crud_stores.get_store(db, store_id)
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tienda con id={store_id} no encontrada.",
        )
    return store


# ── POST /stores/ — Crear tienda ─────────────────────────────────────

@router.post(
    "/",
    response_model=models.StoreResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear tienda",
    description="Crea una nueva tienda. El nombre debe ser único.",
)
def create_store(store_in: models.StoreCreate, db: Session = Depends(get_db)):
    existing = crud_stores.get_store_by_name(db, store_in.store_name)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Ya existe una tienda con el nombre '{store_in.store_name}'.",
        )
    return crud_stores.create_store(db, store_in)


# ── PUT /stores/{store_id} — Actualizar tienda ───────────────────────

@router.put(
    "/{store_id}",
    response_model=models.StoreResponse,
    summary="Actualizar tienda",
    description="Actualiza los datos de una tienda. Solo se modifican los campos enviados.",
)
def update_store(
    store_id: int,
    store_in: models.StoreUpdate,
    db: Session = Depends(get_db),
):
    store = crud_stores.get_store(db, store_id)
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tienda con id={store_id} no encontrada.",
        )

    # Validar unicidad del nuevo nombre (si se envía y es diferente al actual)
    if store_in.store_name and store_in.store_name != store.store_name:
        conflict = crud_stores.get_store_by_name(db, store_in.store_name)
        if conflict:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Ya existe una tienda con el nombre '{store_in.store_name}'.",
            )

    return crud_stores.update_store(db, store, store_in)


# ── DELETE /stores/{store_id} — Eliminar tienda ──────────────────────

@router.delete(
    "/{store_id}",
    response_model=models.StoreResponse,
    summary="Eliminar tienda",
    description="Elimina una tienda por su ID. Devuelve los datos de la tienda eliminada.",
)
def delete_store(store_id: int, db: Session = Depends(get_db)):
    store = crud_stores.get_store(db, store_id)
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tienda con id={store_id} no encontrada.",
        )
    return crud_stores.delete_store(db, store)
