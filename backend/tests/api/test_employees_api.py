from fastapi.testclient import TestClient
from sqlmodel import Session

from app.models.employee import Employee
from app.models.store import Store
from app.models.role import Role
from app.models.enums import StatusEnum, RoleEnum


# ── Helpers ──────────────────────────────────────────────────────────

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


def _seed(
    session: Session,
    username: str,
    role_id: int,
    store_id: int,
    first_name: str = "Juan",
    last_name: str = "García",
    hashed_password: str = "hash_seguro",
    status: StatusEnum = StatusEnum.Active,
) -> Employee:
    employee = Employee(
        first_name=first_name,
        last_name=last_name,
        username=username,
        hashed_password=hashed_password,
        status=status,
        role_id=role_id,
        store_id=store_id,
    )
    session.add(employee)
    session.commit()
    session.refresh(employee)
    return employee


# ── GET /api/employees/ ──────────────────────────────────────────────

def test_read_employees_returns_list(client: TestClient, session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    _seed(session, "usuario1", role.id_role, store.id_store)
    _seed(session, "usuario2", role.id_role, store.id_store)

    response = client.get("/api/employees/")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    usernames = {e["username"] for e in data}
    assert usernames == {"usuario1", "usuario2"}


def test_read_employees_empty(client: TestClient):
    response = client.get("/api/employees/")

    assert response.status_code == 200
    assert response.json() == []


def test_read_employees_pagination_limit(client: TestClient, session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    _seed(session, "a", role.id_role, store.id_store)
    _seed(session, "b", role.id_role, store.id_store)
    _seed(session, "c", role.id_role, store.id_store)

    response = client.get("/api/employees/?limit=2")

    assert response.status_code == 200
    assert len(response.json()) == 2


def test_read_employees_pagination_skip(client: TestClient, session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    _seed(session, "a", role.id_role, store.id_store)
    _seed(session, "b", role.id_role, store.id_store)
    _seed(session, "c", role.id_role, store.id_store)

    response = client.get("/api/employees/?skip=2")

    assert response.status_code == 200
    assert len(response.json()) == 1


# ── GET /api/employees/{id} ──────────────────────────────────────────

def test_read_employee_by_id(client: TestClient, session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    seeded = _seed(
        session, "jgarcia", role.id_role, store.id_store,
        first_name="Juan", last_name="García",
    )

    response = client.get(f"/api/employees/{seeded.id_employee}")

    assert response.status_code == 200
    data = response.json()
    assert data["id_employee"] == seeded.id_employee
    assert data["username"] == "jgarcia"
    assert data["first_name"] == "Juan"
    assert data["last_name"] == "García"


def test_read_employee_by_id_not_found(client: TestClient):
    response = client.get("/api/employees/999999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Empleado no encontrado."


# ── GET /api/employees/by-name/{name} ────────────────────────────────

def test_read_employee_by_username(client: TestClient, session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    _seed(session, "mperez", role.id_role, store.id_store, first_name="María")

    response = client.get("/api/employees/by-name/mperez")

    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "mperez"
    assert data["first_name"] == "María"


def test_read_employee_by_username_not_found(client: TestClient):
    response = client.get("/api/employees/by-name/inexistente")

    assert response.status_code == 404
    assert response.json()["detail"] == "Empleado no encontrado."


# ── POST /api/employees/ ─────────────────────────────────────────────

def test_create_employee_returns_201(client: TestClient, session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    payload = {
        "first_name": "Ana",
        "last_name": "Rodríguez",
        "username": "arodriguez",
        "hashed_password": "hash_secreto",
        "role_id": role.id_role,
        "store_id": store.id_store,
    }

    response = client.post("/api/employees/", json=payload)

    assert response.status_code == 201
    data = response.json()
    assert data["id_employee"] is not None
    assert data["username"] == "arodriguez"
    assert data["first_name"] == "Ana"
    assert data["status"] == StatusEnum.Active.value


def test_create_employee_default_status_active(client: TestClient, session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    payload = {
        "first_name": "Luis",
        "last_name": "Martín",
        "username": "lmartin",
        "hashed_password": "hash_secreto",
        "role_id": role.id_role,
        "store_id": store.id_store,
    }

    response = client.post("/api/employees/", json=payload)

    assert response.status_code == 201
    assert response.json()["status"] == StatusEnum.Active.value


def test_create_employee_explicit_inactive(client: TestClient, session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    payload = {
        "first_name": "Pedro",
        "last_name": "Sánchez",
        "username": "psanchez",
        "hashed_password": "hash_secreto",
        "status": StatusEnum.Inactive.value,
        "role_id": role.id_role,
        "store_id": store.id_store,
    }

    response = client.post("/api/employees/", json=payload)

    assert response.status_code == 201
    assert response.json()["status"] == StatusEnum.Inactive.value


def test_create_employee_duplicate_username_returns_409(client: TestClient, session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    _seed(session, "duplicado", role.id_role, store.id_store)
    payload = {
        "first_name": "Otro",
        "last_name": "Usuario",
        "username": "duplicado",
        "hashed_password": "hash_secreto",
        "role_id": role.id_role,
        "store_id": store.id_store,
    }

    response = client.post("/api/employees/", json=payload)

    assert response.status_code == 409
    assert response.json()["detail"] == "Ya existe un empleado con ese username."


def test_create_employee_hashed_password_not_in_response(client: TestClient, session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    payload = {
        "first_name": "Seguro",
        "last_name": "García",
        "username": "sgarcia",
        "hashed_password": "mi_hash_privado",
        "role_id": role.id_role,
        "store_id": store.id_store,
    }

    response = client.post("/api/employees/", json=payload)

    assert response.status_code == 201
    assert "hashed_password" not in response.json()


def test_create_employee_missing_username_returns_422(client: TestClient, session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    payload = {
        "first_name": "Sin",
        "last_name": "Username",
        "hashed_password": "hash_secreto",
        "role_id": role.id_role,
        "store_id": store.id_store,
    }

    response = client.post("/api/employees/", json=payload)

    assert response.status_code == 422


def test_create_employee_missing_password_returns_422(client: TestClient, session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    payload = {
        "first_name": "Sin",
        "last_name": "Password",
        "username": "sinpassword",
        "role_id": role.id_role,
        "store_id": store.id_store,
    }

    response = client.post("/api/employees/", json=payload)

    assert response.status_code == 422


# ── PATCH /api/employees/{id} ────────────────────────────────────────

def test_update_employee_first_name(client: TestClient, session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    seeded = _seed(session, "jgarcia", role.id_role, store.id_store, first_name="Juan")

    response = client.patch(
        f"/api/employees/{seeded.id_employee}",
        json={"first_name": "Juanito"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["first_name"] == "Juanito"
    assert data["username"] == "jgarcia"  # sin cambios


def test_update_employee_username(client: TestClient, session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    seeded = _seed(session, "usuario_viejo", role.id_role, store.id_store)

    response = client.patch(
        f"/api/employees/{seeded.id_employee}",
        json={"username": "usuario_nuevo"},
    )

    assert response.status_code == 200
    assert response.json()["username"] == "usuario_nuevo"


def test_update_employee_same_username_no_conflict(client: TestClient, session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    seeded = _seed(session, "sin_cambio", role.id_role, store.id_store)

    response = client.patch(
        f"/api/employees/{seeded.id_employee}",
        json={"username": "sin_cambio"},
    )

    assert response.status_code == 200
    assert response.json()["username"] == "sin_cambio"


def test_update_employee_username_conflict_with_other(client: TestClient, session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    _seed(session, "ocupado", role.id_role, store.id_store)
    seeded = _seed(session, "libre", role.id_role, store.id_store)

    response = client.patch(
        f"/api/employees/{seeded.id_employee}",
        json={"username": "ocupado"},
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "Ya existe un empleado con ese username."


def test_update_employee_not_found(client: TestClient):
    response = client.patch("/api/employees/999999", json={"first_name": "X"})

    assert response.status_code == 404
    assert response.json()["detail"] == "Empleado no encontrado."


# ── DELETE /api/employees/{id} ───────────────────────────────────────

def test_delete_employee_returns_deleted_record(client: TestClient, session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    seeded = _seed(session, "efimero", role.id_role, store.id_store)

    response = client.delete(f"/api/employees/{seeded.id_employee}")

    assert response.status_code == 200
    data = response.json()
    assert data["id_employee"] == seeded.id_employee
    assert data["username"] == "efimero"


def test_delete_employee_removes_from_list(client: TestClient, session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    seeded = _seed(session, "transitorio", role.id_role, store.id_store)

    client.delete(f"/api/employees/{seeded.id_employee}")
    response = client.get("/api/employees/")

    assert response.status_code == 200
    assert response.json() == []


def test_delete_employee_not_found(client: TestClient):
    response = client.delete("/api/employees/999999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Empleado no encontrado."
