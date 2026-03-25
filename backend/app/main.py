from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import settings
from .api.router import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
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
    """Comprobación de salud — útil para monitorización y balanceadores de carga."""
    return {"status": "ok", "version": settings.VERSION}
