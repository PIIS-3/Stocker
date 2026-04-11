from sqlmodel import Session, select

from app.core.security import hash_password, verify_password
from app.models.employee import Employee, EmployeeCreate


def get_employee_by_username(db: Session, username: str) -> Employee | None:
    statement = select(Employee).where(Employee.username == username)
    return db.exec(statement).first()


def get_employee_by_id(db: Session, employee_id: int) -> Employee | None:
    statement = select(Employee).where(Employee.id_employee == employee_id)
    return db.exec(statement).first()


def authenticate_employee(db: Session, username: str, password: str) -> Employee | None:
    employee = get_employee_by_username(db, username)
    if not employee:
        return None

    if not verify_password(password, employee.hashed_password):
        return None

    return employee


def create_employee(db: Session, employee_in: EmployeeCreate) -> Employee:
    db_employee = Employee(
        first_name=employee_in.first_name,
        last_name=employee_in.last_name,
        username=employee_in.username,
        status=employee_in.status,
        role_id=employee_in.role_id,
        store_id=employee_in.store_id,
        hashed_password=hash_password(employee_in.password),
    )
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee