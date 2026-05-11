from fastapi.testclient import TestClient
from sqlmodel import Session

from app.models.enums import StatusEnum
from app.models.store import Store

# ── Helpers ──────────────────────────────────────────────────────────


def _seed(
    session: Session,
    name: str,
    address: str = "Calle Mayor 1",
    status: StatusEnum = StatusEnum.Active,
) -> Store:
    store = Store(store_name=name, address=address, status=status)
    session.add(store)
    session.commit()
    session.refresh(store)
    return store


# ── GET /api/stores/ ─────────────────────────────────────────────────


def test_read_stores_returns_list(client: TestClient, session: Session):
    _seed(session, "TiendaNorte")
    _seed(session, "TiendaSur")

    response = client.get("/api/stores/")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    names = {s["store_name"] for s in data}
    assert names == {"TiendaNorte", "TiendaSur"}


def test_read_stores_empty(client: TestClient):
    response = client.get("/api/stores/")

    assert response.status_code == 200
    assert response.json() == []


def test_read_stores_pagination_limit(client: TestClient, session: Session):
    _seed(session, "A")
    _seed(session, "B")
    _seed(session, "C")

    response = client.get("/api/stores/?limit=2")

    assert response.status_code == 200
    assert len(response.json()) == 2


def test_read_stores_pagination_skip(client: TestClient, session: Session):
    _seed(session, "A")
    _seed(session, "B")
    _seed(session, "C")

    response = client.get("/api/stores/?skip=2")

    assert response.status_code == 200
    assert len(response.json()) == 1


# ── GET /api/stores/{id} ─────────────────────────────────────────────


def test_read_store_by_id(client: TestClient, session: Session):
    seeded = _seed(session, "TiendaCentral", address="Gran Vía 28")

    response = client.get(f"/api/stores/{seeded.id_store}")

    assert response.status_code == 200
    data = response.json()
    assert data["id_store"] == seeded.id_store
    assert data["store_name"] == "TiendaCentral"
    assert data["address"] == "Gran Vía 28"


def test_read_store_by_id_not_found(client: TestClient):
    response = client.get("/api/stores/999999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Tienda no encontrada."


# ── GET /api/stores/by-name/{name} ───────────────────────────────────


def test_read_store_by_name(client: TestClient, session: Session):
    _seed(session, "TiendaExpress")

    response = client.get("/api/stores/by-name/TiendaExpress")

    assert response.status_code == 200
    assert response.json()["store_name"] == "TiendaExpress"


def test_read_store_by_name_not_found(client: TestClient):
    response = client.get("/api/stores/by-name/Inexistente")

    assert response.status_code == 404
    assert response.json()["detail"] == "Tienda no encontrada."


# ── POST /api/stores/ ────────────────────────────────────────────────


def test_create_store_returns_201(client: TestClient):
    payload = {"store_name": "TiendaNueva", "address": "Calle de la Paz 5"}

    response = client.post("/api/stores/", json=payload)

    assert response.status_code == 201
    data = response.json()
    assert data["id_store"] is not None
    assert data["store_name"] == "TiendaNueva"
    assert data["address"] == "Calle de la Paz 5"
    assert data["status"] == StatusEnum.Active.value


def test_create_store_default_status_active(client: TestClient):
    payload = {"store_name": "TiendaOeste", "address": "Av. Oeste 100"}

    response = client.post("/api/stores/", json=payload)

    assert response.status_code == 201
    assert response.json()["status"] == StatusEnum.Active.value


def test_create_store_explicit_inactive(client: TestClient):
    payload = {
        "store_name": "TiendaCerrada",
        "address": "Calle Sin Salida 0",
        "status": StatusEnum.Inactive.value,
    }

    response = client.post("/api/stores/", json=payload)

    assert response.status_code == 201
    assert response.json()["status"] == StatusEnum.Inactive.value


def test_create_store_duplicate_name_returns_409(client: TestClient, session: Session):
    _seed(session, "TiendaDuplicada")
    payload = {"store_name": "TiendaDuplicada", "address": "Calle Duplicada 2"}

    response = client.post("/api/stores/", json=payload)

    assert response.status_code == 409
    assert response.json()["detail"] == "Ya existe una tienda con ese nombre."


def test_create_store_missing_name_returns_422(client: TestClient):
    payload = {"address": "Sin nombre"}

    response = client.post("/api/stores/", json=payload)

    assert response.status_code == 422


def test_create_store_missing_address_returns_422(client: TestClient):
    payload = {"store_name": "SinDireccion"}

    response = client.post("/api/stores/", json=payload)

    assert response.status_code == 422


# ── PATCH /api/stores/{id} ───────────────────────────────────────────


def test_update_store_address(client: TestClient, session: Session):
    seeded = _seed(session, "TiendaCentral", address="Calle Original 1")

    response = client.patch(
        f"/api/stores/{seeded.id_store}",
        json={"address": "Calle Actualizada 99"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["address"] == "Calle Actualizada 99"
    assert data["store_name"] == "TiendaCentral"  # sin cambios


def test_update_store_name(client: TestClient, session: Session):
    seeded = _seed(session, "NombreViejo")

    response = client.patch(
        f"/api/stores/{seeded.id_store}",
        json={"store_name": "NombreNuevo"},
    )

    assert response.status_code == 200
    assert response.json()["store_name"] == "NombreNuevo"


def test_update_store_same_name_no_conflict(client: TestClient, session: Session):
    seeded = _seed(session, "SinCambio")

    response = client.patch(
        f"/api/stores/{seeded.id_store}",
        json={"store_name": "SinCambio"},
    )

    assert response.status_code == 200
    assert response.json()["store_name"] == "SinCambio"


def test_update_store_name_conflict_with_other(client: TestClient, session: Session):
    _seed(session, "Ocupada")
    seeded = _seed(session, "Libre")

    response = client.patch(
        f"/api/stores/{seeded.id_store}",
        json={"store_name": "Ocupada"},
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "Ya existe una tienda con ese nombre."


def test_update_store_not_found(client: TestClient):
    response = client.patch("/api/stores/999999", json={"address": "X"})

    assert response.status_code == 404
    assert response.json()["detail"] == "Tienda no encontrada."


# ── DELETE /api/stores/{id} ──────────────────────────────────────────


def test_delete_store_returns_deleted_record(client: TestClient, session: Session):
    seeded = _seed(session, "Efimera", address="Calle Sin Futuro 0")

    response = client.delete(f"/api/stores/{seeded.id_store}")

    assert response.status_code == 200
    data = response.json()
    assert data["id_store"] == seeded.id_store
    assert data["store_name"] == "Efimera"


def test_delete_store_removes_from_list(client: TestClient, session: Session):
    seeded = _seed(session, "Transitoria")

    client.delete(f"/api/stores/{seeded.id_store}")
    response = client.get("/api/stores/")

    assert response.status_code == 200
    assert response.json() == []


def test_delete_store_not_found(client: TestClient):
    response = client.delete("/api/stores/999999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Tienda no encontrada."
