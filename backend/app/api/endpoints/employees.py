from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from ... import models
from ...crud import employees as crud_employees
from ...database import get_db

router = APIRouter()

# Respuestas comunes documentadas en Swagger.
_404 = {404: {"description": "Empleado no encontrado."}}
_409 = {409: {"description": "Ya existe un empleado con ese username."}}


# ── GET /employees/ ──────────────────────────────────────────────────

@router.get("/", response_model=List[models.EmployeeResponse])
def read_employees(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """Devuelve la lista de empleados con paginación."""
    return crud_employees.get_employees(db, skip=skip, limit=limit)


# ── GET /employees/by-name/{name} ────────────────────────────────────
# IMPORTANTE: debe declararse ANTES de /{employee_id} para que FastAPI
# no trate la cadena "by-name" como employee_id.
# Aunque la ruta se llame "by-name" por estándar del CRUD, internamente
# se busca por username porque es el campo único real de Employee.

@router.get("/by-name/{name}", response_model=models.EmployeeResponse, responses=_404)
def read_employee_by_name(name: str, db: Session = Depends(get_db)):
    """Devuelve un empleado por su username exacto usando la ruta estándar by-name."""
    db_employee = crud_employees.get_employee_by_username(db, username=name)
    if db_employee is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Empleado no encontrado.")
    return db_employee


# ── GET /employees/{employee_id} ─────────────────────────────────────

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
    """Crea un nuevo empleado. No calcula passwords ni implementa autenticación."""
    if crud_employees.get_employee_by_username(db, username=employee_in.username):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un empleado con ese username.",
        )
    return crud_employees.create_employee(db, employee_in=employee_in)


# ── PATCH /employees/{employee_id} ───────────────────────────────────

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
    """Actualiza parcialmente un empleado. Solo se modifican los campos enviados."""
    if employee_in.username is not None:
        existing = crud_employees.get_employee_by_username(db, username=employee_in.username)
        if existing is not None and existing.id_employee != employee_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Ya existe un empleado con ese username.",
            )

    updated = crud_employees.update_employee(db, employee_id=employee_id, employee_in=employee_in)
    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Empleado no encontrado.")
    return updated


# ── DELETE /employees/{employee_id} ──────────────────────────────────

@router.delete("/{employee_id}", response_model=models.EmployeeResponse, responses=_404)
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    """Elimina un empleado por su ID. Devuelve el registro antes de borrarse."""
    deleted = crud_employees.delete_employee(db, employee_id=employee_id)
    if deleted is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Empleado no encontrado.")
    return deleted
