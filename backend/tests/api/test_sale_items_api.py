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


def _seed_category(session: Session) -> Category:
    category = Category(category_name="Electrónica", description="Gadgets")
    session.add(category)
    session.commit()
    session.refresh(category)
    return category


def _seed_product(session: Session, category_id: int, sku: str = "SKU-001") -> ProductTemplate:
    product = ProductTemplate(
        sku=sku,
        product_name="Producto Test",
        brand="Marca Test",
        fixed_selling_price=50.0,
        category_id=category_id,
    )
    session.add(product)
    session.commit()
    session.refresh(product)
    return product


def _seed_sale(
    session: Session,
    store_id: int,
    employee_id: int,
) -> Sale:
    sale = Sale(
        store_id=store_id,
        employee_id=employee_id,
        total_amount=100.0,
        status=SaleStatusEnum.Completed,
    )
    session.add(sale)
    session.commit()
    session.refresh(sale)
    return sale


def _seed_item(
    session: Session,
    sale_id: int,
    product_id: int,
    quantity: int = 2,
    unit_price: float = 50.0,
    subtotal: float = 100.0,
) -> SaleItem:
    item = SaleItem(
        sale_id=sale_id,
        product_id=product_id,
        quantity=quantity,
        unit_price=unit_price,
        subtotal=subtotal,
    )
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


# ── GET /api/sale-items/ ─────────────────────────────────────────────


