from sqlmodel import Session, select

from .. import models


# El CRUD devuelve el modelo ORM `Employee`, nunca `EmployeeResponse`.
# FastAPI convierte ORM → schema mediante response_model en los endpoints.


# ── Read ─────────────────────────────────────────────────────────────

def get_employees(db: Session, skip: int = 0, limit: int = 100) -> list[models.Employee]:
    """Devuelve la lista de empleados con paginación.

    Args:
        skip:  Registros a saltar (offset). Ej: página 2 con limit=10 → skip=10.
        limit: Máximo de registros a devolver.
    """
    return db.exec(
        select(models.Employee).order_by(models.Employee.id_employee).offset(skip).limit(limit)
    ).all()


def get_employee_by_id(db: Session, employee_id: int) -> models.Employee | None:
    """Devuelve un empleado por su ID, o None si no existe."""
    return db.exec(
        select(models.Employee).where(models.Employee.id_employee == employee_id)
    ).first()


def get_employee_by_username(db: Session, username: str) -> models.Employee | None:
    """Devuelve un empleado por su username exacto, o None si no existe."""
    return db.exec(
        select(models.Employee).where(models.Employee.username == username)
    ).first()


# ── Create ───────────────────────────────────────────────────────────

def create_employee(db: Session, employee_in: models.EmployeeCreate) -> models.Employee:
    """Inserta un nuevo empleado y devuelve el registro creado con todos sus campos."""
    # model_validate convierte el schema EmployeeCreate al modelo ORM Employee.
    db_employee = models.Employee.model_validate(employee_in)
    db.add(db_employee)
    db.commit()
    # db.refresh sincroniza el objeto Python con la fila en BD:
    # recoge el id_employee (SERIAL), created_at y updated_at (DEFAULT NOW())
    # que PostgreSQL asignó durante el INSERT.
    db.refresh(db_employee)
    return db_employee


# ── Update ───────────────────────────────────────────────────────────

def update_employee(
    db: Session,
    employee_id: int,
    employee_in: models.EmployeeUpdate,
) -> models.Employee | None:
    """Actualiza parcialmente un empleado (PATCH) y devuelve el registro actualizado.

    Args:
        employee_id: ID del empleado a modificar.
        employee_in: Campos a cambiar. Solo se aplican los enviados explícitamente.

    Returns:
        El registro actualizado, o None si no existe un empleado con ese ID.
    """
    db_employee = get_employee_by_id(db, employee_id)
    if db_employee is None:
        return None  # El endpoint convierte este None en HTTP 404.

    # exclude_unset=True garantiza que solo se modifican los campos que el
    # cliente envió en el JSON.
    update_data = employee_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_employee, field, value)

    db.add(db_employee)
    db.commit()
    # db.refresh trae el updated_at que el trigger BEFORE UPDATE de PostgreSQL
    # asignó automáticamente durante el UPDATE.
    db.refresh(db_employee)
    return db_employee


# ── Delete ───────────────────────────────────────────────────────────

def delete_employee(db: Session, employee_id: int) -> models.Employee | None:
    """Elimina un empleado y devuelve el registro tal como era antes de borrarse.

    Returns:
        El registro eliminado, o None si no existe un empleado con ese ID.
    """
    db_employee = get_employee_by_id(db, employee_id)
    if db_employee is None:
        return None  # El endpoint convierte este None en HTTP 404.

    db.delete(db_employee)
    db.commit()
    # No se llama db.refresh: la fila ya no existe en BD.
    return db_employee
