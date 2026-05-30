from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session

from ... import models
from ...crud import sale as crud_sale
from ...database import get_db
from ..deps import get_current_admin, get_current_employee

router = APIRouter(tags=["Ventas"], dependencies=[Depends(get_current_employee)])

_404 = {404: {"description": "Venta no encontrada."}}
_400 = {400: {"description": "El empleado o tienda especificados no existen."}}
_409_DELETE = {409: {"description": "No se puede eliminar una venta con líneas asociadas."}}


# ── GET /sales/ ──────────────────────────────────────────────────────


@router.get(
    "/",
    response_model=list[models.SaleResponse],
    summary="Listar ventas",
    description="Devuelve una lista paginada de todas las ventas.",
)
def read_sales(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_sale.get_sales(db, skip=skip, limit=limit)


# ── GET /sales/by-store/{store_id} ──────────────────────────────────


@router.get(
    "/by-store/{store_id}",
    response_model=list[models.SaleResponse],
    summary="Listar ventas por tienda",
    description="Devuelve todas las ventas de una tienda específica.",
)
def read_sales_by_store(
    store_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    return crud_sale.get_sales_by_store(db, store_id=store_id, skip=skip, limit=limit)


# ── GET /sales/by-employee/{employee_id} ────────────────────────────


@router.get(
    "/by-employee/{employee_id}",
    response_model=list[models.SaleResponse],
    summary="Listar ventas por empleado",
    description="Devuelve todas las ventas procesadas por un empleado específico.",
)
def read_sales_by_employee(
    employee_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    return crud_sale.get_sales_by_employee(db, employee_id=employee_id, skip=skip, limit=limit)


# ── GET /sales/{sale_id} ────────────────────────────────────────────


@router.get(
    "/{sale_id}",
    response_model=models.SaleResponse,
    responses=_404,
    summary="Obtener venta por ID",
    description="Recupera una venta por su identificador único.",
)
def read_sale(sale_id: int, db: Session = Depends(get_db)):
    db_sale = crud_sale.get_sale_by_id(db, sale_id=sale_id)
    if db_sale is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Venta no encontrada.")
    return db_sale


# ── POST /sales/ ─────────────────────────────────────────────────────


@router.post(
    "/",
    response_model=models.SaleResponse,
    status_code=status.HTTP_201_CREATED,
    responses=_400,
    summary="Registrar venta",
    description="Crea una nueva venta.",
)
def create_sale(sale_in: models.SaleCreate, db: Session = Depends(get_db)):
    try:
        return crud_sale.create_sale(db, sale_in=sale_in)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El empleado o tienda especificados no existen.",
        )


# ── PATCH /sales/{sale_id} ───────────────────────────────────────────


@router.patch(
    "/{sale_id}",
    response_model=models.SaleResponse,
    responses=_404,
    summary="Actualizar venta",
    description="Modifica parcialmente el estado o importe total de una venta.",
)
def update_sale(sale_id: int, sale_in: models.SaleUpdate, db: Session = Depends(get_db)):
    updated = crud_sale.update_sale(db, sale_id=sale_id, sale_in=sale_in)
    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Venta no encontrada.")
    return updated


# ── DELETE /sales/{sale_id} ──────────────────────────────────────────


@router.delete(
    "/{sale_id}",
    response_model=models.SaleResponse,
    responses={**_404, **_409_DELETE},
    summary="Eliminar venta",
    description="Borra definitivamente una venta.",
    dependencies=[Depends(get_current_admin)],
)
def delete_sale(sale_id: int, db: Session = Depends(get_db)):
    try:
        deleted = crud_sale.delete_sale(db, sale_id=sale_id)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No se puede eliminar la venta porque tiene líneas asociadas.",
        )

    if deleted is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Venta no encontrada.")
    return deleted
