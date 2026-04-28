from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session
from typing import List

from ... import models
from ...crud import stores as crud_stores
from ...database import get_db

router = APIRouter(tags=["Tiendas"])

# Respuestas comunes documentadas en Swagger para todos los endpoints.
_404 = {404: {"description": "Tienda no encontrada."}}
_409 = {409: {"description": "Ya existe una tienda con ese nombre."}}
_409_DELETE = {
    409: {"description": "No se puede eliminar una tienda con registros asociados."}
}


# ── GET /stores/ ─────────────────────────────────────────────────────

@router.get(
    "/",
    response_model=List[models.StoreResponse],
    summary="Listar todas las tiendas",
    description=(
        "Devuelve una lista paginada de todas las tiendas físicas "
        "registradas en el sistema."
    ),
)
def read_stores(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    return crud_stores.get_stores(db, skip=skip, limit=limit)


# ── GET /stores/by-name/{store_name} ────────────────────────────────

@router.get(
    "/by-name/{store_name}",
    response_model=models.StoreResponse,
    responses=_404,
    summary="Obtener tienda por nombre",
    description=(
        "Busca una tienda específica utilizando su nombre exacto. "
        "Útil para búsquedas directas o validaciones."
    ),
)
def read_store_by_name(store_name: str, db: Session = Depends(get_db)):
    db_store = crud_stores.get_store_by_name(db, store_name=store_name)
    if db_store is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Tienda no encontrada."
        )
    return db_store


# ── GET /stores/{store_id} ───────────────────────────────────────────

@router.get(
    "/{store_id}",
    response_model=models.StoreResponse,
    responses=_404,
    summary="Obtener tienda por ID",
    description=(
        "Recupera el detalle completo de una tienda utilizando su "
        "identificador único numérico."
    ),
)
def read_store(store_id: int, db: Session = Depends(get_db)):
    db_store = crud_stores.get_store_by_id(db, store_id=store_id)
    if db_store is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Tienda no encontrada."
        )
    return db_store


# ── POST /stores/ ────────────────────────────────────────────────────

@router.post(
    "/",
    response_model=models.StoreResponse,
    status_code=status.HTTP_201_CREATED,
    responses=_409,
    summary="Registrar nueva tienda",
    description="Crea un nuevo registro de tienda en el sistema. El nombre debe ser único.",
)
def create_store(store_in: models.StoreCreate, db: Session = Depends(get_db)):
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
    summary="Actualizar datos de tienda",
    description=(
        "Actualiza parcialmente la información de una tienda. "
        "Solo se procesan los campos incluidos en la petición."
    ),
)
def update_store(
    store_id: int,
    store_in: models.StoreUpdate,
    db: Session = Depends(get_db),
):
    # Validar unicidad de nombre solo si el cliente envió store_name.
    if store_in.store_name is not None:
        existing = crud_stores.get_store_by_name(db, store_name=store_in.store_name)
        if existing is not None and existing.id_store != store_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Ya existe una tienda con ese nombre."
            )

    updated = crud_stores.update_store(db, store_id=store_id, store_in=store_in)
    if updated is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Tienda no encontrada."
        )
    return updated


# ── DELETE /stores/{store_id} ────────────────────────────────────────

@router.delete(
    "/{store_id}",
    response_model=models.StoreResponse,
    responses={**_404, **_409_DELETE},
    summary="Dar de baja tienda",
    description="Elimina el registro de una tienda siempre que no tenga empleados asociados.",
)
def delete_store(store_id: int, db: Session = Depends(get_db)):
    try:
        deleted = crud_stores.delete_store(db, store_id=store_id)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No se puede eliminar la tienda porque tiene registros asociados.",
        )

    if deleted is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Tienda no encontrada."
        )
    return deleted