def test_read_sale_items_returns_list(client: TestClient, session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee = _seed_employee(session, "emp1", role.id_role, store.id_store)
    category = _seed_category(session)
    product = _seed_product(session, category.id_category)
    sale = _seed_sale(session, store.id_store, employee.id_employee)

    _seed_item(session, sale.id_sale, product.id_product, quantity=1, subtotal=50.0)
    _seed_item(session, sale.id_sale, product.id_product, quantity=3, subtotal=150.0)

    response = client.get("/api/sale-items/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


def test_read_sale_items_empty(client: TestClient):
    response = client.get("/api/sale-items/")
    assert response.status_code == 200
    assert response.json() == []


def test_read_sale_items_pagination(client: TestClient, session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee = _seed_employee(session, "emp2", role.id_role, store.id_store)
    category = _seed_category(session)
    product = _seed_product(session, category.id_category)
    sale = _seed_sale(session, store.id_store, employee.id_employee)

    _seed_item(session, sale.id_sale, product.id_product, quantity=1, subtotal=10.0)
    _seed_item(session, sale.id_sale, product.id_product, quantity=2, subtotal=20.0)
    _seed_item(session, sale.id_sale, product.id_product, quantity=3, subtotal=30.0)

    response = client.get("/api/sale-items/?limit=2")
    assert response.status_code == 200
    assert len(response.json()) == 2


# ── GET /api/sale-items/{id} ─────────────────────────────────────────


def test_read_sale_item_by_id(client: TestClient, session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee = _seed_employee(session, "emp3", role.id_role, store.id_store)
    category = _seed_category(session)
    product = _seed_product(session, category.id_category)
    sale = _seed_sale(session, store.id_store, employee.id_employee)
    seeded = _seed_item(session, sale.id_sale, product.id_product, quantity=5, subtotal=250.0)

    response = client.get(f"/api/sale-items/{seeded.id_sale_item}")
    assert response.status_code == 200
    assert response.json()["quantity"] == 5


def test_read_sale_item_not_found(client: TestClient):
    response = client.get("/api/sale-items/999999")
    assert response.status_code == 404


# ── GET /api/sale-items/by-sale/{sale_id} ────────────────────────────


def test_read_items_by_sale(client: TestClient, session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee = _seed_employee(session, "emp4", role.id_role, store.id_store)
    category = _seed_category(session)
    product = _seed_product(session, category.id_category)
    sale1 = _seed_sale(session, store.id_store, employee.id_employee)
    sale2 = _seed_sale(session, store.id_store, employee.id_employee)

    _seed_item(session, sale1.id_sale, product.id_product, quantity=1, subtotal=10.0)
    _seed_item(session, sale2.id_sale, product.id_product, quantity=2, subtotal=20.0)

    response = client.get(f"/api/sale-items/by-sale/{sale1.id_sale}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["quantity"] == 1


def test_read_items_by_sale_empty(client: TestClient, session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee = _seed_employee(session, "emp5", role.id_role, store.id_store)
    sale = _seed_sale(session, store.id_store, employee.id_employee)

    response = client.get(f"/api/sale-items/by-sale/{sale.id_sale}")
    assert response.status_code == 200
    assert response.json() == []


# ── GET /api/sale-items/by-product/{product_id} ──────────────────────


def test_read_items_by_product(client: TestClient, session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee = _seed_employee(session, "emp6", role.id_role, store.id_store)
    category = _seed_category(session)
    product1 = _seed_product(session, category.id_category, sku="SKU-A")
    product2 = _seed_product(session, category.id_category, sku="SKU-B")
    sale = _seed_sale(session, store.id_store, employee.id_employee)

    _seed_item(session, sale.id_sale, product1.id_product, quantity=1, subtotal=10.0)
    _seed_item(session, sale.id_sale, product2.id_product, quantity=2, subtotal=20.0)

    response = client.get(f"/api/sale-items/by-product/{product1.id_product}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["quantity"] == 1


def test_read_items_by_product_empty(client: TestClient, session: Session):
    category = _seed_category(session)
    product = _seed_product(session, category.id_category, sku="SKU-EMPTY")

    response = client.get(f"/api/sale-items/by-product/{product.id_product}")
    assert response.status_code == 200
    assert response.json() == []


# ── POST /api/sale-items/ ────────────────────────────────────────────


def test_create_sale_item_returns_201(client: TestClient, session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee = _seed_employee(session, "emp7", role.id_role, store.id_store)
    category = _seed_category(session)
    product = _seed_product(session, category.id_category)
    sale = _seed_sale(session, store.id_store, employee.id_employee)

    payload = {
        "sale_id": sale.id_sale,
        "product_id": product.id_product,
        "quantity": 3,
        "unit_price": 25.0,
        "subtotal": 75.0,
    }

    response = client.post("/api/sale-items/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["id_sale_item"] is not None
    assert data["sale_id"] == sale.id_sale
    assert data["quantity"] == 3


def test_create_sale_item_bad_request_invalid_fk(client: TestClient):
    payload = {
        "sale_id": 9999,
        "product_id": 9999,
        "quantity": 1,
        "unit_price": 10.0,
        "subtotal": 10.0,
    }

    response = client.post("/api/sale-items/", json=payload)
    assert response.status_code == 400


# ── PATCH /api/sale-items/{id} ───────────────────────────────────────


def test_update_sale_item(client: TestClient, session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee = _seed_employee(session, "emp8", role.id_role, store.id_store)
    category = _seed_category(session)
    product = _seed_product(session, category.id_category)
    sale = _seed_sale(session, store.id_store, employee.id_employee)
    seeded = _seed_item(session, sale.id_sale, product.id_product, quantity=2, subtotal=100.0)

    response = client.patch(
        f"/api/sale-items/{seeded.id_sale_item}", json={"quantity": 5}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["quantity"] == 5
    assert data["unit_price"] == 50.0


def test_update_sale_item_not_found(client: TestClient):
    response = client.patch("/api/sale-items/999999", json={"quantity": 10})
    assert response.status_code == 404


def test_update_sale_item_partial(client: TestClient, session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee = _seed_employee(session, "emp9", role.id_role, store.id_store)
    category = _seed_category(session)
    product = _seed_product(session, category.id_category)
    sale = _seed_sale(session, store.id_store, employee.id_employee)
    seeded = _seed_item(
        session, sale.id_sale, product.id_product, quantity=3, unit_price=20.0, subtotal=60.0
    )

    response = client.patch(
        f"/api/sale-items/{seeded.id_sale_item}", json={"unit_price": 30.0}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["unit_price"] == 30.0
    assert data["quantity"] == 3
    assert data["subtotal"] == 60.0


# ── DELETE /api/sale-items/{id} ──────────────────────────────────────


def test_delete_sale_item(client: TestClient, session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee = _seed_employee(session, "emp10", role.id_role, store.id_store)
    category = _seed_category(session)
    product = _seed_product(session, category.id_category)
    sale = _seed_sale(session, store.id_store, employee.id_employee)
    seeded = _seed_item(session, sale.id_sale, product.id_product, quantity=1, subtotal=50.0)

    response = client.delete(f"/api/sale-items/{seeded.id_sale_item}")
    assert response.status_code == 200
    assert response.json()["id_sale_item"] == seeded.id_sale_item


def test_delete_sale_item_not_found(client: TestClient):
    response = client.delete("/api/sale-items/999999")
    assert response.status_code == 404
