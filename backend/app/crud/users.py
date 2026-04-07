from datetime import datetime, timezone
from typing import Optional
from sqlmodel import Session, select

from .. import models
from ..core.security import hash_password


# ── Consultas ────────────────────────────────────────────────────────

def get_users(db: Session, skip: int = 0, limit: int = 100) -> list[models.Employee]:
    """Lista paginada de usuarios."""
    statement = select(models.Employee).offset(skip).limit(limit)
    return db.exec(statement).all()


def get_user(db: Session, user_id: int) -> Optional[models.Employee]:
    """Devuelve un usuario por su ID, o None si no existe."""
    return db.get(models.Employee, user_id)


def get_user_by_username(db: Session, username: str) -> Optional[models.Employee]:
    """Busca un usuario por username exacto (para validar unicidad)."""
    statement = select(models.Employee).where(models.Employee.username == username)
    return db.exec(statement).first()


# ── Escritura ────────────────────────────────────────────────────────

def create_user(db: Session, user_in: models.UserCreate) -> models.Employee:
    """Crea un nuevo usuario hasheando la contraseña antes de persistir."""
    hashed = hash_password(user_in.password)
    user = models.Employee(
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        username=user_in.username,
        status=user_in.status,
        role_id=user_in.role_id,
        store_id=user_in.store_id,
        hashed_password=hashed,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user(db: Session, user: models.Employee, data: models.UserUpdate) -> models.Employee:
    """Actualiza solo los campos enviados (patch-style). No modifica la contraseña."""
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    user.updated_at = datetime.now(timezone.utc)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user: models.Employee) -> models.Employee:
    """Elimina un usuario de la base de datos."""
    db.delete(user)
    db.commit()
    return user
