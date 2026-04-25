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
        "address": "Calle Gran Vía 42, 28013 Madrid",
        "status": models.StatusEnum.Active,
    },
    {
        "store_name": "Sucursal Barcelona Norte",
        "address": "Avda. Diagonal 208, 08018 Barcelona",
        "status": models.StatusEnum.Active,
    },
    {
        "store_name": "Depósito Valencia Sur",
        "address": "Polígono Industrial La Fe, nave 7, 46026 Valencia",
        "status": models.StatusEnum.Active,
    },
    {
        "store_name": "Tienda Sevilla Centro",
        "address": "Plaza Nueva 5, 41001 Sevilla",
        "status": models.StatusEnum.Active,
    },
    {
        # Tienda inactiva — útil para probar el filtrado por estado en la UI.
        "store_name": "Almacén Bilbao (Cerrado)",
        "address": "Alameda de Urquijo 30, 48008 Bilbao",
        "status": models.StatusEnum.Inactive,
    },
]


# ── Lógica de seed ────────────────────────────────────────────────────────────

def seed_stores(session: Session, report: SeedReport) -> None:
    """Inserta o actualiza las tiendas semilla.

    Usa `store_name` como campo de unicidad (igual que el CRUD de la API).
    Es idempotente: ejecutar varias veces no genera duplicados.
    """
    for data in STORES_SEED:
        _, created = upsert_by_field(
            session,
            models.Store,
            lookup_field="store_name",
            lookup_value=data["store_name"],
            data=data,
        )
        report.register("Tiendas", created=created)
