import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.models.store import Store
from app.models.role import Role
from app.models.employee import Employee
from app.core.security import hash_password


# ── Helpers ──────────────────────────────────────────────────────────

def _create_role(session: Session, name: str = "Manager") -> Role:
    """Inserta un rol directamente en la BD de prueba."""
    from app.models.enums import RoleEnum, StatusEnum
    role = Role(role_name=RoleEnum.Manager)
    session.add(role)
    session.commit()
    session.refresh(role)
    return role


def _create_store(session: Session, name: str = "Tienda Test") -> Store:
    """Inserta una tienda directamente en la BD de prueba."""
    store = Store(store_name=name)
    session.add(store)
    session.commit()
    session.refresh(store)
    return store


def _create_user(
    session: Session,
    role: Role,
    store: Store,
    username: str = "jdoe",
    first_name: str = "John",
    last_name: str = "Doe",
) -> Employee:
    """Inserta un usuario directamente en la BD de prueba."""
    user = Employee(
        first_name=first_name,
        last_name=last_name,
        username=username,
        hashed_password=hash_password("secret123"),
        role_id=role.id_role,
        store_id=store.id_store,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def _valid_payload(role: Role, store: Store, username: str = "nuevo_user") -> dict:
    return {
        "first_name": "Ana",
        "last_name": "García",
        "username": username,
        "password": "password123",
        "role_id": role.id_role,
        "store_id": store.id_store,
    }


# ── GET /api/users/ ──────────────────────────────────────────────────

def test_list_users_empty(client: TestClient):
    """GET lista devuelve [] cuando no hay usuarios."""
    response = client.get("/api/users/")
    assert response.status_code == 200
    assert response.json() == []


def test_list_users_returns_all(client: TestClient, session: Session):
    """GET lista devuelve todos los usuarios existentes."""
    role = _create_role(session)
    store = _create_store(session)
    _create_user(session, role, store, username="user1")
    _create_user(session, role, store, username="user2")

    response = client.get("/api/users/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2
    usernames = {u["username"] for u in data}
    assert "user1" in usernames
    assert "user2" in usernames


# ── GET /api/users/{id} ──────────────────────────────────────────────

def test_get_user_by_id(client: TestClient, session: Session):
    """GET detalle devuelve el usuario correcto."""
    role = _create_role(session)
    store = _create_store(session)
    user = _create_user(session, role, store)

    response = client.get(f"/api/users/{user.id_employee}")
    assert response.status_code == 200
    data = response.json()
    assert data["id_employee"] == user.id_employee
    assert data["username"] == "jdoe"
    assert data["first_name"] == "John"
    assert data["status"] == "Active"


def test_get_user_not_found(client: TestClient):
    """GET detalle devuelve 404 si el usuario no existe."""
    response = client.get("/api/users/9999")
    assert response.status_code == 404
    assert "no encontrado" in response.json()["detail"]


def test_get_user_no_password_in_response(client: TestClient, session: Session):
    """GET no expone hashed_password en la respuesta."""
    role = _create_role(session)
    store = _create_store(session)
    user = _create_user(session, role, store)

    response = client.get(f"/api/users/{user.id_employee}")
    assert response.status_code == 200
    data = response.json()
    assert "hashed_password" not in data
    assert "password" not in data


# ── POST /api/users/ ─────────────────────────────────────────────────

def test_create_user(client: TestClient, session: Session):
    """POST crea un usuario con 201 y devuelve los datos (sin password)."""
    role = _create_role(session)
    store = _create_store(session)
    payload = _valid_payload(role, store)

    response = client.post("/api/users/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "nuevo_user"
    assert data["first_name"] == "Ana"
    assert data["status"] == "Active"
    assert "id_employee" in data
    assert "hashed_password" not in data
    assert "password" not in data


def test_create_user_default_status(client: TestClient, session: Session):
    """POST sin status -> status por defecto es Active."""
    role = _create_role(session)
    store = _create_store(session)
    payload = _valid_payload(role, store)

    response = client.post("/api/users/", json=payload)
    assert response.status_code == 201
    assert response.json()["status"] == "Active"


def test_create_user_duplicate_username(client: TestClient, session: Session):
    """POST con username duplicado devuelve 409 Conflict."""
    role = _create_role(session)
    store = _create_store(session)
    _create_user(session, role, store, username="jdoe")

    payload = _valid_payload(role, store, username="jdoe")
    response = client.post("/api/users/", json=payload)
    assert response.status_code == 409
    assert "jdoe" in response.json()["detail"]


def test_create_user_missing_fields(client: TestClient):
    """POST sin campos requeridos devuelve 422."""
    response = client.post("/api/users/", json={"username": "solo_username"})
    assert response.status_code == 422


def test_create_user_short_password(client: TestClient, session: Session):
    """POST con password menor a 8 caracteres devuelve 422."""
    role = _create_role(session)
    store = _create_store(session)
    payload = _valid_payload(role, store)
    payload["password"] = "corta"

    response = client.post("/api/users/", json=payload)
    assert response.status_code == 422


def test_create_user_invalid_role(client: TestClient, session: Session):
    """POST con role_id inexistente devuelve 404."""
    store = _create_store(session)
    payload = {
        "first_name": "Test",
        "last_name": "User",
        "username": "testuser",
        "password": "validpass123",
        "role_id": 9999,
        "store_id": store.id_store,
    }
    response = client.post("/api/users/", json=payload)
    assert response.status_code == 404
    assert "Rol" in response.json()["detail"]


def test_create_user_invalid_store(client: TestClient, session: Session):
    """POST con store_id inexistente devuelve 404."""
    role = _create_role(session)
    payload = {
        "first_name": "Test",
        "last_name": "User",
        "username": "testuser2",
        "password": "validpass123",
        "role_id": role.id_role,
        "store_id": 9999,
    }
    response = client.post("/api/users/", json=payload)
    assert response.status_code == 404
    assert "Tienda" in response.json()["detail"]


# ── PUT /api/users/{id} ──────────────────────────────────────────────

def test_update_user(client: TestClient, session: Session):
    """PUT actualiza los campos enviados correctamente."""
    role = _create_role(session)
    store = _create_store(session)
    user = _create_user(session, role, store)

    response = client.put(
        f"/api/users/{user.id_employee}",
        json={"first_name": "Jonathan", "last_name": "Doe Updated"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["first_name"] == "Jonathan"
    assert data["last_name"] == "Doe Updated"
    assert data["username"] == "jdoe"  # sin cambios


def test_update_user_partial(client: TestClient, session: Session):
    """PUT parcial solo actualiza el campo enviado."""
    role = _create_role(session)
    store = _create_store(session)
    user = _create_user(session, role, store)

    response = client.put(
        f"/api/users/{user.id_employee}",
        json={"first_name": "Jane"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["first_name"] == "Jane"
    assert data["last_name"] == "Doe"      # no cambia
    assert data["username"] == "jdoe"      # no cambia


def test_update_user_not_found(client: TestClient):
    """PUT devuelve 404 si el usuario no existe."""
    response = client.put("/api/users/9999", json={"first_name": "X"})
    assert response.status_code == 404


def test_update_user_duplicate_username(client: TestClient, session: Session):
    """PUT devuelve 409 si el nuevo username ya lo usa otro usuario."""
    role = _create_role(session)
    store = _create_store(session)
    _create_user(session, role, store, username="alice")
    user_b = _create_user(session, role, store, username="bob")

    response = client.put(
        f"/api/users/{user_b.id_employee}",
        json={"username": "alice"},
    )
    assert response.status_code == 409


def test_update_user_invalid_role(client: TestClient, session: Session):
    """PUT con role_id inexistente devuelve 404."""
    role = _create_role(session)
    store = _create_store(session)
    user = _create_user(session, role, store)

    response = client.put(f"/api/users/{user.id_employee}", json={"role_id": 9999})
    assert response.status_code == 404


# ── DELETE /api/users/{id} ───────────────────────────────────────────

def test_delete_user(client: TestClient, session: Session):
    """DELETE elimina el usuario y devuelve sus datos."""
    role = _create_role(session)
    store = _create_store(session)
    user = _create_user(session, role, store)

    response = client.delete(f"/api/users/{user.id_employee}")
    assert response.status_code == 200
    assert response.json()["id_employee"] == user.id_employee

    # Verificar que ya no existe
    get_response = client.get(f"/api/users/{user.id_employee}")
    assert get_response.status_code == 404


def test_delete_user_not_found(client: TestClient):
    """DELETE devuelve 404 si el usuario no existe."""
    response = client.delete("/api/users/9999")
    assert response.status_code == 404
