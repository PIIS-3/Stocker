from fastapi import APIRouter

from .endpoints import products
from .endpoints import stores
from .endpoints import categories
from .endpoints import employees

# ── Router Centralizado ──────────────────────────────────────────────
# Cada módulo de endpoints registra su propio router internamente.
# Este archivo los agrupa todos bajo un único router con el prefijo /api,
# de forma que main.py solo necesita incluir un router.

api_router = APIRouter(prefix="/api")

api_router.include_router(products.router, prefix="/products", tags=["Products"])
api_router.include_router(stores.router,   prefix="/stores",   tags=["Stores"])
api_router.include_router(categories.router, prefix="/categories", tags=["Categories"])
api_router.include_router(employees.router, prefix="/employees", tags=["Employees"])
