from fastapi.testclient import TestClient
from sqlmodel import Session

from app.models.category import Category
from app.models.employee import Employee
from app.models.enums import RoleEnum, SaleStatusEnum
from app.models.product import ProductTemplate
from app.models.role import Role
from app.models.sale import Sale
from app.models.sale_item import SaleItem
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


def _seed_sale(
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


# ── GET /api/sales/ ──────────────────────────────────────────────────


def test_read_sales(client: TestClient, session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee = _seed_employee(session, "emp1", role.id_role, store.id_store)
    _seed_sale(session, store.id_store, employee.id_employee, total_amount=150.0)

    response = client.get("/api/sales/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["total_amount"] == 150.0


def test_read_sales_by_store(client: TestClient, session: Session):
    role = _seed_role(session)
    store1 = _seed_store(session, "Store1")
    store2 = _seed_store(session, "Store2")
    employee = _seed_employee(session, "emp2", role.id_role, store1.id_store)

    _seed_sale(session, store1.id_store, employee.id_employee, total_amount=100.0)
    _seed_sale(session, store2.id_store, employee.id_employee, total_amount=200.0)

    response = client.get(f"/api/sales/by-store/{store1.id_store}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["total_amount"] == 100.0


def test_read_sales_by_employee(client: TestClient, session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    emp1 = _seed_employee(session, "emp1", role.id_role, store.id_store)
    emp2 = _seed_employee(session, "emp2", role.id_role, store.id_store)

    _seed_sale(session, store.id_store, emp1.id_employee, total_amount=50.0)
    _seed_sale(session, store.id_store, emp2.id_employee, total_amount=90.0)

    response = client.get(f"/api/sales/by-employee/{emp1.id_employee}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["total_amount"] == 50.0


# ── GET /api/sales/{id} ──────────────────────────────────────────────


def test_read_sale_by_id(client: TestClient, session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee = _seed_employee(session, "emp", role.id_role, store.id_store)
    sale = _seed_sale(session, store.id_store, employee.id_employee, total_amount=300.0)

    response = client.get(f"/api/sales/{sale.id_sale}")
    assert response.status_code == 200
    assert response.json()["total_amount"] == 300.0


def test_read_sale_not_found(client: TestClient):
    response = client.get("/api/sales/999999")
    assert response.status_code == 404


# ── POST /api/sales/ ─────────────────────────────────────────────────


def test_create_sale(client: TestClient, session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee = _seed_employee(session, "emp", role.id_role, store.id_store)

    payload = {
        "store_id": store.id_store,
        "employee_id": employee.id_employee,
        "total_amount": 120.50,
        "status": "Completed",
    }

    response = client.post("/api/sales/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["id_sale"] is not None
    assert data["total_amount"] == 120.50


def test_create_sale_bad_request(client: TestClient):
    payload = {
        "store_id": 9999,
        "employee_id": 9999,
        "total_amount": 100.0,
        "status": "Completed",
    }

    response = client.post("/api/sales/", json=payload)
    assert response.status_code == 400


# ── PATCH /api/sales/{id} ────────────────────────────────────────────


def test_update_sale(client: TestClient, session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee = _seed_employee(session, "emp", role.id_role, store.id_store)
    sale = _seed_sale(session, store.id_store, employee.id_employee, total_amount=100.0)

    response = client.patch(f"/api/sales/{sale.id_sale}", json={"status": "Cancelled"})
    assert response.status_code == 200
    assert response.json()["status"] == "Cancelled"


# ── DELETE /api/sales/{id} ───────────────────────────────────────────


def test_delete_sale(client: TestClient, session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee = _seed_employee(session, "emp", role.id_role, store.id_store)
    sale = _seed_sale(session, store.id_store, employee.id_employee, total_amount=100.0)

    response = client.delete(f"/api/sales/{sale.id_sale}")
    assert response.status_code == 200
    assert response.json()["id_sale"] == sale.id_sale


# ── Tests adicionales ─────────────────────────────────────────────────


def test_read_sales_empty(client: TestClient):
    response = client.get("/api/sales/")
    assert response.status_code == 200
    assert response.json() == []


def test_read_sales_pagination_limit(client: TestClient, session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee = _seed_employee(session, "emp_limit", role.id_role, store.id_store)

    _seed_sale(session, store.id_store, employee.id_employee, total_amount=10.0)
    _seed_sale(session, store.id_store, employee.id_employee, total_amount=20.0)
    _seed_sale(session, store.id_store, employee.id_employee, total_amount=30.0)

    response = client.get("/api/sales/?limit=2")
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_read_sales_pagination_skip(client: TestClient, session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee = _seed_employee(session, "emp_skip", role.id_role, store.id_store)

    _seed_sale(session, store.id_store, employee.id_employee, total_amount=10.0)
    _seed_sale(session, store.id_store, employee.id_employee, total_amount=20.0)
    _seed_sale(session, store.id_store, employee.id_employee, total_amount=30.0)

    response = client.get("/api/sales/?skip=2")
    assert response.status_code == 200
    assert len(response.json()) == 1


def test_read_sale_by_store_empty(client: TestClient, session: Session):
    store = _seed_store(session, "StoreEmpty")

    response = client.get(f"/api/sales/by-store/{store.id_store}")
    assert response.status_code == 200
    assert response.json() == []


def test_read_sale_by_employee_empty(client: TestClient, session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee = _seed_employee(session, "emp_empty", role.id_role, store.id_store)

    response = client.get(f"/api/sales/by-employee/{employee.id_employee}")
    assert response.status_code == 200
    assert response.json() == []


def test_create_sale_default_status(client: TestClient, session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee = _seed_employee(session, "emp_default", role.id_role, store.id_store)

    payload = {
        "store_id": store.id_store,
        "employee_id": employee.id_employee,
        "total_amount": 75.0,
    }

    response = client.post("/api/sales/", json=payload)
    assert response.status_code == 201
    assert response.json()["status"] == "Completed"


def test_create_sale_pending_status(client: TestClient, session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee = _seed_employee(session, "emp_pending", role.id_role, store.id_store)

    payload = {
        "store_id": store.id_store,
        "employee_id": employee.id_employee,
        "total_amount": 50.0,
        "status": "Pending",
    }

    response = client.post("/api/sales/", json=payload)
    assert response.status_code == 201
    assert response.json()["status"] == "Pending"


def test_create_sale_cancelled_status(client: TestClient, session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee = _seed_employee(session, "emp_cancelled", role.id_role, store.id_store)

    payload = {
        "store_id": store.id_store,
        "employee_id": employee.id_employee,
        "total_amount": 0.0,
        "status": "Cancelled",
    }

    response = client.post("/api/sales/", json=payload)
    assert response.status_code == 201
    assert response.json()["status"] == "Cancelled"


def test_update_sale_not_found(client: TestClient):
    response = client.patch("/api/sales/999999", json={"status": "Cancelled"})
    assert response.status_code == 404


def test_update_sale_partial_total_amount(client: TestClient, session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee = _seed_employee(session, "emp_partial", role.id_role, store.id_store)
    sale = _seed_sale(session, store.id_store, employee.id_employee, total_amount=100.0)

    response = client.patch(
        f"/api/sales/{sale.id_sale}", json={"total_amount": 500.75}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total_amount"] == 500.75
    assert data["status"] == "Completed"


def test_delete_sale_not_found(client: TestClient):
    response = client.delete("/api/sales/999999")
    assert response.status_code == 404


def test_delete_sale_with_items_returns_409(client: TestClient, session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee = _seed_employee(session, "emp_409", role.id_role, store.id_store)
    sale = _seed_sale(session, store.id_store, employee.id_employee, total_amount=100.0)

    category = Category(category_name="Cat409", description="x")
    session.add(category)
    session.commit()
    session.refresh(category)

    product = ProductTemplate(
        sku="SKU-409",
        product_name="Prod409",
        brand="B",
        fixed_selling_price=50.0,
        category_id=category.id_category,
    )
    session.add(product)
    session.commit()
    session.refresh(product)

    item = SaleItem(
        sale_id=sale.id_sale,
        product_id=product.id_product,
        quantity=1,
        unit_price=50.0,
        subtotal=50.0,
    )
    session.add(item)
    session.commit()

    response = client.delete(f"/api/sales/{sale.id_sale}")
    assert response.status_code == 409
