from sqlmodel import Session, select

from .. import models


# El CRUD devuelve el modelo ORM `Employee`, nunca `EmployeeResponse`.
# FastAPI convierte ORM → schema mediante response_model en los endpoints.


# ── Read ─────────────────────────────────────────────────────────────

def get_employees(db: Session, skip: int = 0, limit: int = 100) -> list[models.Employee]:
    """Devuelve la lista de empleados con paginación."""
    return db.exec(select(models.Employee).offset(skip).limit(limit)).all()


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
    """Inserta un nuevo empleado y devuelve el registro creado."""
    db_employee = models.Employee.model_validate(employee_in)
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee


# ── Update ───────────────────────────────────────────────────────────

def update_employee(
    db: Session,
    employee_id: int,
    employee_in: models.EmployeeUpdate,
) -> models.Employee | None:
    """Actualiza parcialmente un empleado y devuelve el registro actualizado."""
    db_employee = get_employee_by_id(db, employee_id)
    if db_employee is None:
        return None

    update_data = employee_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_employee, field, value)

    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee


# ── Delete ───────────────────────────────────────────────────────────

def delete_employee(db: Session, employee_id: int) -> models.Employee | None:
    """Elimina un empleado y devuelve el registro tal como era antes de borrarse."""
    db_employee = get_employee_by_id(db, employee_id)
    if db_employee is None:
        return None

    db.delete(db_employee)
    db.commit()
    return db_employee
