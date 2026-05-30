from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session

from ... import models
from ...crud import stock as crud_stock
from ...database import get_db
from ..deps import get_current_admin, get_current_employee

router = APIRouter(tags=["Stock"], dependencies=[Depends(get_current_employee)])

_404 = {404: {"description": "Registro de stock no encontrado."}}
_409 = {409: {"description": "Ya existe un registro de stock para ese producto y tienda."}}
_409_DELETE = {409: {"description": "No se puede eliminar un stock con registros asociados."}}
_400 = {400: {"description": "El producto o tienda especificados no existen."}}


# ── GET /stock/ ──────────────────────────────────────────────────────


@router.get(
    "/",
    response_model=list[models.StockResponse],
    summary="Listar stock",
    description="Devuelve una lista paginada de todos los registros de stock.",
)
def read_stocks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_stock.get_stocks(db, skip=skip, limit=limit)


# ── GET /stock/by-store/{store_id} ──────────────────────────────────


@router.get(
    "/by-store/{store_id}",
    response_model=list[models.StockResponse],
    summary="Listar stock por tienda",
    description="Devuelve todos los registros de stock de una tienda específica.",
)
def read_stocks_by_store(
    store_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    return crud_stock.get_stocks_by_store(db, store_id=store_id, skip=skip, limit=limit)


# ── GET /stock/by-product/{product_id} ──────────────────────────────


@router.get(
    "/by-product/{product_id}",
    response_model=list[models.StockResponse],
    summary="Listar stock por producto",
    description="Devuelve todos los registros de stock de un producto en todas las tiendas.",
)
def read_stocks_by_product(
    product_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    return crud_stock.get_stocks_by_product(db, product_id=product_id, skip=skip, limit=limit)


# ── GET /stock/{stock_id} ────────────────────────────────────────────


@router.get(
    "/{stock_id}",
    response_model=models.StockResponse,
    responses=_404,
    summary="Obtener stock por ID",
    description="Recupera un registro de stock por su identificador único.",
)
def read_stock(stock_id: int, db: Session = Depends(get_db)):
    db_stock = crud_stock.get_stock_by_id(db, stock_id=stock_id)
    if db_stock is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stock no encontrado.")
    return db_stock


# ── POST /stock/ ─────────────────────────────────────────────────────


@router.post(
    "/",
    response_model=models.StockResponse,
    status_code=status.HTTP_201_CREATED,
    responses={**_409, **_400},
    summary="Registrar stock",
    description=(
        "Crea un nuevo registro de stock para un producto en una tienda. "
        "La combinación producto-tienda debe ser única."
    ),
)
def create_stock(stock_in: models.StockCreate, db: Session = Depends(get_db)):
    if crud_stock.get_stock_by_product_and_store(
        db, product_id=stock_in.product_id, store_id=stock_in.store_id
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un registro de stock para ese producto y tienda.",
        )
    try:
        return crud_stock.create_stock(db, stock_in=stock_in)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El producto o tienda especificados no existen.",
        )


# ── PATCH /stock/{stock_id} ──────────────────────────────────────────


@router.patch(
    "/{stock_id}",
    response_model=models.StockResponse,
    responses=_404,
    summary="Actualizar stock",
    description="Modifica parcialmente quantity y/o min_stock de un registro de stock.",
)
def update_stock(stock_id: int, stock_in: models.StockUpdate, db: Session = Depends(get_db)):
    updated = crud_stock.update_stock(db, stock_id=stock_id, stock_in=stock_in)
    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stock no encontrado.")
    return updated


# ── DELETE /stock/{stock_id} ─────────────────────────────────────────


@router.delete(
    "/{stock_id}",
    response_model=models.StockResponse,
    responses={**_404, **_409_DELETE},
    summary="Eliminar stock",
    description="Borra definitivamente un registro de stock.",
    dependencies=[Depends(get_current_admin)],
)
def delete_stock(stock_id: int, db: Session = Depends(get_db)):
    try:
        deleted = crud_stock.delete_stock(db, stock_id=stock_id)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No se puede eliminar el stock porque tiene registros asociados.",
        )

    if deleted is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stock no encontrado.")
    return deleted
