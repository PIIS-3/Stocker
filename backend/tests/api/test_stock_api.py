from fastapi.testclient import TestClient
from sqlmodel import Session

from app.models.category import Category
from app.models.product import ProductTemplate
from app.models.store import Store


def _seed_store(session: Session, name: str = "Tienda API Test") -> Store:
    store = Store(store_name=name, address="Calle Test 123")
    session.add(store)
    session.commit()
    session.refresh(store)
    assert store.id_store is not None
    return store


def _seed_category(session: Session, name: str = "Categoría API Test") -> Category:
    category = Category(category_name=name, description="Descripción de prueba")
    session.add(category)
    session.commit()
    session.refresh(category)
    assert category.id_category is not None
    return category


def _seed_product(
    session: Session,
    category_id: int,
    sku: str = "SKU-API",
    name: str = "Producto API Test",
    price: float = 100.0,
) -> ProductTemplate:
    product = ProductTemplate(
        sku=sku,
        product_name=name,
        fixed_selling_price=price,
        category_id=category_id,
    )
    session.add(product)
    session.commit()
    session.refresh(product)
    return product


# ── GET /stock/ ──────────────────────────────────────────────────────


def test_read_stocks_returns_list(client: TestClient, session: Session):
    store = _seed_store(session)
    category = _seed_category(session)
    product1 = _seed_product(session, category.id_category, sku="SKU-A", name="Producto A")
    product2 = _seed_product(session, category.id_category, sku="SKU-B", name="Producto B")

    client.post(
        "/api/stock/",
        json={
            "quantity": 50,
            "min_stock": 10,
            "product_id": product1.id_product,
            "store_id": store.id_store,
        },
    )
    client.post(
        "/api/stock/",
        json={
            "quantity": 75,
            "min_stock": 15,
            "product_id": product2.id_product,
            "store_id": store.id_store,
        },
    )

    response = client.get("/api/stock/")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    quantities = {s["quantity"] for s in data}
    assert quantities == {50, 75}


def test_read_stocks_empty(client: TestClient):
    response = client.get("/api/stock/")

    assert response.status_code == 200
    assert response.json() == []


def test_read_stocks_pagination(client: TestClient, session: Session):
    store = _seed_store(session)
    category = _seed_category(session)
    product = _seed_product(session, category.id_category)

    for i in range(5):
        client.post(
            "/api/stock/",
            json={
                "quantity": 10 + i,
                "min_stock": 2,
                "product_id": product.id_product,
                "store_id": store.id_store,
            },
        )
        if i < 4:
            product = _seed_product(
                session,
                category.id_category,
                sku=f"SKU-{i}",
                name=f"Producto {i}",
            )

    response = client.get("/api/stock/?skip=0&limit=2")
    assert response.status_code == 200
    assert len(response.json()) == 2

    response = client.get("/api/stock/?skip=2&limit=2")
    assert response.status_code == 200
    assert len(response.json()) == 2


# ── GET /stock/{stock_id} ────────────────────────────────────────────


def test_read_stock_by_id(client: TestClient, session: Session):
    store = _seed_store(session)
    category = _seed_category(session)
    product = _seed_product(session, category.id_category, sku="SKU-BYID", name="Stock by ID")

    response = client.post(
        "/api/stock/",
        json={
            "quantity": 100,
            "min_stock": 20,
            "product_id": product.id_product,
            "store_id": store.id_store,
        },
    )
    assert response.status_code == 201
    stock_id = response.json()["id_stock"]

    response = client.get(f"/api/stock/{stock_id}")

    assert response.status_code == 200
    data = response.json()
    assert data["id_stock"] == stock_id
    assert data["quantity"] == 100
    assert data["min_stock"] == 20


