"""
stores.py — Datos de prueba y lógica de seed para Tiendas.

Los datos cubren los escenarios más habituales del CRUD:
  - Tiendas activas en distintas ciudades para probar listado y búsqueda.
  - Una tienda inactiva para probar filtrado por estado en la UI.
"""
from __future__ import annotations

from typing import Any, Dict, List

from sqlmodel import Session

from .. import models
from ._base import SeedReport, upsert_by_field


# ── Datos de prueba ───────────────────────────────────────────────────────────

STORES_SEED: List[Dict[str, Any]] = [
    {
        "store_name": "Almacén Central Madrid",
        "address": "Calle Gobelas 41, Planta 2, 28023 Madrid",
        "status": models.StatusEnum.Active,
    },
    {
        "store_name": "Centro Distribución Barcelona",
        "address": "Avda. Industria 75-85, nave B, 08960 Barcelona",
        "status": models.StatusEnum.Active,
    },
    {
        "store_name": "Almacén Valencia",
        "address": "Polígono Industrial Fuente del Jarro, parcela 4, 46988 Valencia",
        "status": models.StatusEnum.Active,
    },
    {
        "store_name": "Delegación Sevilla",
        "address": "Polígono Industrial Pisa, calle Cristóbal Colón s/n, 41940 Sevilla",
        "status": models.StatusEnum.Active,
    },
    {
        "store_name": "Sucursal Bilbao",
        "address": "Calle Lasarte 45, 48970 Basauri (Bilbao)",
        "status": models.StatusEnum.Active,
    },
    {
        "store_name": "Almacén Zaragoza",
        "address": "Avenida Hispanidad 20, 50009 Zaragoza",
        "status": models.StatusEnum.Active,
    },
]


# ── Lógica de seed ────────────────────────────────────────────────────────────

def seed_stores(session: Session, report: SeedReport) -> dict[str, models.Store]:
    """Inserta o actualiza las tiendas semilla.

    Usa `store_name` como campo de unicidad (igual que el CRUD de la API).
    Es idempotente: ejecutar varias veces no genera duplicados.

    Returns:
        Mapa {store_name → Store} para que otros módulos
        (ej: seed_employees) puedan resolver FKs sin consultas extra.
    """
    stores_by_name: dict[str, models.Store] = {}

    for data in STORES_SEED:
        store, created = upsert_by_field(
            session,
            models.Store,
            lookup_field="store_name",
            lookup_value=data["store_name"],
            data=data,
        )
        stores_by_name[store.store_name] = store  # type: ignore[index]
        report.register("Tiendas", created=created)

    return stores_by_name  # type: ignore[return-value]
