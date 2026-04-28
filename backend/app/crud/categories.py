from sqlmodel import Session, select

from .. import models


# El CRUD siempre devuelve el modelo ORM `Category`, nunca `CategoryResponse`.
# La conversión ORM → schema de respuesta la hace FastAPI automáticamente
# a través del parámetro response_model=CategoryResponse declarado en cada endpoint.
# Esto mantiene el CRUD agnóstico de la capa de presentación (principio SRP).


# ── Read ─────────────────────────────────────────────────────────────

def get_categories(db: Session, skip: int = 0, limit: int = 100) -> list[models.Category]:
    """Devuelve la lista de categorías con paginación.

    Args:
        skip:  Registros a saltar (offset). Ej: página 2 con limit=10 → skip=10.
        limit: Máximo de registros a devolver.
    """
    return db.exec(select(models.Category).offset(skip).limit(limit)).all()


def get_category_by_id(db: Session, category_id: int) -> models.Category | None:
    """Devuelve una categoría por su ID, o None si no existe."""
    return db.exec(
        select(models.Category).where(models.Category.id_category == category_id)
    ).first()


def get_category_by_name(db: Session, category_name: str) -> models.Category | None:
    """Devuelve una categoría por su nombre exacto, o None si no existe.

    Se usa para dos propósitos:
    - Validar unicidad de nombre antes de crear o actualizar.
    - Búsqueda directa opcional si fuese requerida.
    """
    return db.exec(
        select(models.Category).where(models.Category.category_name == category_name)
    ).first()


# ── Create ───────────────────────────────────────────────────────────

def create_category(db: Session, category_in: models.CategoryCreate) -> models.Category:
    """Inserta una nueva categoría y devuelve el registro creado con todos sus campos."""
    # model_validate convierte el schema CategoryCreate al modelo ORM Category.
    db_category = models.Category.model_validate(category_in)
    db.add(db_category)
    db.commit()
    # db.refresh sincroniza el objeto Python con la fila en BD:
    # recoge el id_category (SERIAL), created_at y updated_at (DEFAULT CURRENT_TIMESTAMP)
    # que PostgreSQL/SQLite asignó durante el INSERT. Category hereda estos campos
    # de TimestampMixin — existen en el modelo, pero su valor es None
    # hasta que la BD los rellena y el refresh los trae de vuelta.
    db.refresh(db_category)
    return db_category


# ── Update ───────────────────────────────────────────────────────────

def update_category(
    db: Session,
    category_id: int,
    category_in: models.CategoryUpdate,
) -> models.Category | None:
    """Actualiza parcialmente una categoría (PATCH) y devuelve el registro actualizado.

    Args:
        category_id: ID de la categoría a modificar.
        category_in: Campos a cambiar. Solo se aplican los enviados explícitamente.

    Returns:
        El registro actualizado, o None si no existe una categoría con ese ID.
    """
    db_category = get_category_by_id(db, category_id)
    if db_category is None:
        return None  # El endpoint convierte este None en HTTP 404.

    # exclude_unset=True garantiza que solo se modifican los campos que el
    # cliente envió en el JSON. Si manda {"description": "X"}, category_name y
    # status quedan intactos.
    update_data = category_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_category, field, value)

    db.add(db_category)
    db.commit()
    # db.refresh trae el updated_at que el trigger BEFORE UPDATE de PostgreSQL
    # asignó automáticamente durante el UPDATE.
    db.refresh(db_category)
    return db_category


# ── Delete ───────────────────────────────────────────────────────────

def delete_category(db: Session, category_id: int) -> models.Category | None:
    """Elimina una categoría y devuelve el registro tal como era antes de borrarse.

    Returns:
        El registro eliminado, o None si no existe una categoría con ese ID.
    """
    db_category = get_category_by_id(db, category_id)
    if db_category is None:
        return None  # El endpoint convierte este None en HTTP 404.

    db.delete(db_category)
    db.commit()
    # No se llama db.refresh: la fila ya no existe en BD.
    return db_category
