from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from ... import models
from ...crud import users as crud_users
from ...database import get_db

router = APIRouter()


# ─── Helpers de validación ───────────────────────────────────────────

def _check_role_exists(db: Session, role_id: int) -> None:
    """Lanza 404 si el rol no existe."""
    role = db.get(models.Role, role_id)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Rol con id={role_id} no encontrado.",
        )


def _check_store_exists(db: Session, store_id: int) -> None:
    """Lanza 404 si la tienda no existe."""
    store = db.get(models.Store, store_id)
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tienda con id={store_id} no encontrada.",
        )


# ── GET /users/ — Listar usuarios ────────────────────────────────────

@router.get(
    "/",
    response_model=List[models.UserResponse],
    summary="Listar usuarios",
    description="Devuelve la lista paginada de todos los usuarios del sistema.",
)
def list_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    return crud_users.get_users(db, skip=skip, limit=limit)


# ── GET /users/{user_id} — Detalle de usuario ────────────────────────

@router.get(
    "/{user_id}",
    response_model=models.UserResponse,
    summary="Obtener usuario por ID",
    description="Devuelve el detalle de un usuario concreto. No incluye la contraseña.",
)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = crud_users.get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Usuario con id={user_id} no encontrado.",
        )
    return user


# ── POST /users/ — Crear usuario ─────────────────────────────────────

@router.post(
    "/",
    response_model=models.UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear usuario",
    description=(
        "Crea un nuevo usuario. El username debe ser único. "
        "La contraseña se almacena hasheada (bcrypt) y nunca se devuelve."
    ),
)
def create_user(user_in: models.UserCreate, db: Session = Depends(get_db)):
    # Unicidad de username
    if crud_users.get_user_by_username(db, user_in.username):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Ya existe un usuario con el username '{user_in.username}'.",
        )
    # Validar FK
    _check_role_exists(db, user_in.role_id)
    _check_store_exists(db, user_in.store_id)

    return crud_users.create_user(db, user_in)


# ── PUT /users/{user_id} — Actualizar usuario ────────────────────────

@router.put(
    "/{user_id}",
    response_model=models.UserResponse,
    summary="Actualizar usuario",
    description=(
        "Actualiza los datos de un usuario. Solo se modifican los campos enviados. "
        "Para cambiar la contraseña usar PATCH /users/{id}/password (próximamente)."
    ),
)
def update_user(
    user_id: int,
    user_in: models.UserUpdate,
    db: Session = Depends(get_db),
):
    user = crud_users.get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Usuario con id={user_id} no encontrado.",
        )

    # Unicidad del nuevo username (si cambia)
    if user_in.username and user_in.username != user.username:
        if crud_users.get_user_by_username(db, user_in.username):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Ya existe un usuario con el username '{user_in.username}'.",
            )

    # Validar FK si se actualizan
    if user_in.role_id is not None:
        _check_role_exists(db, user_in.role_id)
    if user_in.store_id is not None:
        _check_store_exists(db, user_in.store_id)

    return crud_users.update_user(db, user, user_in)


# ── DELETE /users/{user_id} — Eliminar usuario ───────────────────────

@router.delete(
    "/{user_id}",
    response_model=models.UserResponse,
    summary="Eliminar usuario",
    description="Elimina un usuario por su ID. Devuelve los datos del usuario eliminado.",
)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = crud_users.get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Usuario con id={user_id} no encontrado.",
        )
    return crud_users.delete_user(db, user)
