"""
products.py — Datos de prueba y lógica de seed para Productos.
"""

from __future__ import annotations

from typing import Any

from sqlmodel import Session

from .. import models
from ._base import SeedReport, upsert_by_field

# ── Datos de prueba ───────────────────────────────────────────────────────────

PRODUCTS_SEED: list[dict[str, Any]] = [
    {
        "product_name": "Monitor 24 Pulgadas LED",
        "sku": "ELEC-MON-001",
        "brand": "LG",
        "fixed_selling_price": 150.00,
        "category_name": "Electrónica",
        "status": models.StatusEnum.Active,
    },
    {
        "product_name": "Teclado Mecánico RGB",
        "sku": "ELEC-TEC-002",
        "brand": "Corsair",
        "fixed_selling_price": 85.50,
        "category_name": "Electrónica",
        "status": models.StatusEnum.Active,
    },
    {
        "product_name": "Taladro Percutor 18V",
        "sku": "TOOL-TAL-045",
        "brand": "Bosch",
        "fixed_selling_price": 120.00,
        "category_name": "Herramientas",
        "status": models.StatusEnum.Active,
    },
    {
        "product_name": "Caja de Folios A4 (500h)",
        "sku": "PAP-FOL-100",
        "brand": "Navigator",
        "fixed_selling_price": 5.95,
        "category_name": "Papelería",
        "status": models.StatusEnum.Active,
    },
    {
        "product_name": "Destornillador de Precisión Set",
        "sku": "TOOL-DES-230",
        "brand": "Wera",
        "fixed_selling_price": 24.90,
        "category_name": "Herramientas",
        "status": models.StatusEnum.Active,
    },
    {
        "product_name": "Desinfectante Multiusos 1L",
        "sku": "LIMP-DES-010",
        "brand": "Sanytol",
        "fixed_selling_price": 3.75,
        "category_name": "Limpieza",
        "status": models.StatusEnum.Active,
    },
]


# ── Lógica de seed ────────────────────────────────────────────────────────────


def seed_products(
    session: Session,
    report: SeedReport,
    categories_by_name: dict[str, models.Category],
) -> None:
    """Inserta o actualiza las plantillas de producto semilla.

    Resuelve la categoría de cada producto utilizando el mapa proporcionado
    antes de realizar la inserción.
    """
    for data in PRODUCTS_SEED:
        category_name = data.pop("category_name")
        category = categories_by_name.get(category_name)
        if category is None:
            raise ValueError(
                f"Categoría '{category_name}' no encontrada para el producto "
                f"'{data['sku']}'. Asegúrate de ejecutar seed_categories primero."
            )

        _, created = upsert_by_field(
            session,
            models.ProductTemplate,
            lookup_field="sku",
            lookup_value=data["sku"],
            data={**data, "category_id": category.id_category},
        )
        report.register("Productos", created=created)
