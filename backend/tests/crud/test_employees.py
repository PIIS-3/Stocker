from sqlmodel import Session

from app.crud.employees import (
    create_employee,
    delete_employee,
    get_employee_by_id,
    get_employee_by_username,
    get_employees,
    update_employee,
)
from app.models.employee import Employee, EmployeeCreate, EmployeeUpdate
from app.models.enums import RoleEnum, StatusEnum
from app.models.role import Role
from app.models.store import Store

# ── Helpers ──────────────────────────────────────────────────────────


def _seed_role(session: Session, role_name: RoleEnum = RoleEnum.Staff) -> Role:
    role = Role(role_name=role_name)
    session.add(role)
    session.commit()
    session.refresh(role)
    return role


def _seed_store(session: Session, name: str = "TiendaTest") -> Store:
    store = Store(store_name=name, address="Calle Test 1")
    session.add(store)
    session.commit()
    session.refresh(store)
    return store


def _seed(
    session: Session,
    username: str,
    role_id: int,
    store_id: int,
    first_name: str = "Juan",
    last_name: str = "García",
    hashed_password: str = "hash_seguro",
    status: StatusEnum = StatusEnum.Active,
) -> Employee:
    employee = Employee(
        first_name=first_name,
        last_name=last_name,
        username=username,
        hashed_password=hashed_password,
        status=status,
        role_id=role_id,
        store_id=store_id,
    )
    session.add(employee)
    session.commit()
    session.refresh(employee)
    return employee


# ── Create ───────────────────────────────────────────────────────────


