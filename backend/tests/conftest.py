import pytest
from sqlmodel import SQLModel, create_engine, Session, StaticPool
from fastapi.testclient import TestClient
from app.main import app
from app.database import get_db

# ── Base de Datos de Prueba (In-Memory SQLite) ──────────────────────
# Usamos StaticPool para mantener la conexión abierta en memoria durante el test.
DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
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
    """Crea un cliente de FastAPI con la base de datos de prueba inyectada."""
    def get_db_override():
        yield session
    
    app.dependency_overrides[get_db] = get_db_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()
