from sqlmodel import Session

from app.crud.sale import (
    create_sale,
    delete_sale,
    get_sale_by_id,
    get_sales,
    get_sales_by_employee,
    get_sales_by_store,
    update_sale,
)
from app.models.employee import Employee
from app.models.enums import RoleEnum, SaleStatusEnum
from app.models.role import Role
from app.models.sale import Sale, SaleCreate, SaleUpdate
from app.models.store import Store


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


def _seed_employee(
    session: Session,
    username: str,
    role_id: int,
    store_id: int,
) -> Employee:
    employee = Employee(
        first_name="Test",
        last_name="User",
        username=username,
        hashed_password="hashed_pw_placeholder",
        role_id=role_id,
        store_id=store_id,
    )
    session.add(employee)
    session.commit()
    session.refresh(employee)
    return employee


def _seed(
    session: Session,
    store_id: int,
    employee_id: int,
    total_amount: float = 100.0,
    status: SaleStatusEnum = SaleStatusEnum.Completed,
) -> Sale:
    sale = Sale(
        store_id=store_id,
        employee_id=employee_id,
        total_amount=total_amount,
        status=status,
    )
    session.add(sale)
    session.commit()
    session.refresh(sale)
    return sale


# ── Create ───────────────────────────────────────────────────────────


