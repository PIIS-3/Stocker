from typing import Sequence

from sqlmodel import Session, select, col



from .. import models

# El CRUD siempre devuelve el modelo ORM `Employee`, nunca `EmployeeResponse`.
# La conversión ORM → schema de respuesta la hace FastAPI automáticamente
# a través del parámetro response_model=EmployeeResponse declarado en cada endpoint.
# Esto mantiene el CRUD agnóstico de la capa de presentación (principio SRP).


# ── Read ─────────────────────────────────────────────────────────────


def get_employees(db: Session, skip: int = 0, limit: int = 100) -> Sequence[models.Employee]:
    """Devuelve la lista de empleados con paginación.

    Args:
        skip:  Registros a saltar (offset). Ej: página 2 con limit=10 → skip=10.
        limit: Máximo de registros a devolver.
    """
    return db.exec(
        select(models.Employee).order_by(col(models.Employee.id_employee)).offset(skip).limit(limit)
    ).all()



def get_employee_by_id(db: Session, employee_id: int) -> models.Employee | None:
    """Devuelve un empleado por su ID, o None si no existe."""
    return db.exec(
        select(models.Employee).where(models.Employee.id_employee == employee_id)
    ).first()


def get_employee_by_username(db: Session, username: str) -> models.Employee | None:
    """Devuelve un empleado por su username exacto, o None si no existe.

    Se usa para dos propósitos:
    - Validar unicidad de username antes de crear o actualizar.
    - Búsqueda directa en el flujo de autenticación (login / JWT).
    """
    return db.exec(select(models.Employee).where(models.Employee.username == username)).first()


# ── Create ───────────────────────────────────────────────────────────


def create_employee(
    db: Session, employee_in: models.EmployeeCreate, hashed_password: str
) -> models.Employee:
    """Inserta un nuevo empleado y devuelve el registro creado con todos sus campos."""
    data = employee_in.model_dump(exclude={"password"})
    data["hashed_password"] = hashed_password
    db_employee = models.Employee.model_validate(data)
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee


# ── Update ───────────────────────────────────────────────────────────


def update_employee(
    db: Session,
    employee_id: int,
    employee_in: models.EmployeeUpdate,
    hashed_password: str | None = None,
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
    # cliente envió en el JSON. Si manda {"status": "Inactive"}, el resto de
    # campos (first_name, role_id, etc.) quedan intactos.
    update_data = employee_in.model_dump(exclude_unset=True, exclude={"password"})
    if hashed_password is not None:
        update_data["hashed_password"] = hashed_password
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

    # Expulsamos el objeto de la sesión antes del commit para que sus datos
    # permanezcan en memoria y FastAPI pueda serializarlo sin intentar
    # recargar relaciones de una fila que ya no existe.
    db.delete(db_employee)
    # Importante: Cargamos las relaciones antes del commit y expulsamos el objeto
    # para evitar que FastAPI intente refrescarlo tras el borrado físico.
    _ = db_employee.role
    _ = db_employee.store
    db.flush()
    db.expunge(db_employee)
    db.commit()
    # No se llama db.refresh: la fila ya no existe en BD.
    return db_employee
