from fastapi.testclient import TestClient
from sqlmodel import Session

from app.models.category import Category
from app.models.product import ProductTemplate
from app.models.stock import Stock
from app.models.store import Store

# ── Helpers ──────────────────────────────────────────────────────────


def _seed_category(session: Session, name: str = "Electrónica") -> Category:
    category = Category(category_name=name, description="Desc")
    session.add(category)
    session.commit()
    session.refresh(category)
    return category


def _seed_product(
    session: Session,
    category_id: int,
    sku: str = "SKU-001",
    name: str = "Producto Test",
) -> ProductTemplate:
    product = ProductTemplate(
        sku=sku,
        product_name=name,
        fixed_selling_price=10.0,
        category_id=category_id,
    )
    session.add(product)
    session.commit()
    session.refresh(product)
    return product


def _seed_store(session: Session, name: str = "TiendaTest") -> Store:
    store = Store(store_name=name, address="Calle Test 1")
    session.add(store)
    session.commit()
    session.refresh(store)
    return store


def _seed_stock(
    session: Session,
    product_id: int,
    store_id: int,
    quantity: int = 50,
    min_stock: int = 10,
) -> Stock:
    stock = Stock(
        product_id=product_id,
        store_id=store_id,
        quantity=quantity,
        min_stock=min_stock,
    )
    session.add(stock)
    session.commit()
    session.refresh(stock)
    return stock


# ── GET /api/stock/ ──────────────────────────────────────────────────


def test_read_stocks(client: TestClient, session: Session):
    cat = _seed_category(session)
    prod = _seed_product(session, cat.id_category)
    store = _seed_store(session)
    _seed_stock(session, prod.id_product, store.id_store, quantity=42)

    response = client.get("/api/stock/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["quantity"] == 42


def test_read_stocks_by_store(client: TestClient, session: Session):
    cat = _seed_category(session)
    prod1 = _seed_product(session, cat.id_category, sku="SKU-1")
    prod2 = _seed_product(session, cat.id_category, sku="SKU-2")
    store1 = _seed_store(session, "Store1")
    store2 = _seed_store(session, "Store2")

    _seed_stock(session, prod1.id_product, store1.id_store, quantity=10)
    _seed_stock(session, prod2.id_product, store2.id_store, quantity=20)

    response = client.get(f"/api/stock/by-store/{store1.id_store}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["quantity"] == 10


def test_read_stocks_by_product(client: TestClient, session: Session):
    cat = _seed_category(session)
    prod1 = _seed_product(session, cat.id_category, sku="SKU-1")
    prod2 = _seed_product(session, cat.id_category, sku="SKU-2")
    store = _seed_store(session)

    _seed_stock(session, prod1.id_product, store.id_store, quantity=15)
    _seed_stock(session, prod2.id_product, store.id_store, quantity=25)

    response = client.get(f"/api/stock/by-product/{prod1.id_product}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["quantity"] == 15


# ── GET /api/stock/{id} ──────────────────────────────────────────────


def test_read_stock_by_id(client: TestClient, session: Session):
    cat = _seed_category(session)
    prod = _seed_product(session, cat.id_category)
    store = _seed_store(session)
    stock = _seed_stock(session, prod.id_product, store.id_store, quantity=100)

    response = client.get(f"/api/stock/{stock.id_stock}")
    assert response.status_code == 200
    assert response.json()["quantity"] == 100


def test_read_stock_not_found(client: TestClient):
    response = client.get("/api/stock/999999")
    assert response.status_code == 404


# ── POST /api/stock/ ─────────────────────────────────────────────────


def test_create_stock(client: TestClient, session: Session):
    cat = _seed_category(session)
    prod = _seed_product(session, cat.id_category)
    store = _seed_store(session)

    payload = {
        "product_id": prod.id_product,
        "store_id": store.id_store,
        "quantity": 30,
        "min_stock": 5,
    }

    response = client.post("/api/stock/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["id_stock"] is not None
    assert data["quantity"] == 30


def test_create_stock_conflict(client: TestClient, session: Session):
    cat = _seed_category(session)
    prod = _seed_product(session, cat.id_category)
    store = _seed_store(session)
    _seed_stock(session, prod.id_product, store.id_store)

    payload = {"product_id": prod.id_product, "store_id": store.id_store, "quantity": 10}

    response = client.post("/api/stock/", json=payload)
    assert response.status_code == 409


def test_create_stock_bad_request(client: TestClient):
    payload = {"product_id": 999999, "store_id": 999999, "quantity": 10}

    response = client.post("/api/stock/", json=payload)
    assert response.status_code == 400


# ── PATCH /api/stock/{id} ────────────────────────────────────────────


def test_update_stock(client: TestClient, session: Session):
    cat = _seed_category(session)
    prod = _seed_product(session, cat.id_category)
    store = _seed_store(session)
    stock = _seed_stock(session, prod.id_product, store.id_store, quantity=10)

    response = client.patch(f"/api/stock/{stock.id_stock}", json={"quantity": 25})
    assert response.status_code == 200
    assert response.json()["quantity"] == 25


# ── DELETE /api/stock/{id} ───────────────────────────────────────────


def test_delete_stock(client: TestClient, session: Session):
    cat = _seed_category(session)
    prod = _seed_product(session, cat.id_category)
    store = _seed_store(session)
    stock = _seed_stock(session, prod.id_product, store.id_store)

    response = client.delete(f"/api/stock/{stock.id_stock}")
    assert response.status_code == 200
    assert response.json()["id_stock"] == stock.id_stock
