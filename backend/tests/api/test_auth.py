from fastapi.testclient import TestClient

from app.core.security import hash_password
from app.main import app

client = TestClient(app)


def test_login_invalid_credentials():
    response = client.post(
        "/api/auth/login",
        json={"username": "usuario_inexistente", "password": "123456"},
    )
    assert response.status_code == 401


# Estas pruebas requieren fixtures reales de DB o un override de get_db.
# Déjalas listas si ya tienes infraestructura de tests:
#
# def test_login_success(db_session):
#     ...
#
# def test_me_requires_token():
#     response = client.get("/api/auth/me")
#     assert response.status_code == 401