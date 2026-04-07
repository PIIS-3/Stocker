import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session
from app.models.product import ProductTemplate
from app.models.category import Category


# ─── Fixture de categoría reutilizable ───────────────────────────────────────

@pytest.fixture
def category(session: Session) -> Category:
    cat = Category(category_name="Electrónica", description="Gadgets y más")
    session.add(cat)
    session.commit()
    session.refresh(cat)
    return cat


def _product_payload(category_id: int, sku: str = "SKU001", price: float = 999.99) -> dict:
    return {
        "sku": sku,
        "product_name": "Smartphone X",
        "brand": "Apple",
        "fixed_selling_price": price,
        "category_id": category_id,
    }


# ─── Tests existentes ─────────────────────────────────────────────────────────

def test_read_products_api(client: TestClient, session: Session, category: Category):
    """GET /api/products/ devuelve la lista de productos existentes."""
    product = ProductTemplate(
        sku="SKU001",
        product_name="Smartphone X",
        brand="Apple",
        fixed_selling_price=999.99,
        category_id=category.id_category,
    )
    session.add(product)
    session.commit()

    response = client.get("/api/products/")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["product_name"] == "Smartphone X"
    assert data[0]["sku"] == "SKU001"


# ─── Nuevos tests ─────────────────────────────────────────────────────────────

def test_read_products_empty_returns_empty_list(client: TestClient):
    """GET /api/products/ sin productos devuelve [] no 500."""
    response = client.get("/api/products/")
    assert response.status_code == 200
    assert response.json() == []


def test_read_products_pagination(client: TestClient, session: Session, category: Category):
    """GET /api/products/ con distintos valores de skip y limit respeta la paginación."""
    # Crear 5 productos
    for i in range(1, 6):
        session.add(
            ProductTemplate(
                sku=f"SKU{i:03d}",
                product_name=f"Producto {i}",
                fixed_selling_price=float(i * 10),
                category_id=category.id_category,
            )
        )
    session.commit()

    # limit=2 → devuelve sólo 2
    r1 = client.get("/api/products/?skip=0&limit=2")
    assert r1.status_code == 200
    assert len(r1.json()) == 2

    # skip=3, limit=10 → devuelve los 2 restantes
    r2 = client.get("/api/products/?skip=3&limit=10")
    assert r2.status_code == 200
    assert len(r2.json()) == 2

    # skip=10 → fuera de rango, devuelve []
    r3 = client.get("/api/products/?skip=10&limit=10")
    assert r3.status_code == 200
    assert r3.json() == []


def test_create_product_negative_price_returns_400(client: TestClient, category: Category):
    """POST /api/products/ con precio negativo devuelve 400."""
    payload = _product_payload(category.id_category, price=-1.0)
    response = client.post("/api/products/", json=payload)
    assert response.status_code == 400
    assert "negativo" in response.json()["detail"].lower()


def test_create_product_duplicate_sku_returns_409(
    client: TestClient, session: Session, category: Category
):
    """POST /api/products/ con SKU duplicado devuelve 409."""
    # Primer producto OK
    r1 = client.post("/api/products/", json=_product_payload(category.id_category, sku="DUP001"))
    assert r1.status_code == 201

    # Segundo producto con el mismo SKU
    r2 = client.post("/api/products/", json=_product_payload(category.id_category, sku="DUP001"))
    assert r2.status_code == 409
    assert "DUP001" in r2.json()["detail"]


def test_create_product_nonexistent_category_returns_error(client: TestClient):
    """POST /api/products/ con category_id inexistente devuelve error (404)."""
    payload = _product_payload(category_id=99999)
    response = client.post("/api/products/", json=payload)
    # El crud lanza 404 cuando la categoría no existe
    assert response.status_code == 404
    assert "categor" in response.json()["detail"].lower()


def test_get_product_invalid_id_returns_404(client: TestClient):
    """GET /api/products/{id} con ID inexistente devuelve 404."""
    response = client.get("/api/products/99999")
    assert response.status_code == 404
    assert "99999" in response.json()["detail"]
