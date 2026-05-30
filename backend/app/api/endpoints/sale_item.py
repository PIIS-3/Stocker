from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session

from ... import models
from ...crud import sale_item as crud_sale_item
from ...database import get_db
from ..deps import get_current_admin, get_current_employee

router = APIRouter(tags=["Líneas de venta"], dependencies=[Depends(get_current_employee)])

_404 = {404: {"description": "Línea de venta no encontrada."}}
_400 = {400: {"description": "La venta o producto especificados no existen."}}


# ── GET /sale-items/ ─────────────────────────────────────────────────


@router.get(
    "/",
    response_model=list[models.SaleItemResponse],
    summary="Listar líneas de venta",
    description="Devuelve una lista paginada de todas las líneas de venta.",
)
def read_sale_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_sale_item.get_sale_items(db, skip=skip, limit=limit)


# ── GET /sale-items/by-sale/{sale_id} ───────────────────────────────


@router.get(
    "/by-sale/{sale_id}",
    response_model=list[models.SaleItemResponse],
    summary="Listar líneas por venta",
    description="Devuelve todas las líneas de una venta específica.",
)
def read_items_by_sale(
    sale_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    return crud_sale_item.get_items_by_sale(db, sale_id=sale_id, skip=skip, limit=limit)


# ── GET /sale-items/by-product/{product_id} ─────────────────────────


@router.get(
    "/by-product/{product_id}",
    response_model=list[models.SaleItemResponse],
    summary="Listar líneas por producto",
    description="Devuelve todas las líneas de venta de un producto específico.",
)
def read_items_by_product(
    product_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    return crud_sale_item.get_items_by_product(db, product_id=product_id, skip=skip, limit=limit)


# ── GET /sale-items/{item_id} ────────────────────────────────────────


@router.get(
    "/{item_id}",
    response_model=models.SaleItemResponse,
    responses=_404,
    summary="Obtener línea de venta por ID",
    description="Recupera una línea de venta por su identificador único.",
)
def read_sale_item(item_id: int, db: Session = Depends(get_db)):
    db_item = crud_sale_item.get_sale_item_by_id(db, item_id=item_id)
    if db_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Línea de venta no encontrada."
        )
    return db_item


# ── POST /sale-items/ ────────────────────────────────────────────────


@router.post(
    "/",
    response_model=models.SaleItemResponse,
    status_code=status.HTTP_201_CREATED,
    responses=_400,
    summary="Registrar línea de venta",
    description="Crea una nueva línea de venta asociada a una venta existente.",
)
def create_sale_item(item_in: models.SaleItemCreate, db: Session = Depends(get_db)):
    try:
        return crud_sale_item.create_sale_item(db, item_in=item_in)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La venta o producto especificados no existen.",
        )


# ── PATCH /sale-items/{item_id} ──────────────────────────────────────


@router.patch(
    "/{item_id}",
    response_model=models.SaleItemResponse,
    responses=_404,
    summary="Actualizar línea de venta",
    description="Modifica parcialmente quantity, unit_price y/o subtotal de una línea.",
)
def update_sale_item(item_id: int, item_in: models.SaleItemUpdate, db: Session = Depends(get_db)):
    updated = crud_sale_item.update_sale_item(db, item_id=item_id, item_in=item_in)
    if updated is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Línea de venta no encontrada."
        )
    return updated


# ── DELETE /sale-items/{item_id} ─────────────────────────────────────


@router.delete(
    "/{item_id}",
    response_model=models.SaleItemResponse,
    responses=_404,
    summary="Eliminar línea de venta",
    description="Borra definitivamente una línea de venta.",
    dependencies=[Depends(get_current_admin)],
)
def delete_sale_item(item_id: int, db: Session = Depends(get_db)):
    deleted = crud_sale_item.delete_sale_item(db, item_id=item_id)
    if deleted is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Línea de venta no encontrada."
        )
    return deleted
