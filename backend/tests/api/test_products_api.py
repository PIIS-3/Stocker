from fastapi.testclient import TestClient
from sqlmodel import Session

from app.models.category import Category
from app.models.product import ProductTemplate


def test_read_products_api(client: TestClient, session: Session):
    # 1. Crear una categoría necesaria para el ProductTemplate
    category = Category(category_name="Electrónica", description="Gadgets y más")
    session.add(category)
    session.commit()
    session.refresh(category)

    # 2. Crear una plantilla de producto
    product = ProductTemplate(
        sku="SKU001",
        product_name="Smartphone X",
        brand="Apple",
        fixed_selling_price=999.99,
        category_id=category.id_category,
    )
    session.add(product)
    session.commit()

    # 3. Hacer la petición a la API
    response = client.get("/api/products/")

    # 4. Verificar la respuesta
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["product_name"] == "Smartphone X"
    assert data[0]["sku"] == "SKU001"


def test_read_product_by_id_api(client: TestClient, session: Session):
    category = Category(category_name="Electrónica", description="Gadgets y más")
    session.add(category)
    session.commit()
    session.refresh(category)

    product = ProductTemplate(
        sku="SKU010",
        product_name="Tablet Z",
        brand="Samsung",
        fixed_selling_price=799.99,
        category_id=category.id_category,
    )
    session.add(product)
    session.commit()
    session.refresh(product)

    response = client.get(f"/api/products/{product.id_product}")

    assert response.status_code == 200
    data = response.json()
    assert data["id_product"] == product.id_product
    assert data["product_name"] == "Tablet Z"


def test_read_product_by_id_api_not_found(client: TestClient):
    response = client.get("/api/products/999999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Producto no encontrado."
