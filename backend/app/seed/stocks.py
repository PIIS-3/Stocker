"""
stocks.py — Datos de prueba y lógica de seed para Stock.
"""

from __future__ import annotations

from typing import Any

from sqlmodel import Session, select

from .. import models
from ._base import SeedReport

# ── Datos de prueba ───────────────────────────────────────────────────────────

STOCKS_SEED: list[dict[str, Any]] = [
    {
        "quantity": 50,
        "min_stock": 10,
        "product_sku": "ELEC-MON-001",
        "store_name": "Almacén Central Madrid",
    },
    {
        "quantity": 30,
        "min_stock": 5,
        "product_sku": "ELEC-TEC-002",
        "store_name": "Almacén Central Madrid",
    },
    {
        "quantity": 25,
        "min_stock": 8,
        "product_sku": "ELEC-MON-001",
        "store_name": "Centro Distribución Barcelona",
    },
    {
        "quantity": 100,
        "min_stock": 20,
        "product_sku": "TOOL-TAL-045",
        "store_name": "Almacén Central Madrid",
    },
    {
        "quantity": 200,
        "min_stock": 50,
        "product_sku": "PAP-FOL-100",
        "store_name": "Almacén Central Madrid",
    },
    {
        "quantity": 150,
        "min_stock": 30,
        "product_sku": "PAP-FOL-100",
        "store_name": "Centro Distribución Barcelona",
    },
    {
        "quantity": 45,
        "min_stock": 10,
        "product_sku": "TOOL-DES-230",
        "store_name": "Almacén Central Madrid",
    },
    {
        "quantity": 80,
        "min_stock": 15,
        "product_sku": "LIMP-DES-010",
        "store_name": "Centro Distribución Barcelona",
    },
]


# ── Lógica de seed ────────────────────────────────────────────────────────────


def seed_stocks(
    session: Session,
    report: SeedReport,
) -> None:
    """Inserta o actualiza los registros de stock semilla.

    Busca en la BD los productos por SKU y las tiendas por nombre,
    luego crea o actualiza los registros de stock.
    """
    for data in STOCKS_SEED:
        product_sku = data.pop("product_sku")
        store_name = data.pop("store_name")

        # Buscar producto por SKU
        product = session.exec(
            select(models.ProductTemplate).where(models.ProductTemplate.sku == product_sku)
        ).first()
        if product is None:
            raise ValueError(
                f"Producto con SKU '{product_sku}' no encontrado para el stock. "
                f"Asegúrate de ejecutar seed_products primero."
            )

        # Buscar tienda por nombre
        store = session.exec(
            select(models.Store).where(models.Store.store_name == store_name)
        ).first()
        if store is None:
            raise ValueError(
                f"Tienda '{store_name}' no encontrada para el stock. "
                f"Asegúrate de ejecutar seed_stores primero."
            )

        # Buscar stock existente (producto + tienda)
        existing = session.exec(
            select(models.Stock).where(
                models.Stock.product_id == product.id_product,
                models.Stock.store_id == store.id_store,
            )
        ).first()

        if existing:
            # Actualización parcial
            for key, value in data.items():
                setattr(existing, key, value)
            session.add(existing)
            report.register("Stock", created=False)
        else:
            # Creación
            instance = models.Stock(
                product_id=product.id_product,
                store_id=store.id_store,
                **data,
            )
            session.add(instance)
            session.flush()
            report.register("Stock", created=True)
