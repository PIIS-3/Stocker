from contextlib import asynccontextmanager
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .core.config import settings
from .api.router import api_router
from .database import engine, ensure_db_objects


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: crea los triggers de updated_at en PostgreSQL si no existen."""
    ensure_db_objects()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────────────
# Permite que el frontend (React) se comunique con la API desde un
# origen diferente (distinto puerto). Sin esto, el navegador bloquea
# las peticiones cross-origin por seguridad.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Rutas de la API ──────────────────────────────────────────────────
# Se incluye un solo router centralizado que agrupa todos los endpoints.
# Ver app/api/router.py para la configuración de cada recurso.
app.include_router(api_router)


# ── Endpoints generales ──────────────────────────────────────────────
@app.get("/", tags=["General"])
def read_root():
    """Ruta raíz — devuelve un mensaje de bienvenida."""
    return {"message": f"Welcome to {settings.PROJECT_NAME}"}


@app.get("/health", tags=["General"])
def health_check():
    """Comprobación de salud de API y conectividad con la base de datos."""
    try:
        with engine.connect() as connection:
            connection.exec_driver_sql("SELECT 1")

        return {
            "status": "ok",
            "api": "up",
            "database": "up",
            "version": settings.VERSION,
        }
    except Exception as exc:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "degraded",
                "api": "up",
                "database": "down",
                "version": settings.VERSION,
                "error": str(exc),
            },
        )
