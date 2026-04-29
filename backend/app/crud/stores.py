from sqlmodel import Session, select

from .. import models


# El CRUD siempre devuelve el modelo ORM `Store`, nunca `StoreResponse`.
# La conversión ORM → schema de respuesta la hace FastAPI automáticamente
# a través del parámetro response_model=StoreResponse declarado en cada endpoint.
# Esto mantiene el CRUD agnóstico de la capa de presentación (principio SRP).


# ── Read ─────────────────────────────────────────────────────────────

def get_stores(db: Session, skip: int = 0, limit: int = 100) -> list[models.Store]:
    """Devuelve la lista de tiendas con paginación.

    Args:
        skip:  Registros a saltar (offset). Ej: página 2 con limit=10 → skip=10.
        limit: Máximo de registros a devolver.
    """
    return db.exec(
        select(models.Store).order_by(models.Store.id_store).offset(skip).limit(limit)
    ).all()


def get_store_by_id(db: Session, store_id: int) -> models.Store | None:
    """Devuelve una tienda por su ID, o None si no existe."""
    return db.exec(
        select(models.Store).where(models.Store.id_store == store_id)
    ).first()


def get_store_by_name(db: Session, store_name: str) -> models.Store | None:
    """Devuelve una tienda por su nombre exacto, o None si no existe.

    Se usa para dos propósitos:
    - Validar unicidad de nombre antes de crear o actualizar.
    - Búsqueda directa desde GET /stores/by-name/{store_name}.
    """
    return db.exec(
        select(models.Store).where(models.Store.store_name == store_name)
    ).first()


# ── Create ───────────────────────────────────────────────────────────

def create_store(db: Session, store_in: models.StoreCreate) -> models.Store:
    """Inserta una nueva tienda y devuelve el registro creado con todos sus campos."""
    # model_validate convierte el schema StoreCreate al modelo ORM Store.
    db_store = models.Store.model_validate(store_in)
    db.add(db_store)
    db.commit()
    # db.refresh sincroniza el objeto Python con la fila en BD:
    # recoge el id_store (SERIAL), created_at y updated_at (DEFAULT NOW())
    # que PostgreSQL asignó durante el INSERT. Store hereda estos campos
    # de TimestampMixin — existen en el modelo, pero su valor es None
    # hasta que la BD los rellena y el refresh los trae de vuelta.
    db.refresh(db_store)
    return db_store


# ── Update ───────────────────────────────────────────────────────────

def update_store(
    db: Session,
    store_id: int,
    store_in: models.StoreUpdate,
) -> models.Store | None:
    """Actualiza parcialmente una tienda (PATCH) y devuelve el registro actualizado.

    Args:
        store_id: ID de la tienda a modificar.
        store_in: Campos a cambiar. Solo se aplican los enviados explícitamente.

    Returns:
        El registro actualizado, o None si no existe una tienda con ese ID.
    """
    db_store = get_store_by_id(db, store_id)
    if db_store is None:
        return None  # El endpoint convierte este None en HTTP 404.

    # exclude_unset=True garantiza que solo se modifican los campos que el
    # cliente envió en el JSON. Si manda {"address": "X"}, store_name y
    # status quedan intactos.
    update_data = store_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_store, field, value)

    db.add(db_store)
    db.commit()
    # db.refresh trae el updated_at que el trigger BEFORE UPDATE de PostgreSQL
    # asignó automáticamente durante el UPDATE.
    db.refresh(db_store)
    return db_store


# ── Delete ───────────────────────────────────────────────────────────

def delete_store(db: Session, store_id: int) -> models.Store | None:
    """Elimina una tienda y devuelve el registro tal como era antes de borrarse.

    Returns:
        El registro eliminado, o None si no existe una tienda con ese ID.
    """
    db_store = get_store_by_id(db, store_id)
    if db_store is None:
        return None  # El endpoint convierte este None en HTTP 404.

    db.delete(db_store)
    db.flush()
    db.expunge(db_store)
    db.commit()
    return db_store



