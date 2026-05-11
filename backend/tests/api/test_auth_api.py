from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.security import get_password_hash
from app.models.employee import Employee
from app.models.enums import RoleEnum
from app.models.role import Role
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
    password: str,
    role_id: int,
    store_id: int,
) -> Employee:
    employee = Employee(
        first_name="Test",
        last_name="User",
        username=username,
        hashed_password=get_password_hash(password),
        role_id=role_id,
        store_id=store_id,
    )
    session.add(employee)
    session.commit()
    session.refresh(employee)
    return employee


def test_login_success(client: TestClient, session: Session):
    """Test: Login con credenciales válidas retorna token JWT."""
    role = _seed_role(session)
    store = _seed_store(session)
    _seed_employee(session, "testuser", "password123", role.id_role, store.id_store)

    response = client.post(
        "/api/auth/login",
        json={"username": "testuser", "password": "password123"},
    )

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_incorrect_password(client: TestClient, session: Session):
    """Test: Login con contraseña incorrecta retorna 401."""
    role = _seed_role(session)
    store = _seed_store(session)
    _seed_employee(session, "testuser", "correctpassword", role.id_role, store.id_store)

    response = client.post(
        "/api/auth/login",
        json={"username": "testuser", "password": "wrongpassword"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Usuario o contraseña incorrectos."


def test_login_nonexistent_user(client: TestClient):
    """Test: Login con usuario inexistente retorna 401."""
    response = client.post(
        "/api/auth/login",
        json={"username": "nonexistentuser", "password": "anypassword"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Usuario o contraseña incorrectos."


def test_login_empty_fields(client: TestClient):
    """Test: Login con campos vacíos retorna 422."""
    response = client.post(
        "/api/auth/login",
        json={"username": "", "password": ""},
    )

    assert response.status_code == 422
