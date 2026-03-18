from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings

from .api.endpoints import products

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
)

# Configuramos CORS usando la variable centralizada
origins = [settings.FRONTEND_URL]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir Rutas (Endpoints)
app.include_router(products.router, prefix="/api/products", tags=["Products"])

@app.get("/", tags=["General"])
def read_root():
    return {"message": f"Welcome to {settings.PROJECT_NAME}"}

@app.get("/health", tags=["General"])
def health_check():
    return {"status": "ok", "version": settings.VERSION}