from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session

from ... import models
from ...crud import products as crud_products
from ...database import get_db
from ..deps import get_current_admin, get_current_employee

router = APIRouter(tags=["Productos"], dependencies=[Depends(get_current_employee)])

# Respuestas comunes documentadas en Swagger para todos los endpoints.
_404 = {404: {"description": "Producto no encontrado."}}
_409 = {409: {"description": "Ya existe un producto con ese SKU."}}
_409_DELETE = {409: {"description": "No se puede eliminar un producto con registros asociados."}}
_400 = {400: {"description": "La categoría especificada no existe."}}


# ── GET /products/ ───────────────────────────────────────────────────


@router.get(
    "/",
    response_model=list[models.ProductTemplateResponse],
    summary="Listar productos",
    description=(
        "Devuelve una lista paginada de todas las plantillas de producto registradas en el sistema."
    ),
)
def read_products(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    return crud_products.get_products(db, skip=skip, limit=limit)


# ── GET /products/by-sku/{sku} ───────────────────────────────────────


@router.get(
    "/by-sku/{sku}",
    response_model=models.ProductTemplateResponse,
    responses=_404,
    summary="Obtener producto por SKU",
    description=(
        "Busca una plantilla de producto utilizando su código SKU exacto. "
        "Útil para búsquedas directas o validaciones de inventario."
    ),
)
def read_product_by_sku(sku: str, db: Session = Depends(get_db)):
    db_product = crud_products.get_product_by_sku(db, sku=sku)
    if db_product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado.")
    return db_product


# ── GET /products/by-name/{product_name} ────────────────────────────


@router.get(
    "/by-name/{product_name}",
    response_model=models.ProductTemplateResponse,
    responses=_404,
    summary="Obtener producto por nombre",
    description=(
        "Busca la primera plantilla de producto que coincida exactamente con el nombre indicado. "
        "Para búsquedas únicas se recomienda usar el endpoint by-sku."
    ),
)
def read_product_by_name(product_name: str, db: Session = Depends(get_db)):
    db_product = crud_products.get_product_by_name(db, product_name=product_name)
    if db_product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado.")
    return db_product


# ── GET /products/{product_id} ───────────────────────────────────────


@router.get(
    "/{product_id}",
    response_model=models.ProductTemplateResponse,
    responses=_404,
    summary="Obtener producto por ID",
    description=(
        "Recupera la información detallada de una plantilla de producto mediante su "
        "identificador único numérico."
    ),
)
def read_product(product_id: int, db: Session = Depends(get_db)):
    db_product = crud_products.get_product_by_id(db, product_id=product_id)
    if db_product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado.")
    return db_product


# ── POST /products/ ──────────────────────────────────────────────────


@router.post(
    "/",
    response_model=models.ProductTemplateResponse,
    status_code=status.HTTP_201_CREATED,
    responses={**_409, **_400},
    summary="Registrar nuevo producto",
    description=(
        "Crea una nueva plantilla de producto en el catálogo. "
        "El SKU debe ser único y la categoría debe existir."
    ),
    dependencies=[Depends(get_current_admin)],
)
def create_product(product_in: models.ProductTemplateCreate, db: Session = Depends(get_db)):
    if crud_products.get_product_by_sku(db, sku=product_in.sku):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un producto con ese SKU.",
        )
    try:
        return crud_products.create_product(db, product_in=product_in)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La categoría especificada no existe.",
        )


# ── PATCH /products/{product_id} ─────────────────────────────────────


@router.patch(
    "/{product_id}",
    response_model=models.ProductTemplateResponse,
    responses={**_404, **_409, **_400},
    summary="Actualizar producto",
    description=(
        "Modifica parcialmente los datos de una plantilla de producto. "
        "Solo se procesan los campos incluidos en la petición."
    ),
    dependencies=[Depends(get_current_admin)],
)
def update_product(
    product_id: int,
    product_in: models.ProductTemplateUpdate,
    db: Session = Depends(get_db),
):
    # Validar unicidad de SKU solo si el cliente envió sku.
    if product_in.sku is not None:
        existing = crud_products.get_product_by_sku(db, sku=product_in.sku)
        if existing is not None and existing.id_product != product_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Ya existe un producto con ese SKU.",
            )

    try:
        updated = crud_products.update_product(db, product_id=product_id, product_in=product_in)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La categoría especificada no existe.",
        )

    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado.")
    return updated


# ── DELETE /products/{product_id} ────────────────────────────────────


@router.delete(
    "/{product_id}",
    response_model=models.ProductTemplateResponse,
    responses={**_404, **_409_DELETE},
    summary="Eliminar producto",
    description=(
        "Borra definitivamente una plantilla de producto del catálogo. "
        "No se puede eliminar si tiene registros de inventario asociados."
    ),
    dependencies=[Depends(get_current_admin)],
)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    try:
        deleted = crud_products.delete_product(db, product_id=product_id)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No se puede eliminar el producto porque tiene registros asociados.",
        )

    if deleted is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado.")
    return deleted