def test_create_sale_assigns_id(session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee = _seed_employee(session, "emp1", role.id_role, store.id_store)

    sale_in = SaleCreate(
        store_id=store.id_store,
        employee_id=employee.id_employee,
        total_amount=150.50,
    )

    result = create_sale(session, sale_in=sale_in)

    assert result.id_sale is not None
    assert result.store_id == store.id_store
    assert result.employee_id == employee.id_employee
    assert result.total_amount == 150.50


def test_create_sale_default_status_completed(session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee = _seed_employee(session, "emp2", role.id_role, store.id_store)

    sale_in = SaleCreate(
        store_id=store.id_store,
        employee_id=employee.id_employee,
        total_amount=50.0,
    )

    result = create_sale(session, sale_in=sale_in)

    assert result.status == SaleStatusEnum.Completed


def test_create_sale_explicit_status(session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee = _seed_employee(session, "emp3", role.id_role, store.id_store)

    sale_in = SaleCreate(
        store_id=store.id_store,
        employee_id=employee.id_employee,
        total_amount=25.0,
        status=SaleStatusEnum.Pending,
    )

    result = create_sale(session, sale_in=sale_in)

    assert result.status == SaleStatusEnum.Pending


# ── Read ─────────────────────────────────────────────────────────────


def test_get_sales_returns_all(session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee = _seed_employee(session, "emp4", role.id_role, store.id_store)

    _seed(session, store.id_store, employee.id_employee, total_amount=100.0)
    _seed(session, store.id_store, employee.id_employee, total_amount=200.0)

    results = get_sales(session)

    assert len(results) == 2
    amounts = {s.total_amount for s in results}
    assert amounts == {100.0, 200.0}


def test_get_sales_empty_db(session: Session):
    results = get_sales(session)

    assert results == []


def test_get_sales_pagination_skip(session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee = _seed_employee(session, "emp5", role.id_role, store.id_store)

    _seed(session, store.id_store, employee.id_employee, total_amount=10.0)
    _seed(session, store.id_store, employee.id_employee, total_amount=20.0)
    _seed(session, store.id_store, employee.id_employee, total_amount=30.0)

    results = get_sales(session, skip=2, limit=100)

    assert len(results) == 1


def test_get_sales_pagination_limit(session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee = _seed_employee(session, "emp6", role.id_role, store.id_store)

    _seed(session, store.id_store, employee.id_employee, total_amount=10.0)
    _seed(session, store.id_store, employee.id_employee, total_amount=20.0)
    _seed(session, store.id_store, employee.id_employee, total_amount=30.0)

    results = get_sales(session, skip=0, limit=2)

    assert len(results) == 2


def test_get_sale_by_id_found(session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee = _seed_employee(session, "emp7", role.id_role, store.id_store)
    seeded = _seed(session, store.id_store, employee.id_employee, total_amount=300.0)

    result = get_sale_by_id(session, sale_id=seeded.id_sale)

    assert result is not None
    assert result.id_sale == seeded.id_sale
    assert result.total_amount == 300.0


def test_get_sale_by_id_not_found(session: Session):
    result = get_sale_by_id(session, sale_id=999999)

    assert result is None


def test_get_sales_by_store(session: Session):
    role = _seed_role(session)
    store1 = _seed_store(session, "StoreA")
    store2 = _seed_store(session, "StoreB")
    employee = _seed_employee(session, "emp8", role.id_role, store1.id_store)

    _seed(session, store1.id_store, employee.id_employee, total_amount=100.0)
    _seed(session, store2.id_store, employee.id_employee, total_amount=200.0)

    results = get_sales_by_store(session, store_id=store1.id_store)

    assert len(results) == 1
    assert results[0].total_amount == 100.0


def test_get_sales_by_employee(session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    emp1 = _seed_employee(session, "emp9", role.id_role, store.id_store)
    emp2 = _seed_employee(session, "emp10", role.id_role, store.id_store)

    _seed(session, store.id_store, emp1.id_employee, total_amount=50.0)
    _seed(session, store.id_store, emp2.id_employee, total_amount=90.0)

    results = get_sales_by_employee(session, employee_id=emp1.id_employee)

    assert len(results) == 1
    assert results[0].total_amount == 50.0


# ── Update ───────────────────────────────────────────────────────────


def test_update_sale_changes_status(session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee = _seed_employee(session, "emp11", role.id_role, store.id_store)
    seeded = _seed(session, store.id_store, employee.id_employee, total_amount=100.0)

    update_in = SaleUpdate(status=SaleStatusEnum.Cancelled)
    result = update_sale(session, sale_id=seeded.id_sale, sale_in=update_in)

    assert result is not None
    assert result.status == SaleStatusEnum.Cancelled
    assert result.total_amount == 100.0


def test_update_sale_changes_total_amount(session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee = _seed_employee(session, "emp12", role.id_role, store.id_store)
    seeded = _seed(session, store.id_store, employee.id_employee, total_amount=100.0)

    update_in = SaleUpdate(total_amount=250.0)
    result = update_sale(session, sale_id=seeded.id_sale, sale_in=update_in)

    assert result is not None
    assert result.total_amount == 250.0


def test_update_sale_exclude_unset(session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee = _seed_employee(session, "emp13", role.id_role, store.id_store)
    seeded = _seed(
        session,
        store.id_store,
        employee.id_employee,
        total_amount=100.0,
        status=SaleStatusEnum.Pending,
    )

    update_in = SaleUpdate(status=SaleStatusEnum.Completed)
    result = update_sale(session, sale_id=seeded.id_sale, sale_in=update_in)

    assert result is not None
    assert result.status == SaleStatusEnum.Completed
    assert result.total_amount == 100.0


def test_update_sale_not_found_returns_none(session: Session):
    update_in = SaleUpdate(status=SaleStatusEnum.Cancelled)

    result = update_sale(session, sale_id=999999, sale_in=update_in)

    assert result is None


# ── Delete ───────────────────────────────────────────────────────────


def test_delete_sale_returns_deleted_record(session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee = _seed_employee(session, "emp14", role.id_role, store.id_store)
    seeded = _seed(session, store.id_store, employee.id_employee, total_amount=400.0)

    result = delete_sale(session, sale_id=seeded.id_sale)

    assert result is not None
    assert result.id_sale == seeded.id_sale
    assert result.total_amount == 400.0


def test_delete_sale_removes_from_db(session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee = _seed_employee(session, "emp15", role.id_role, store.id_store)
    seeded = _seed(session, store.id_store, employee.id_employee)

    delete_sale(session, sale_id=seeded.id_sale)
    after = get_sale_by_id(session, sale_id=seeded.id_sale)

    assert after is None


def test_delete_sale_not_found_returns_none(session: Session):
    result = delete_sale(session, sale_id=999999)

    assert result is None
