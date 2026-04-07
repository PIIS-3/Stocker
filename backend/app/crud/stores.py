from datetime import datetime, timezone
from typing import Optional
from sqlmodel import Session, select

from .. import models


# ── Consultas ────────────────────────────────────────────────────────

def get_stores(db: Session, skip: int = 0, limit: int = 100) -> list[models.Store]:
    """Lista paginada de tiendas."""
    statement = select(models.Store).offset(skip).limit(limit)
    return db.exec(statement).all()


def get_store(db: Session, store_id: int) -> Optional[models.Store]:
    """Devuelve una tienda por su ID, o None si no existe."""
    return db.get(models.Store, store_id)


def get_store_by_name(db: Session, name: str) -> Optional[models.Store]:
    """Busca una tienda por nombre exacto (para validar unicidad)."""
    statement = select(models.Store).where(models.Store.store_name == name)
    return db.exec(statement).first()


# ── Escritura ────────────────────────────────────────────────────────

def create_store(db: Session, store_in: models.StoreCreate) -> models.Store:
    """Crea una nueva tienda en la base de datos."""
    store = models.Store.model_validate(store_in)
    db.add(store)
    db.commit()
    db.refresh(store)
    return store


def update_store(db: Session, store: models.Store, data: models.StoreUpdate) -> models.Store:
    """Actualiza solo los campos enviados (patch-style)."""
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(store, field, value)
    store.updated_at = datetime.now(timezone.utc)
    db.add(store)
    db.commit()
    db.refresh(store)
    return store


def delete_store(db: Session, store: models.Store) -> models.Store:
    """Elimina una tienda de la base de datos."""
    db.delete(store)
    db.commit()
    return store