def test_read_stock_by_id_not_found(client: TestClient):
    response = client.get("/api/stock/999999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Stock no encontrado."


# ── POST /stock/ ─────────────────────────────────────────────────────


def test_create_stock(client: TestClient, session: Session):
    store = _seed_store(session)
    category = _seed_category(session)
    product = _seed_product(session, category.id_category)

    response = client.post(
        "/api/stock/",
        json={
            "quantity": 50,
            "min_stock": 10,
            "product_id": product.id_product,
            "store_id": store.id_store,
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["quantity"] == 50
    assert data["min_stock"] == 10
    assert data["product_id"] == product.id_product
    assert data["store_id"] == store.id_store
    assert "id_stock" in data
    assert "created_at" in data


def test_create_stock_invalid_product(client: TestClient, session: Session):
    store = _seed_store(session)

    response = client.post(
        "/api/stock/",
        json={"quantity": 50, "min_stock": 10, "product_id": 999999, "store_id": store.id_store},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "El producto o tienda especificados no existen."


def test_create_stock_invalid_store(client: TestClient, session: Session):
    category = _seed_category(session)
    product = _seed_product(session, category.id_category)

    response = client.post(
        "/api/stock/",
        json={
            "quantity": 50,
            "min_stock": 10,
            "product_id": product.id_product,
            "store_id": 999999,
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "El producto o tienda especificados no existen."


def test_create_stock_duplicate_combination(client: TestClient, session: Session):
    store = _seed_store(session)
    category = _seed_category(session)
    product = _seed_product(session, category.id_category)

    # Crear primer stock
    response1 = client.post(
        "/api/stock/",
        json={
            "quantity": 50,
            "min_stock": 10,
            "product_id": product.id_product,
            "store_id": store.id_store,
        },
    )
    assert response1.status_code == 201

    # Intenta crear un stock duplicado (mismo producto y tienda)
    response2 = client.post(
        "/api/stock/",
        json={
            "quantity": 75,
            "min_stock": 15,
            "product_id": product.id_product,
            "store_id": store.id_store,
        },
    )

    assert response2.status_code == 409
    assert (
        response2.json()["detail"]
        == "Ya existe un registro de stock para ese producto y tienda."
    )


def test_create_stock_zero_quantity(client: TestClient, session: Session):
    store = _seed_store(session)
    category = _seed_category(session)
    product = _seed_product(session, category.id_category)

    response = client.post(
        "/api/stock/",
        json={
            "quantity": 0,
            "min_stock": 0,
            "product_id": product.id_product,
            "store_id": store.id_store,
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["quantity"] == 0
    assert data["min_stock"] == 0


# ── PATCH /stock/{stock_id} ──────────────────────────────────────────


def test_update_stock_quantity(client: TestClient, session: Session):
    store = _seed_store(session)
    category = _seed_category(session)
    product = _seed_product(session, category.id_category)

    create_response = client.post(
        "/api/stock/",
        json={
            "quantity": 50,
            "min_stock": 10,
            "product_id": product.id_product,
            "store_id": store.id_store,
        },
    )
    stock_id = create_response.json()["id_stock"]

    response = client.patch(
        f"/api/stock/{stock_id}",
        json={"quantity": 100},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["quantity"] == 100
    assert data["min_stock"] == 10  # No cambia


def test_update_stock_min_stock(client: TestClient, session: Session):
    store = _seed_store(session)
    category = _seed_category(session)
    product = _seed_product(session, category.id_category)

    create_response = client.post(
        "/api/stock/",
        json={
            "quantity": 50,
            "min_stock": 10,
            "product_id": product.id_product,
            "store_id": store.id_store,
        },
    )
    stock_id = create_response.json()["id_stock"]

    response = client.patch(
        f"/api/stock/{stock_id}",
        json={"min_stock": 25},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["min_stock"] == 25
    assert data["quantity"] == 50  # No cambia


def test_update_stock_both_fields(client: TestClient, session: Session):
    store = _seed_store(session)
    category = _seed_category(session)
    product = _seed_product(session, category.id_category)

    create_response = client.post(
        "/api/stock/",
        json={
            "quantity": 50,
            "min_stock": 10,
            "product_id": product.id_product,
            "store_id": store.id_store,
        },
    )
    stock_id = create_response.json()["id_stock"]

    response = client.patch(
        f"/api/stock/{stock_id}",
        json={"quantity": 150, "min_stock": 30},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["quantity"] == 150
    assert data["min_stock"] == 30


def test_update_stock_not_found(client: TestClient):
    response = client.patch(
        "/api/stock/999999",
        json={"quantity": 100},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Stock no encontrado."


def test_update_stock_to_zero(client: TestClient, session: Session):
    store = _seed_store(session)
    category = _seed_category(session)
    product = _seed_product(session, category.id_category)

    create_response = client.post(
        "/api/stock/",
        json={
            "quantity": 50,
            "min_stock": 10,
            "product_id": product.id_product,
            "store_id": store.id_store,
        },
    )
    stock_id = create_response.json()["id_stock"]

    response = client.patch(
        f"/api/stock/{stock_id}",
        json={"quantity": 0, "min_stock": 0},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["quantity"] == 0
    assert data["min_stock"] == 0


# ── DELETE /stock/{stock_id} ─────────────────────────────────────────


def test_delete_stock(client: TestClient, session: Session):
    store = _seed_store(session)
    category = _seed_category(session)
    product = _seed_product(session, category.id_category)

    create_response = client.post(
        "/api/stock/",
        json={
            "quantity": 50,
            "min_stock": 10,
            "product_id": product.id_product,
            "store_id": store.id_store,
        },
    )
    stock_id = create_response.json()["id_stock"]

    response = client.delete(f"/api/stock/{stock_id}")

    assert response.status_code == 200
    data = response.json()
    assert data["id_stock"] == stock_id

    # Verificar que se eliminó realmente
    get_response = client.get(f"/api/stock/{stock_id}")
    assert get_response.status_code == 404


def test_delete_stock_not_found(client: TestClient):
    response = client.delete("/api/stock/999999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Stock no encontrado."


def test_delete_stock_successful_removal(client: TestClient, session: Session):
    store = _seed_store(session)
    category = _seed_category(session)
    product = _seed_product(session, category.id_category)

    create_response = client.post(
        "/api/stock/",
        json={
            "quantity": 50,
            "min_stock": 10,
            "product_id": product.id_product,
            "store_id": store.id_store,
        },
    )
    stock_id = create_response.json()["id_stock"]

    # Lista antes de eliminar
    list_before = client.get("/api/stock/")
    assert len(list_before.json()) == 1

    # Eliminar
    delete_response = client.delete(f"/api/stock/{stock_id}")
    assert delete_response.status_code == 200

    # Lista después de eliminar
    list_after = client.get("/api/stock/")
    assert len(list_after.json()) == 0


# ── GET /stock/by-store/{store_id} ───────────────────────────────────


def test_read_stocks_by_store(client: TestClient, session: Session):
    store1 = _seed_store(session, "Tienda 1")
    store2 = _seed_store(session, "Tienda 2")
    category = _seed_category(session)
    product1 = _seed_product(session, category.id_category, sku="SKU-1")
    product2 = _seed_product(session, category.id_category, sku="SKU-2")

    client.post(
        "/api/stock/",
        json={
            "quantity": 50,
            "min_stock": 10,
            "product_id": product1.id_product,
            "store_id": store1.id_store,
        },
    )
    client.post(
        "/api/stock/",
        json={
            "quantity": 75,
            "min_stock": 15,
            "product_id": product2.id_product,
            "store_id": store1.id_store,
        },
    )
    client.post(
        "/api/stock/",
        json={
            "quantity": 100,
            "min_stock": 20,
            "product_id": product1.id_product,
            "store_id": store2.id_store,
        },
    )

    response = client.get(f"/api/stock/by-store/{store1.id_store}")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert all(s["store_id"] == store1.id_store for s in data)


# ── GET /stock/by-product/{product_id} ───────────────────────────────


def test_read_stocks_by_product(client: TestClient, session: Session):
    store1 = _seed_store(session, "Tienda 1")
    store2 = _seed_store(session, "Tienda 2")
    category = _seed_category(session)
    product1 = _seed_product(session, category.id_category, sku="SKU-A")
    product2 = _seed_product(session, category.id_category, sku="SKU-B")

    client.post(
        "/api/stock/",
        json={
            "quantity": 50,
            "min_stock": 10,
            "product_id": product1.id_product,
            "store_id": store1.id_store,
        },
    )
    client.post(
        "/api/stock/",
        json={
            "quantity": 75,
            "min_stock": 15,
            "product_id": product1.id_product,
            "store_id": store2.id_store,
        },
    )
    client.post(
        "/api/stock/",
        json={
            "quantity": 100,
            "min_stock": 20,
            "product_id": product2.id_product,
            "store_id": store1.id_store,
        },
    )

    response = client.get(f"/api/stock/by-product/{product1.id_product}")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert all(s["product_id"] == product1.id_product for s in data)
