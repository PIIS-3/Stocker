from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session

from ... import models
from ...core import security
from ...crud import employees as crud_employees
from ...database import get_db
from ..deps import get_current_admin, get_current_employee, get_current_superadmin

router = APIRouter(tags=["Empleados"])

# Respuestas comunes documentadas en Swagger.
_404 = {404: {"description": "Empleado no encontrado."}}
_409 = {409: {"description": "Ya existe un empleado con ese username."}}
_409_DELETE = {409: {"description": "No se puede eliminar un empleado con registros asociados."}}


# ── GET /employees/roles ─────────────────────────────────────────────


@router.get(
    "/roles",
    response_model=list[models.RoleResponse],
    summary="Listar roles",
    description="Devuelve el catálogo de roles disponibles (SuperAdmin, Manager, Staff).",
    dependencies=[Depends(get_current_admin)],
)
def read_roles(
    db: Session = Depends(get_db),
    current_employee: models.Employee = Depends(get_current_admin),
):
    from sqlmodel import select

    query = select(models.Role)
    if current_employee.role and current_employee.role.role_name == models.RoleEnum.Manager:
        query = query.where(models.Role.role_name != models.RoleEnum.SuperAdmin)

    return db.exec(query.order_by(models.Role.id_role)).all()


# ── GET /employees/ ──────────────────────────────────────────────────


@router.get(
    "/",
    response_model=list[models.EmployeeResponse],
    summary="Listar empleados",
    description=(
        "Devuelve la lista completa de empleados con soporte para paginación (skip/limit)."
    ),
    dependencies=[Depends(get_current_admin)],
)
def read_employees(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_employee: models.Employee = Depends(get_current_admin),
):
    if current_employee.role and current_employee.role.role_name == models.RoleEnum.SuperAdmin:
        return crud_employees.get_employees(db, skip=skip, limit=limit)

    # Manager: Solo empleados de su propia tienda
    from sqlmodel import select

    return db.exec(
        select(models.Employee)
        .where(models.Employee.store_id == current_employee.store_id)
        .offset(skip)
        .limit(limit)
    ).all()


# ── GET /employees/by-name/{name} ────────────────────────────────────


@router.get(
    "/by-name/{name}",
    response_model=models.EmployeeResponse,
    responses=_404,
    summary="Obtener empleado por username",
    description="Busca un empleado específico utilizando su nombre de usuario único.",
    dependencies=[Depends(get_current_admin)],
)
def read_employee_by_name(name: str, db: Session = Depends(get_db)):
    db_employee = crud_employees.get_employee_by_username(db, username=name)
    if db_employee is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Empleado no encontrado.")
    return db_employee


# ── GET /employees/me ────────────────────────────────────────────────


@router.get(
    "/me",
    response_model=models.EmployeeResponse,
    summary="Obtener empleado autenticado",
    description="Devuelve los datos del empleado asociado al token JWT actual.",
)
def read_current_employee(
    current_employee: models.Employee = Depends(get_current_employee),
) -> models.Employee:
    return current_employee


# ── GET /employees/{employee_id} ─────────────────────────────────────


@router.get(
    "/{employee_id}",
    response_model=models.EmployeeResponse,
    responses=_404,
    summary="Obtener empleado por ID",
    description=("Recupera el detalle de un empleado a través de su identificador numérico único."),
    dependencies=[Depends(get_current_admin)],
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
    dependencies=[Depends(get_current_admin)],
)
def create_employee(
    employee_in: models.EmployeeCreate,
    db: Session = Depends(get_db),
    current_employee: models.Employee = Depends(get_current_admin),
):
    if current_employee.role and current_employee.role.role_name == models.RoleEnum.Manager:
        # 1. Validar que la tienda coincida
        if employee_in.store_id != current_employee.store_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo puedes crear empleados para tu propia tienda.",
            )
        # 2. Validar que no intente crear un SuperAdmin
        from ...models.role import Role

        target_role = db.get(Role, employee_in.role_id)
        if target_role and target_role.role_name == models.RoleEnum.SuperAdmin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos para crear un SuperAdmin.",
            )

    if crud_employees.get_employee_by_username(db, username=employee_in.username):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un empleado con ese username.",
        )
    hashed = security.get_password_hash(employee_in.password)
    return crud_employees.create_employee(db, employee_in=employee_in, hashed_password=hashed)


# ── PATCH /employees/{employee_id} ───────────────────────────────────


@router.patch(
    "/{employee_id}",
    response_model=models.EmployeeResponse,
    responses={**_404, **_409},
    summary="Actualizar empleado",
    description=(
        "Modifica parcialmente los datos de un empleado. Solo actualiza los campos enviados."
    ),
    dependencies=[Depends(get_current_admin)],
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

    hashed = security.get_password_hash(employee_in.password) if employee_in.password else None
    updated = crud_employees.update_employee(
        db, employee_id=employee_id, employee_in=employee_in, hashed_password=hashed
    )
    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Empleado no encontrado.")
    return updated


# ── DELETE /employees/{employee_id} ──────────────────────────────────


@router.delete(
    "/{employee_id}",
    response_model=models.EmployeeResponse,
    responses={**_404, **_409_DELETE},
    summary="Eliminar empleado",
    description="Borra definitivamente el registro de un empleado mediante su ID.",
    dependencies=[Depends(get_current_superadmin)],
)
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    try:
        deleted = crud_employees.delete_employee(db, employee_id=employee_id)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No se puede eliminar el empleado porque tiene registros asociados.",
        )

    if deleted is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Empleado no encontrado.")
    return deleted
