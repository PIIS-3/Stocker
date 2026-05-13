import pytest
from fastapi import Depends, HTTPException, status
from fastapi.testclient import TestClient
from jose import JWTError, jwt
from sqlalchemy import event
from sqlmodel import Session, SQLModel, StaticPool, create_engine

from app import models
from app.api.deps import (
    get_current_admin,
    get_current_employee,
    get_current_superadmin,
    oauth2_scheme,
)
from app.core.config import settings
from app.core.security import get_password_hash
from app.database import get_db
from app.main import app
from app.models.enums import RoleEnum

# ── Base de Datos de Prueba (In-Memory SQLite) ──────────────────────
# Usamos StaticPool para mantener la conexión abierta en memoria durante el test.
DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)


@event.listens_for(engine, "connect")
def _set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


_AUTH_USERNAME = "_test_admin"
_AUTH_PASSWORD = "test_secret_pw"


def _validate_token_no_db(token: str = Depends(oauth2_scheme)) -> models.Employee:
    """Override de test: verifica la firma JWT sin consultar la BD.

    El empleado de autenticación se elimina de la BD tras el login para no
    contaminar las aserciones de los tests (p.ej. listas vacías). Por eso
    reconstruimos el Employee desde el payload en lugar de buscarlo en BD.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        employee_id: int | None = payload.get("id_employee")
        if employee_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No se pudieron validar las credenciales.",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No se pudieron validar las credenciales.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return models.Employee(
        id_employee=employee_id,
        first_name="Test",
        last_name="Admin",
        username=payload.get("username", _AUTH_USERNAME),
        hashed_password="",
        role_id=1,
        store_id=1,
    )


@pytest.fixture(name="session")
def session_fixture():
    """Crea una sesión de base de datos limpia para cada test."""
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session
    SQLModel.metadata.drop_all(engine)


@pytest.fixture(name="client")
def client_fixture(session: Session):
    """Crea un cliente autenticado con JWT real para todos los tests de integración.

    Flujo:
    1. Inyecta la sesión SQLite en memoria como BD de test.
    2. Crea un empleado de auth con contraseña hasheada con bcrypt.
    3. Llama a POST /api/auth/login para obtener un token JWT real.
    4. Elimina el empleado de auth de la BD para no afectar las aserciones.
    5. Sustituye get_current_employee por una versión que valida la firma JWT
        sin consultar la BD (el empleado ya no existe en ella).
    6. Devuelve un TestClient que envía el token Bearer en cada petición.
    """

    def get_db_override():
        yield session

    app.dependency_overrides[get_db] = get_db_override
    app.dependency_overrides[get_current_employee] = _validate_token_no_db
    app.dependency_overrides[get_current_admin] = _validate_token_no_db
    app.dependency_overrides[get_current_superadmin] = _validate_token_no_db

    # Entidades necesarias como soporte para el empleado de auth (FKs)
    role = models.Role(role_name=RoleEnum.SuperAdmin)
    session.add(role)
    session.commit()
    session.refresh(role)

    store = models.Store(store_name="_TestAuthStore", address="_Test Auth Address")
    session.add(store)
    session.commit()
    session.refresh(store)

    auth_employee = models.Employee(
        first_name="Test",
        last_name="Admin",
        username=_AUTH_USERNAME,
        hashed_password=get_password_hash(_AUTH_PASSWORD),
        role_id=role.id_role,
        store_id=store.id_store,
    )
    session.add(auth_employee)
    session.commit()
    session.refresh(auth_employee)

    # Login real: obtiene un token JWT firmado con la clave del proyecto
    temp_client = TestClient(app)
    login_response = temp_client.post(
        "/api/auth/login",
        json={"username": _AUTH_USERNAME, "password": _AUTH_PASSWORD},
    )
    assert login_response.status_code == 200, (
        f"El login de autenticación de tests falló: {login_response.json()}"
    )
    token = login_response.json()["access_token"]

    # Limpiar la BD de test para no contaminar aserciones (p.ej. listas vacías)
    session.delete(auth_employee)
    session.delete(store)
    session.delete(role)
    session.commit()

    # Cliente con Authorization: Bearer <token> en todas las peticiones
    client = TestClient(app, headers={"Authorization": f"Bearer {token}"})
    yield client
    app.dependency_overrides.clear()
