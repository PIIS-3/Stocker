from sqlmodel import Session, select

from .. import models
from ..core.security import hash_password


# El CRUD siempre devuelve el modelo ORM `Employee`, nunca `EmployeeResponse`.
# La conversión ORM → schema de respuesta la hace FastAPI automáticamente
# a través del parámetro response_model=EmployeeResponse declarado en cada endpoint.
# Esto mantiene el CRUD agnóstico de la capa de presentación (principio SRP).


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
    """Devuelve un empleado por su username exacto, o None si no existe.

    Se usa para dos propósitos:
    - Validar unicidad de username antes de crear o actualizar.
    - Búsqueda directa desde GET /employees/by-username/{username}.
    """
    return db.exec(
        select(models.Employee).where(models.Employee.username == username)
    ).first()


# ── Create ───────────────────────────────────────────────────────────

def create_employee(db: Session, employee_in: models.EmployeeCreate) -> models.Employee:
    """Inserta un nuevo empleado y devuelve el registro creado con todos sus campos.

    La contraseña en texto plano de `employee_in` se hashea con bcrypt
    antes de persistir. Nunca se almacena texto plano en la BD.
    """
    # model_dump(exclude={"password"}) descarta el campo de texto plano.
    # hashed_password se construye aquí y se pasa explícitamente al modelo ORM.
    db_employee = models.Employee(
        **employee_in.model_dump(exclude={"password"}),
        hashed_password=hash_password(employee_in.password),
    )
    db.add(db_employee)
    db.commit()
    # db.refresh sincroniza el objeto Python con la fila en BD:
    # recoge el id_employee (SERIAL), created_at y updated_at (DEFAULT NOW())
    # que PostgreSQL asignó durante el INSERT. Employee hereda estos campos
    # de TimestampMixin — existen en el modelo, pero su valor es None
    # hasta que la BD los rellena y el refresh los trae de vuelta.
    db.refresh(db_employee)
    return db_employee


# ── Update ───────────────────────────────────────────────────────────

def update_employee(
    db: Session,
    employee_id: int,
    employee_in: models.EmployeeUpdate,
) -> models.Employee | None:
    """Actualiza parcialmente un empleado (PATCH) y devuelve el registro actualizado.

    Si el payload incluye `password`, se hashea y se guarda como `hashed_password`.
    Nunca se almacena texto plano en la BD.

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

    # Si el cliente envió una nueva contraseña, hashearla y mapearla al campo
    # correcto del modelo ORM. El texto plano nunca llega al setattr.
    if "password" in update_data:
        update_data["hashed_password"] = hash_password(update_data.pop("password"))

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
