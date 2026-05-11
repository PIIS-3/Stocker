from fastapi import APIRouter

from .endpoints import auth, categories, employees, products, stores

# ── Router Centralizado ──────────────────────────────────────────────
# Cada módulo de endpoints registra su propio router internamente.
# Este archivo los agrupa todos bajo un único router con el prefijo /api,
# de forma que main.py solo necesita incluir un router.

api_router = APIRouter(prefix="/api")

api_router.include_router(auth.router, prefix="/auth", tags=["Autenticación"])
api_router.include_router(products.router, prefix="/products", tags=["Productos"])
api_router.include_router(stores.router, prefix="/stores", tags=["Tiendas"])
api_router.include_router(categories.router, prefix="/categories", tags=["Categorías"])
api_router.include_router(employees.router, prefix="/employees", tags=["Empleados"])
