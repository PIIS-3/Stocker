from fastapi.testclient import TestClient
from sqlmodel import Session

from app.models.category import Category
from app.models.product import ProductTemplate
from app.models.enums import StatusEnum


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


# ── GET /api/products/ ───────────────────────────────────────────────

def test_read_products_returns_list(client: TestClient, session: Session):
    cat = _seed_category(session)
    _seed_product(session, cat.id_category, sku="SKU-A", name="Producto A")
    _seed_product(session, cat.id_category, sku="SKU-B", name="Producto B")

    response = client.get("/api/products/")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    names = {p["product_name"] for p in data}
    assert names == {"Producto A", "Producto B"}


def test_read_products_empty(client: TestClient):
    # Lista vacía es una respuesta válida (200), no un error 404.
    response = client.get("/api/products/")

    assert response.status_code == 200
    assert response.json() == []


# ── GET /api/products/{id} ───────────────────────────────────────────

def test_read_product_by_id(client: TestClient, session: Session):
    cat = _seed_category(session)
    product = _seed_product(session, cat.id_category, sku="SKU-ID", name="Tablet Z")

    response = client.get(f"/api/products/{product.id_product}")

    assert response.status_code == 200
    data = response.json()
    assert data["id_product"] == product.id_product
    assert data["product_name"] == "Tablet Z"


