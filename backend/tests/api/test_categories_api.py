from fastapi.testclient import TestClient
from sqlmodel import Session

from app.models.category import Category
from app.models.enums import StatusEnum


# ── Helpers ──────────────────────────────────────────────────────────

def _seed(session: Session, name: str, description: str = "Desc", status: StatusEnum = StatusEnum.Active) -> Category:
    category = Category(category_name=name, description=description, status=status)
    session.add(category)
    session.commit()
    session.refresh(category)
    return category


# ── GET /api/categories/ ─────────────────────────────────────────────

def test_read_categories_returns_list(client: TestClient, session: Session):
    _seed(session, "Electrónica")
    _seed(session, "Hogar")

    response = client.get("/api/categories/")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    names = {c["category_name"] for c in data}
    assert names == {"Electrónica", "Hogar"}


def test_read_categories_empty(client: TestClient):
    response = client.get("/api/categories/")

    assert response.status_code == 200
    assert response.json() == []


def test_read_categories_pagination_limit(client: TestClient, session: Session):
    _seed(session, "A")
    _seed(session, "B")
    _seed(session, "C")

    response = client.get("/api/categories/?limit=2")

    assert response.status_code == 200
    assert len(response.json()) == 2


def test_read_categories_pagination_skip(client: TestClient, session: Session):
    _seed(session, "A")
    _seed(session, "B")
    _seed(session, "C")

    response = client.get("/api/categories/?skip=2")

    assert response.status_code == 200
    assert len(response.json()) == 1


# ── GET /api/categories/{id} ─────────────────────────────────────────

def test_read_category_by_id(client: TestClient, session: Session):
    seeded = _seed(session, "Deportes", description="Artículos deportivos")

    response = client.get(f"/api/categories/{seeded.id_category}")

    assert response.status_code == 200
    data = response.json()
    assert data["id_category"] == seeded.id_category
    assert data["category_name"] == "Deportes"
    assert data["description"] == "Artículos deportivos"


def test_read_category_by_id_not_found(client: TestClient):
    response = client.get("/api/categories/999999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Categoría no encontrada."


# ── GET /api/categories/by-name/{name} ───────────────────────────────

def test_read_category_by_name(client: TestClient, session: Session):
    _seed(session, "Libros")

    response = client.get("/api/categories/by-name/Libros")

    assert response.status_code == 200
    data = response.json()
    assert data["category_name"] == "Libros"


def test_read_category_by_name_not_found(client: TestClient):
    response = client.get("/api/categories/by-name/Inexistente")

    assert response.status_code == 404
    assert response.json()["detail"] == "Categoría no encontrada."


# ── POST /api/categories/ ────────────────────────────────────────────

def test_create_category_returns_201(client: TestClient):
    payload = {"category_name": "Tecnología", "description": "Todo tech"}

    response = client.post("/api/categories/", json=payload)

    assert response.status_code == 201
    data = response.json()
    assert data["id_category"] is not None
    assert data["category_name"] == "Tecnología"
    assert data["description"] == "Todo tech"
    assert data["status"] == StatusEnum.Active.value


def test_create_category_default_status_active(client: TestClient):
    payload = {"category_name": "Música"}

    response = client.post("/api/categories/", json=payload)

    assert response.status_code == 201
    assert response.json()["status"] == StatusEnum.Active.value


def test_create_category_explicit_inactive(client: TestClient):
    payload = {"category_name": "Archivada", "status": StatusEnum.Inactive.value}

    response = client.post("/api/categories/", json=payload)

    assert response.status_code == 201
    assert response.json()["status"] == StatusEnum.Inactive.value


def test_create_category_duplicate_name_returns_409(client: TestClient, session: Session):
    _seed(session, "Tecnología")
    payload = {"category_name": "Tecnología"}

    response = client.post("/api/categories/", json=payload)

    assert response.status_code == 409
    assert response.json()["detail"] == "Ya existe una categoría con ese nombre."


# ── PATCH /api/categories/{id} ───────────────────────────────────────

def test_update_category_description(client: TestClient, session: Session):
    seeded = _seed(session, "Hogar", description="Original")

    response = client.patch(
        f"/api/categories/{seeded.id_category}",
        json={"description": "Renovada"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["description"] == "Renovada"
    assert data["category_name"] == "Hogar"  # sin cambios


def test_update_category_name(client: TestClient, session: Session):
    seeded = _seed(session, "Nombre viejo")

    response = client.patch(
        f"/api/categories/{seeded.id_category}",
        json={"category_name": "Nombre nuevo"},
    )

    assert response.status_code == 200
    assert response.json()["category_name"] == "Nombre nuevo"


def test_update_category_same_name_no_conflict(client: TestClient, session: Session):
    # Enviar el MISMO nombre que ya tiene la categoría no debe devolver 409.
    seeded = _seed(session, "Sin cambio")

    response = client.patch(
        f"/api/categories/{seeded.id_category}",
        json={"category_name": "Sin cambio"},
    )

    assert response.status_code == 200
    assert response.json()["category_name"] == "Sin cambio"


def test_update_category_name_conflict_with_other(client: TestClient, session: Session):
    _seed(session, "Ocupado")
    seeded = _seed(session, "Libre")

    response = client.patch(
        f"/api/categories/{seeded.id_category}",
        json={"category_name": "Ocupado"},
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "Ya existe una categoría con ese nombre."


def test_update_category_not_found(client: TestClient):
    response = client.patch("/api/categories/999999", json={"description": "X"})

    assert response.status_code == 404
    assert response.json()["detail"] == "Categoría no encontrada."


# ── DELETE /api/categories/{id} ──────────────────────────────────────

def test_delete_category_returns_deleted_record(client: TestClient, session: Session):
    seeded = _seed(session, "Efímera", description="Será borrada")

    response = client.delete(f"/api/categories/{seeded.id_category}")

    assert response.status_code == 200
    data = response.json()
    assert data["id_category"] == seeded.id_category
    assert data["category_name"] == "Efímera"


def test_delete_category_removes_from_list(client: TestClient, session: Session):
    seeded = _seed(session, "Transitoria")

    client.delete(f"/api/categories/{seeded.id_category}")
    response = client.get("/api/categories/")

    assert response.status_code == 200
    assert response.json() == []


def test_delete_category_not_found(client: TestClient):
    response = client.delete("/api/categories/999999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Categoría no encontrada."
