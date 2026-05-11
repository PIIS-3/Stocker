from collections.abc import Sequence

from sqlmodel import Session, col, select

from .. import models

# El CRUD siempre devuelve el modelo ORM `ProductTemplate`, nunca `ProductTemplateResponse`.
# La conversión ORM → schema de respuesta la hace FastAPI automáticamente
# a través del parámetro response_model=ProductTemplateResponse declarado en cada endpoint.
# Esto mantiene el CRUD agnóstico de la capa de presentación (principio SRP).


# ── Read ─────────────────────────────────────────────────────────────


def get_products(db: Session, skip: int = 0, limit: int = 100) -> Sequence[models.ProductTemplate]:
    """Devuelve la lista de plantillas de producto con paginación.

    Args:
        skip:  Registros a saltar (offset). Ej: página 2 con limit=10 → skip=10.
        limit: Máximo de registros a devolver.
    """
    return db.exec(
        select(models.ProductTemplate)
        .order_by(col(models.ProductTemplate.id_product))
        .offset(skip)
        .limit(limit)
    ).all()


def get_product_by_id(db: Session, product_id: int) -> models.ProductTemplate | None:
    """Devuelve una plantilla de producto por su ID, o None si no existe."""
    return db.exec(
        select(models.ProductTemplate).where(models.ProductTemplate.id_product == product_id)
    ).first()


def get_product_by_sku(db: Session, sku: str) -> models.ProductTemplate | None:
    """Devuelve una plantilla de producto por su SKU exacto, o None si no existe.

    Se usa para dos propósitos:
    - Validar unicidad de SKU antes de crear o actualizar.
    - Búsqueda directa desde GET /products/by-sku/{sku}.
    """
    return db.exec(select(models.ProductTemplate).where(models.ProductTemplate.sku == sku)).first()


def get_product_by_name(db: Session, product_name: str) -> models.ProductTemplate | None:
    """Devuelve la primera plantilla cuyo product_name coincida exactamente.

    Nota: product_name no tiene restricción UNIQUE en BD, por lo que puede
    existir más de un producto con el mismo nombre. Este método devuelve el
    primero por id_product. Usar get_product_by_sku para búsquedas únicas.
    """
    return db.exec(
        select(models.ProductTemplate)
        .where(models.ProductTemplate.product_name == product_name)
        .order_by(col(models.ProductTemplate.id_product))
    ).first()


# ── Create ───────────────────────────────────────────────────────────


def create_product(
    db: Session,
    product_in: models.ProductTemplateCreate,
) -> models.ProductTemplate:
    """Inserta una nueva plantilla de producto y devuelve el registro creado."""
    # model_validate convierte el schema ProductTemplateCreate al modelo ORM ProductTemplate.
    db_product = models.ProductTemplate.model_validate(product_in)
    db.add(db_product)
    db.commit()
    # db.refresh sincroniza el objeto Python con la fila en BD:
    # recoge el id_product (SERIAL), created_at y updated_at (DEFAULT NOW())
    # que PostgreSQL asignó durante el INSERT. ProductTemplate hereda estos campos
    # de TimestampMixin — existen en el modelo, pero su valor es None
    # hasta que la BD los rellena y el refresh los trae de vuelta.
    db.refresh(db_product)
    return db_product


# ── Update ───────────────────────────────────────────────────────────


def update_product(
    db: Session,
    product_id: int,
    product_in: models.ProductTemplateUpdate,
) -> models.ProductTemplate | None:
    """Actualiza parcialmente una plantilla de producto (PATCH) y devuelve el registro actualizado.

    Args:
        product_id: ID del producto a modificar.
        product_in: Campos a cambiar. Solo se aplican los enviados explícitamente.

    Returns:
        El registro actualizado, o None si no existe un producto con ese ID.
    """
    db_product = get_product_by_id(db, product_id)
    if db_product is None:
        return None  # El endpoint convierte este None en HTTP 404.

    # exclude_unset=True garantiza que solo se modifican los campos que el
    # cliente envió en el JSON. Si manda {"product_name": "X"}, sku y
    # fixed_selling_price quedan intactos.
    update_data = product_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_product, field, value)

    db.add(db_product)
    db.commit()
    # db.refresh trae el updated_at que el trigger BEFORE UPDATE de PostgreSQL
    # asignó automáticamente durante el UPDATE.
    db.refresh(db_product)
    return db_product


# ── Delete ───────────────────────────────────────────────────────────


def delete_product(db: Session, product_id: int) -> models.ProductTemplate | None:
    """Elimina una plantilla de producto y devuelve el registro tal como era antes de borrarse.

    Returns:
        El registro eliminado, o None si no existe un producto con ese ID.
    """
    db_product = get_product_by_id(db, product_id)
    if db_product is None:
        return None  # El endpoint convierte este None en HTTP 404.

    db.delete(db_product)
    # Cargamos la relación category antes de expulsar para que sea serializable
    _ = db_product.category
    db.flush()
    db.expunge(db_product)
    db.commit()
    return db_product


def get_product_templates(db: Session, skip: int = 0, limit: int = 100):
    """Alias legado para compatibilidad retroactiva."""
    return get_products(db, skip=skip, limit=limit)