def test_read_product_by_id_not_found(client: TestClient):
    response = client.get("/api/products/999999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Producto no encontrado."


# ── GET /api/products/by-sku/{sku} ───────────────────────────────────

def test_read_product_by_sku(client: TestClient, session: Session):
    cat = _seed_category(session)
    _seed_product(session, cat.id_category, sku="ELEC-001", name="SmartphoneX")

    response = client.get("/api/products/by-sku/ELEC-001")

    assert response.status_code == 200
    data = response.json()
    assert data["sku"] == "ELEC-001"
    assert data["product_name"] == "SmartphoneX"


def test_read_product_by_sku_not_found(client: TestClient):
    response = client.get("/api/products/by-sku/NO-EXISTE")

    assert response.status_code == 404
    assert response.json()["detail"] == "Producto no encontrado."


# ── GET /api/products/by-name/{product_name} ────────────────────────

def test_read_product_by_name(client: TestClient, session: Session):
    cat = _seed_category(session)
    _seed_product(session, cat.id_category, sku="SKU-NM", name="AuricularesP")

    response = client.get("/api/products/by-name/AuricularesP")

    assert response.status_code == 200
    assert response.json()["product_name"] == "AuricularesP"


def test_read_product_by_name_not_found(client: TestClient):
    response = client.get("/api/products/by-name/Inexistente")

    assert response.status_code == 404
    assert response.json()["detail"] == "Producto no encontrado."


# ── POST /api/products/ ──────────────────────────────────────────────

def test_create_product_returns_201(client: TestClient, session: Session):
    cat = _seed_category(session)
    payload = {
        "sku": "NEW-001",
        "product_name": "LaptopUltra",
        "brand": "Dell",
        "fixed_selling_price": 1500.0,
        "category_id": cat.id_category,
    }

    response = client.post("/api/products/", json=payload)

    assert response.status_code == 201
    data = response.json()
    assert data["id_product"] is not None
    assert data["sku"] == "NEW-001"
    assert data["product_name"] == "LaptopUltra"
    assert data["brand"] == "Dell"
    assert data["fixed_selling_price"] == 1500.0


def test_create_product_default_status_active(client: TestClient, session: Session):
    # El campo `status` es opcional en ProductTemplateCreate; su default en el
    # schema es StatusEnum.Active, por lo que el endpoint no necesita recibirlo.
    cat = _seed_category(session)
    payload = {
        "sku": "ACT-001",
        "product_name": "Monitor4K",
        "fixed_selling_price": 400.0,
        "category_id": cat.id_category,
    }

    response = client.post("/api/products/", json=payload)

    assert response.status_code == 201
    assert response.json()["status"] == StatusEnum.Active.value


def test_create_product_duplicate_sku_returns_409(client: TestClient, session: Session):
    # El endpoint comprueba la unicidad del SKU antes de insertar en BD.
    cat = _seed_category(session)
    _seed_product(session, cat.id_category, sku="DUP-001")
    payload = {
        "sku": "DUP-001",
        "product_name": "OtroProducto",
        "fixed_selling_price": 50.0,
        "category_id": cat.id_category,
    }

    response = client.post("/api/products/", json=payload)

    assert response.status_code == 409
    assert response.json()["detail"] == "Ya existe un producto con ese SKU."


def test_create_product_invalid_category_returns_400(client: TestClient):
    # SQLite necesita PRAGMA foreign_keys=ON (activado en conftest) para que
    # la IntegrityError se dispare igual que en PostgreSQL con FK inválida.
    payload = {
        "sku": "FK-001",
        "product_name": "ProductoHuerfano",
        "fixed_selling_price": 10.0,
        "category_id": 999999,
    }

    response = client.post("/api/products/", json=payload)

    assert response.status_code == 400
    assert response.json()["detail"] == "La categoría especificada no existe."


def test_create_product_negative_price_rejected(client: TestClient, session: Session):
    # El rechazo viene de la validación Pydantic (ge=0 en fixed_selling_price),
    # no del endpoint ni de la BD; por eso el status es 422.
    cat = _seed_category(session)
    payload = {
        "sku": "NEG-001",
        "product_name": "ProductoInvalido",
        "fixed_selling_price": -1.0,
        "category_id": cat.id_category,
    }

    response = client.post("/api/products/", json=payload)

    assert response.status_code == 422


# ── PATCH /api/products/{id} ─────────────────────────────────────────

def test_update_product_name(client: TestClient, session: Session):
    # Los campos no enviados permanecen sin cambios (comportamiento PATCH parcial).
    cat = _seed_category(session)
    product = _seed_product(session, cat.id_category, sku="UPD-001", name="NombreViejo")

    response = client.patch(
        f"/api/products/{product.id_product}",
        json={"product_name": "NombreNuevo"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["product_name"] == "NombreNuevo"
    assert data["sku"] == "UPD-001"  # sin cambios


def test_update_product_same_sku_no_conflict(client: TestClient, session: Session):
    # Enviar el mismo SKU que ya tiene el producto no debe devolver 409.
    # El endpoint compara existing.id_product != product_id para permitirlo.
    cat = _seed_category(session)
    product = _seed_product(session, cat.id_category, sku="SAME-SKU")

    response = client.patch(
        f"/api/products/{product.id_product}",
        json={"sku": "SAME-SKU"},
    )

    assert response.status_code == 200
    assert response.json()["sku"] == "SAME-SKU"


def test_update_product_sku_conflict_with_other(client: TestClient, session: Session):
    cat = _seed_category(session)
    _seed_product(session, cat.id_category, sku="OCUPADO", name="ProductoA")
    product_b = _seed_product(session, cat.id_category, sku="LIBRE", name="ProductoB")

    response = client.patch(
        f"/api/products/{product_b.id_product}",
        json={"sku": "OCUPADO"},
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "Ya existe un producto con ese SKU."


def test_update_product_not_found(client: TestClient):
    response = client.patch("/api/products/999999", json={"product_name": "X"})

    assert response.status_code == 404
    assert response.json()["detail"] == "Producto no encontrado."


# ── DELETE /api/products/{id} ────────────────────────────────────────

def test_delete_product_returns_deleted_record(client: TestClient, session: Session):
    # El DELETE devuelve el objeto completo del producto eliminado, no un 204 vacío.
    cat = _seed_category(session)
    product = _seed_product(session, cat.id_category, sku="DEL-001", name="Efimero")

    response = client.delete(f"/api/products/{product.id_product}")

    assert response.status_code == 200
    data = response.json()
    assert data["id_product"] == product.id_product
    assert data["product_name"] == "Efimero"


def test_delete_product_removes_from_list(client: TestClient, session: Session):
    # Test de estado secundario: verifica que el producto desaparece del listado,
    # no que la respuesta del DELETE sea correcta (eso lo cubre el test anterior).
    cat = _seed_category(session)
    product = _seed_product(session, cat.id_category, sku="DEL-LIST")

    client.delete(f"/api/products/{product.id_product}")
    response = client.get("/api/products/")

    assert response.status_code == 200
    assert response.json() == []


def test_delete_product_not_found(client: TestClient):
    response = client.delete("/api/products/999999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Producto no encontrado."
