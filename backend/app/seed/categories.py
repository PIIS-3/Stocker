"""
categories.py — Datos de prueba y lógica de seed para Categorías.
"""
from __future__ import annotations

from typing import Any, Dict, List

from sqlmodel import Session

from .. import models
from ._base import SeedReport, upsert_by_field


# ── Datos de prueba ───────────────────────────────────────────────────────────

CATEGORIES_SEED: List[Dict[str, Any]] = [
    {
        "category_name": "Electrónica",
        "description": "Dispositivos, cables y componentes tecnológicos",
        "status": models.StatusEnum.Active,
    },
    {
        "category_name": "Herramientas",
        "description": "Herramientas manuales y eléctricas para mantenimiento",
        "status": models.StatusEnum.Active,
    },
    {
        "category_name": "Papelería",
        "description": "Material de oficina, papel y consumibles",
        "status": models.StatusEnum.Active,
    },
    {
        "category_name": "Limpieza",
        "description": "Productos de higiene y limpieza industrial",
        "status": models.StatusEnum.Active,
    },
    {
        "category_name": "Mobiliario",
        "description": "Muebles de oficina, estanterías y sistemas de almacenaje",
        "status": models.StatusEnum.Active,
    },
    {
        "category_name": "Consumibles",
        "description": "Artículos consumibles diversos: tóner, tinta, bolsas y más",
        "status": models.StatusEnum.Active,
    },
]


# ── Lógica de seed ────────────────────────────────────────────────────────────

def seed_categories(
    session: Session, report: SeedReport
) -> dict[str, models.Category]:
    """Inserta o actualiza las categorías semilla del inventario.

    Returns:
        Mapa {category_name → Category} para que otros módulos
        (ej: seed_products) puedan resolver FKs sin consultas extra.
    """
    categories_by_name: dict[str, models.Category] = {}

    for data in CATEGORIES_SEED:
        category, created = upsert_by_field(
            session,
            models.Category,
            lookup_field="category_name",
            lookup_value=data["category_name"],
            data=data,
        )
        categories_by_name[category.category_name] = category  # type: ignore[index]
        report.register("Categorías", created=created)

    return categories_by_name  # type: ignore[return-value]