def test_create_employee_assigns_id(session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee_in = EmployeeCreate(
        first_name="Ana",
        last_name="López",
        username="alopez",
        hashed_password="hash_seguro",
        role_id=role.id_role,
        store_id=store.id_store,
    )

    result = create_employee(session, employee_in=employee_in)

    assert result.id_employee is not None
    assert result.username == "alopez"
    assert result.first_name == "Ana"
    assert result.last_name == "López"
    assert result.status == StatusEnum.Active


def test_create_employee_default_status_is_active(session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee_in = EmployeeCreate(
        first_name="Luis",
        last_name="Martín",
        username="lmartin",
        hashed_password="hash_seguro",
        role_id=role.id_role,
        store_id=store.id_store,
    )

    result = create_employee(session, employee_in=employee_in)

    assert result.status == StatusEnum.Active


def test_create_employee_hashed_password_stored(session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee_in = EmployeeCreate(
        first_name="Carlos",
        last_name="Ruiz",
        username="cruiz",
        hashed_password="mi_hash_secreto",
        role_id=role.id_role,
        store_id=store.id_store,
    )

    result = create_employee(session, employee_in=employee_in)

    assert result.hashed_password == "mi_hash_secreto"


def test_create_employee_inactive_status(session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee_in = EmployeeCreate(
        first_name="Baja",
        last_name="Temporal",
        username="btemp",
        hashed_password="hash_seguro",
        status=StatusEnum.Inactive,
        role_id=role.id_role,
        store_id=store.id_store,
    )

    result = create_employee(session, employee_in=employee_in)

    assert result.status == StatusEnum.Inactive


# ── Read ─────────────────────────────────────────────────────────────


def test_get_employees_returns_all(session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    _seed(session, "usuario1", role.id_role, store.id_store)
    _seed(session, "usuario2", role.id_role, store.id_store)

    results = get_employees(session)

    assert len(results) == 2
    usernames = {e.username for e in results}
    assert usernames == {"usuario1", "usuario2"}


def test_get_employees_empty_db(session: Session):
    results = get_employees(session)

    assert results == []


def test_get_employees_pagination_skip(session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    _seed(session, "a", role.id_role, store.id_store)
    _seed(session, "b", role.id_role, store.id_store)
    _seed(session, "c", role.id_role, store.id_store)

    results = get_employees(session, skip=2, limit=100)

    assert len(results) == 1


def test_get_employees_pagination_limit(session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    _seed(session, "a", role.id_role, store.id_store)
    _seed(session, "b", role.id_role, store.id_store)
    _seed(session, "c", role.id_role, store.id_store)

    results = get_employees(session, skip=0, limit=2)

    assert len(results) == 2


def test_get_employee_by_id_found(session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    seeded = _seed(session, "jgarcia", role.id_role, store.id_store, first_name="Juan")

    result = get_employee_by_id(session, employee_id=seeded.id_employee)

    assert result is not None
    assert result.id_employee == seeded.id_employee
    assert result.username == "jgarcia"
    assert result.first_name == "Juan"


def test_get_employee_by_id_not_found(session: Session):
    result = get_employee_by_id(session, employee_id=999999)

    assert result is None


def test_get_employee_by_username_found(session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    _seed(session, "mperez", role.id_role, store.id_store, first_name="María")

    result = get_employee_by_username(session, username="mperez")

    assert result is not None
    assert result.username == "mperez"
    assert result.first_name == "María"


def test_get_employee_by_username_not_found(session: Session):
    result = get_employee_by_username(session, username="inexistente")

    assert result is None


def test_get_employee_by_username_case_sensitive(session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    _seed(session, "MPerez", role.id_role, store.id_store)

    result = get_employee_by_username(session, username="mperez")

    assert result is None


# ── Update ───────────────────────────────────────────────────────────


def test_update_employee_changes_first_name(session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    seeded = _seed(session, "jgarcia", role.id_role, store.id_store, first_name="Juan")
    update_in = EmployeeUpdate(first_name="Juanito")

    result = update_employee(session, employee_id=seeded.id_employee, employee_in=update_in)

    assert result is not None
    assert result.first_name == "Juanito"
    assert result.username == "jgarcia"  # campo no enviado queda intacto


def test_update_employee_changes_username(session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    seeded = _seed(session, "username_viejo", role.id_role, store.id_store)
    update_in = EmployeeUpdate(username="username_nuevo")

    result = update_employee(session, employee_id=seeded.id_employee, employee_in=update_in)

    assert result is not None
    assert result.username == "username_nuevo"


def test_update_employee_changes_status(session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    seeded = _seed(session, "activo", role.id_role, store.id_store, status=StatusEnum.Active)
    update_in = EmployeeUpdate(status=StatusEnum.Inactive)

    result = update_employee(session, employee_id=seeded.id_employee, employee_in=update_in)

    assert result is not None
    assert result.status == StatusEnum.Inactive


def test_update_employee_exclude_unset_leaves_other_fields(session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    seeded = _seed(
        session,
        "completo",
        role.id_role,
        store.id_store,
        first_name="Ana",
        last_name="López",
        status=StatusEnum.Active,
    )
    update_in = EmployeeUpdate(first_name="Anita")

    result = update_employee(session, employee_id=seeded.id_employee, employee_in=update_in)

    assert result is not None
    assert result.first_name == "Anita"  # actualizado
    assert result.last_name == "López"  # intacto
    assert result.username == "completo"  # intacto
    assert result.status == StatusEnum.Active  # intacto


def test_update_employee_not_found_returns_none(session: Session):
    update_in = EmployeeUpdate(first_name="X")

    result = update_employee(session, employee_id=999999, employee_in=update_in)

    assert result is None


# ── Delete ───────────────────────────────────────────────────────────


def test_delete_employee_returns_deleted_record(session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    seeded = _seed(session, "efimero", role.id_role, store.id_store)

    result = delete_employee(session, employee_id=seeded.id_employee)

    assert result is not None
    assert result.id_employee == seeded.id_employee
    assert result.username == "efimero"


def test_delete_employee_removes_from_db(session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    seeded = _seed(session, "transitorio", role.id_role, store.id_store)

    delete_employee(session, employee_id=seeded.id_employee)
    after = get_employee_by_id(session, employee_id=seeded.id_employee)

    assert after is None


def test_delete_employee_not_found_returns_none(session: Session):
    result = delete_employee(session, employee_id=999999)

    assert result is None
