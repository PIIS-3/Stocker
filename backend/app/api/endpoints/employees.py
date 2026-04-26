from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List

from ... import models
from ...crud import employees as crud_employees
from ...database import get_db

router = APIRouter()

# Respuestas comunes documentadas en Swagger para todos los endpoints.
_404 = {404: {"description": "Empleado no encontrado."}}
_409 = {409: {"description": "Ya existe un empleado con ese username."}}


# ── GET /employees/ ───────────────────────────────────────────────────

@router.get("/", response_model=List[models.EmployeeResponse])
def read_employees(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """Devuelve la lista de empleados con paginación."""
    return crud_employees.get_employees(db, skip=skip, limit=limit)


# ── GET /employees/by-username/{username} ─────────────────────────────
# IMPORTANTE: debe declararse ANTES de /{employee_id} para que FastAPI
# no trate la cadena "by-username" como un valor entero de employee_id.

@router.get("/by-username/{username}", response_model=models.EmployeeResponse, responses=_404)
def read_employee_by_username(username: str, db: Session = Depends(get_db)):
    """Devuelve un empleado por su username exacto."""
    db_employee = crud_employees.get_employee_by_username(db, username=username)
    if db_employee is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Empleado no encontrado.")
    return db_employee


# ── GET /employees/{employee_id} ──────────────────────────────────────

@router.get("/{employee_id}", response_model=models.EmployeeResponse, responses=_404)
def read_employee(employee_id: int, db: Session = Depends(get_db)):
    """Devuelve un empleado por su ID numérico."""
    db_employee = crud_employees.get_employee_by_id(db, employee_id=employee_id)
    if db_employee is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Empleado no encontrado.")
    return db_employee


# ── POST /employees/ ─────────────────────────────────────────────────

@router.post(
    "/",
    response_model=models.EmployeeResponse,
    status_code=status.HTTP_201_CREATED,
    responses=_409,
)
def create_employee(employee_in: models.EmployeeCreate, db: Session = Depends(get_db)):
    """Crea un nuevo empleado. La contraseña se almacena hasheada con bcrypt."""
    if crud_employees.get_employee_by_username(db, username=employee_in.username):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un empleado con ese username.",
        )
    return crud_employees.create_employee(db, employee_in=employee_in)


# ── PATCH /employees/{employee_id} ────────────────────────────────────

@router.patch(
    "/{employee_id}",
    response_model=models.EmployeeResponse,
    responses={**_404, **_409},
)
def update_employee(
    employee_id: int,
    employee_in: models.EmployeeUpdate,
    db: Session = Depends(get_db),
):
    """Actualiza parcialmente un empleado. Solo se modifican los campos enviados.
    Si se envía `password`, se hashea antes de almacenarse."""
    # Validar unicidad de username solo si el cliente envió username.
    # Se comprueba con `is not None` (no truthy) porque una cadena vacía
    # ya la rechaza Pydantic por min_length=1 antes de llegar aquí.
    if employee_in.username is not None:
        existing = crud_employees.get_employee_by_username(db, username=employee_in.username)
        # Si el empleado encontrado ES el mismo que estamos editando, no es conflicto.
        # Esto permite enviar el mismo username sin obtener un 409 innecesario.
        if existing is not None and existing.id_employee != employee_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Ya existe un empleado con ese username.",
            )

    updated = crud_employees.update_employee(db, employee_id=employee_id, employee_in=employee_in)
    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Empleado no encontrado.")
    return updated


# ── DELETE /employees/{employee_id} ───────────────────────────────────

@router.delete("/{employee_id}", response_model=models.EmployeeResponse, responses=_404)
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    """Elimina un empleado por su ID. Devuelve el registro tal como era antes de borrarse."""
    deleted = crud_employees.delete_employee(db, employee_id=employee_id)
    if deleted is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Empleado no encontrado.")
    return deleted
