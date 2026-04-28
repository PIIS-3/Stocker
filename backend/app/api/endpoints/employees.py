from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from ... import models
from ...crud import employees as crud_employees
from ...database import get_db
from ..deps import get_current_employee

router = APIRouter(tags=["Empleados"], dependencies=[Depends(get_current_employee)])

# Respuestas comunes documentadas en Swagger.
_404 = {404: {"description": "Empleado no encontrado."}}
_409 = {409: {"description": "Ya existe un empleado con ese username."}}


# ── GET /employees/ ──────────────────────────────────────────────────

@router.get(
    "/",
    response_model=List[models.EmployeeResponse],
    summary="Listar empleados",
    description=(
        "Devuelve la lista completa de empleados con soporte para paginación (skip/limit)."
    ),
)
def read_employees(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    return crud_employees.get_employees(db, skip=skip, limit=limit)


# ── GET /employees/by-name/{name} ────────────────────────────────────

@router.get(
    "/by-name/{name}",
    response_model=models.EmployeeResponse,
    responses=_404,
    summary="Obtener empleado por username",
    description="Busca un empleado específico utilizando su nombre de usuario único.",
)
def read_employee_by_name(name: str, db: Session = Depends(get_db)):
    db_employee = crud_employees.get_employee_by_username(db, username=name)
    if db_employee is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Empleado no encontrado.")
    return db_employee


# ── GET /employees/{employee_id} ─────────────────────────────────────

@router.get(
    "/{employee_id}",
    response_model=models.EmployeeResponse,
    responses=_404,
    summary="Obtener empleado por ID",
    description=(
        "Recupera el detalle de un empleado a través de su identificador numérico único."
    ),
)
def read_employee(employee_id: int, db: Session = Depends(get_db)):
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
    summary="Dar de alta empleado",
    description="Registra un nuevo empleado en el sistema asociado a un rol y una tienda.",
)
def create_employee(employee_in: models.EmployeeCreate, db: Session = Depends(get_db)):
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
    summary="Actualizar empleado",
    description=(
        "Modifica parcialmente los datos de un empleado. Solo actualiza los campos enviados."
    ),
)
def update_employee(
    employee_id: int,
    employee_in: models.EmployeeUpdate,
    db: Session = Depends(get_db),
):
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

@router.delete(
    "/{employee_id}",
    response_model=models.EmployeeResponse,
    responses=_404,
    summary="Eliminar empleado",
    description="Borra definitivamente el registro de un empleado mediante su ID.",
)
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    deleted = crud_employees.delete_employee(db, employee_id=employee_id)
    if deleted is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Empleado no encontrado.")
    return deleted

