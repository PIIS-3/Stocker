import os
from sqlmodel import create_engine, Session
from .core.config import settings

# ── Motor de Base de Datos ───────────────────────────────────────────
engine = create_engine(
    settings.DATABASE_URL,
    # echo: Imprime en consola todas las sentencias SQL que se ejecutan.
    # Útil para depuración durante el desarrollo. Se activa con la
    # variable de entorno SQL_ECHO=true (por defecto está desactivado).
    echo=os.getenv("SQL_ECHO", "false").lower() == "true",
    # pool_pre_ping: Antes de reutilizar una conexión del pool, envía un
    # ping al servidor para verificar que sigue activa. Evita errores por
    # conexiones cerradas tras períodos de inactividad.
    pool_pre_ping=True,
)


# ── Dependencia de Sesión ────────────────────────────────────────────
def get_db():
    """Genera una sesión de base de datos por cada petición HTTP.
    Se cierra automáticamente al finalizar la petición gracias al 'yield'."""
    with Session(engine) as session:
        yield session