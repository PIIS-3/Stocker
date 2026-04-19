import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.models.store import Store


# ── Helpers ──────────────────────────────────────────────────────────

def _create_store(session: Session, name: str = "Tienda Central", address: str = "Calle Mayor 1") -> Store:
    """Inserta una tienda directamente en la BD de prueba."""
    store = Store(store_name=name, address=address)
    session.add(store)
    session.commit()
    session.refresh(store)
    return store


# ── GET /api/stores/ ─────────────────────────────────────────────────

def test_list_stores_empty(client: TestClient):
    """GET lista devuelve [] cuando no hay tiendas."""
    response = client.get("/api/stores/")
    assert response.status_code == 200
    assert response.json() == []


def test_list_stores_returns_all(client: TestClient, session: Session):
    """GET lista devuelve todas las tiendas existentes."""
    _create_store(session, "Tienda A")
    _create_store(session, "Tienda B")

    response = client.get("/api/stores/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2  # Usamos >= por si hay otras tiendas del setup global, aunque limpiamos memoria
    names = {s["store_name"] for s in data}
    assert "Tienda A" in names
    assert "Tienda B" in names


# ── GET /api/stores/{id} ─────────────────────────────────────────────

def test_get_store_by_id(client: TestClient, session: Session):
    """GET detalle devuelve la tienda correcta."""
    store = _create_store(session)

    response = client.get(f"/api/stores/{store.id_store}")
    assert response.status_code == 200
    data = response.json()
    assert data["id_store"] == store.id_store
    assert data["store_name"] == "Tienda Central"
    assert data["address"] == "Calle Mayor 1"
    assert data["status"] == "Active"


def test_get_store_not_found(client: TestClient):
    """GET detalle devuelve 404 si la tienda no existe."""
    response = client.get("/api/stores/9999")
    assert response.status_code == 404
    assert "no encontrada" in response.json()["detail"]


# ── POST /api/stores/ ────────────────────────────────────────────────

def test_create_store(client: TestClient):
    """POST crea una tienda y devuelve 201 con los datos."""
    payload = {"store_name": "Nueva Tienda", "address": "Av. Libertad 5"}
    response = client.post("/api/stores/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["store_name"] == "Nueva Tienda"
    assert data["address"] == "Av. Libertad 5"
    assert data["status"] == "Active"
    assert "id_store" in data


def test_create_store_default_status(client: TestClient):
    """POST sin status -> status por defecto es Active."""
    response = client.post("/api/stores/", json={"store_name": "Solo Nombre"})
    assert response.status_code == 201
    assert response.json()["status"] == "Active"


def test_create_store_duplicate_name(client: TestClient, session: Session):
    """POST con nombre duplicado devuelve 409 Conflict."""
    _create_store(session, "Tienda Única")

    response = client.post("/api/stores/", json={"store_name": "Tienda Única"})
    assert response.status_code == 409
    assert "Tienda Única" in response.json()["detail"]


def test_create_store_missing_name(client: TestClient):
    """POST sin store_name devuelve 422 Unprocessable Entity."""
    response = client.post("/api/stores/", json={"address": "Sin nombre"})
    assert response.status_code == 422


def test_create_store_blank_name(client: TestClient):
    """POST con store_name de solo espacios devuelve 422."""
    response = client.post("/api/stores/", json={"store_name": "   "})
    assert response.status_code == 422


# ── PUT /api/stores/{id} ─────────────────────────────────────────────

def test_update_store(client: TestClient, session: Session):
    """PUT actualiza los campos enviados correctamente."""
    store = _create_store(session)

    payload = {"store_name": "Tienda Renovada", "address": "Nueva Dirección 99"}
    response = client.put(f"/api/stores/{store.id_store}", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["store_name"] == "Tienda Renovada"
    assert data["address"] == "Nueva Dirección 99"


def test_update_store_partial(client: TestClient, session: Session):
    """PUT parcial solo actualiza el campo enviado."""
    store = _create_store(session, address="Dirección Original")

    response = client.put(f"/api/stores/{store.id_store}", json={"address": "Dirección Nueva"})
    assert response.status_code == 200
    data = response.json()
    assert data["store_name"] == "Tienda Central"   # sin cambios
    assert data["address"] == "Dirección Nueva"


def test_update_store_not_found(client: TestClient):
    """PUT devuelve 404 si la tienda no existe."""
    response = client.put("/api/stores/9999", json={"store_name": "X"})
    assert response.status_code == 404


def test_update_store_duplicate_name(client: TestClient, session: Session):
    """PUT devuelve 409 si el nuevo nombre ya lo usa otra tienda."""
    _create_store(session, "Tienda A")
    store_b = _create_store(session, "Tienda B")

    response = client.put(f"/api/stores/{store_b.id_store}", json={"store_name": "Tienda A"})
    assert response.status_code == 409


# ── DELETE /api/stores/{id} ──────────────────────────────────────────

def test_delete_store(client: TestClient, session: Session):
    """DELETE elimina la tienda y devuelve sus datos."""
    store = _create_store(session)

    response = client.delete(f"/api/stores/{store.id_store}")
    assert response.status_code == 200
    assert response.json()["id_store"] == store.id_store

    # Verificar que ya no existe
    get_response = client.get(f"/api/stores/{store.id_store}")
    assert get_response.status_code == 404


def test_delete_store_not_found(client: TestClient):
    """DELETE devuelve 404 si la tienda no existe."""
    response = client.delete("/api/stores/9999")
    assert response.status_code == 404
