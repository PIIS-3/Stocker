"""
sale_items.py — Datos de prueba y lógica de seed para Líneas de Venta.
"""

from __future__ import annotations

from typing import Any

from sqlmodel import Session, select

from .. import models
from ._base import SeedReport


def _i(
    sale_index: int, product_sku: str, quantity: int, unit_price: float, subtotal: float
) -> dict[str, Any]:
    return {
        "sale_index": sale_index,
        "product_sku": product_sku,
        "quantity": quantity,
        "unit_price": unit_price,
        "subtotal": subtotal,
    }


SALE_ITEMS_SEED: list[dict[str, Any]] = [
    # Venta 0: Carlos en Madrid — Monitor + Teclado + Folios  (316.50)
    _i(0, "ELEC-MON-001", 1, 150.00, 150.00),
    _i(0, "ELEC-TEC-002", 1, 85.50, 85.50),
    _i(0, "PAP-FOL-100", 5, 5.95, 29.75),
    _i(0, "LIMP-DES-010", 2, 3.75, 7.50),
    # Venta 1: Ana en Madrid — Taladro  (120.00)
    _i(1, "TOOL-TAL-045", 1, 120.00, 120.00),
    # Venta 2: María en Barcelona — Destornillador + Desinfectante  (174.15)
    _i(2, "TOOL-DES-230", 3, 24.90, 74.70),
    _i(2, "LIMP-DES-010", 4, 3.75, 15.00),
    _i(2, "ELEC-TEC-002", 1, 85.50, 85.50),
    # Venta 3: Pedro en Barcelona — Folios + Desinfectante  (48.75)
    _i(3, "PAP-FOL-100", 5, 5.95, 29.75),
    _i(3, "LIMP-DES-010", 5, 3.75, 18.75),
    # Venta 4: Juan en Valencia — Monitor + Teclado + Taladro + Destornillador  (325.50)
    _i(4, "ELEC-MON-001", 1, 150.00, 150.00),
    _i(4, "ELEC-TEC-002", 1, 85.50, 85.50),
    _i(4, "TOOL-TAL-045", 1, 120.00, 120.00),
    _i(4, "TOOL-DES-230", 1, 24.90, 24.90),
    # Venta 5: Laura en Sevilla — Monitor + Teclado + Folios + Limpieza + Destornillador  (270.00)
    _i(5, "ELEC-MON-001", 1, 150.00, 150.00),
    _i(5, "ELEC-TEC-002", 1, 85.50, 85.50),
    _i(5, "PAP-FOL-100", 2, 5.95, 11.90),
    _i(5, "LIMP-DES-010", 2, 3.75, 7.50),
    _i(5, "TOOL-DES-230", 2, 24.90, 49.80),
    # Venta 6: David en Bilbao — Desinfectante + Folios + Destornillador  (90.40)
    _i(6, "LIMP-DES-010", 10, 3.75, 37.50),
    _i(6, "PAP-FOL-100", 4, 5.95, 23.80),
    _i(6, "TOOL-DES-230", 1, 24.90, 24.90),
    # Venta 7: Isabel en Zaragoza — CANCELADA, sin items
    # Venta 8: Carlos en Madrid — PENDIENTE, Monitor  (150.00)
    _i(8, "ELEC-MON-001", 1, 150.00, 150.00),
    # Venta 9: María en Barcelona — Taladro + Destornillador + Folios + Limpieza  (204.90)
    _i(9, "TOOL-TAL-045", 1, 120.00, 120.00),
    _i(9, "TOOL-DES-230", 2, 24.90, 49.80),
    _i(9, "PAP-FOL-100", 4, 5.95, 23.80),
    _i(9, "LIMP-DES-010", 3, 3.75, 11.25),
]


def seed_sale_items(
    session: Session,
    report: SeedReport,
    sales: list[models.Sale],
) -> None:
    """Inserta líneas de venta asociadas a las ventas semilla.

    Consulta los productos desde la BD para resolver los FKs.
    Si ya existen líneas de venta, omite la inserción.
    """
    existing = session.exec(select(models.SaleItem).limit(1)).first()
    if existing is not None:
        report.register("Líneas de venta", created=False)
        return

    products = session.exec(select(models.ProductTemplate)).all()
    products_by_sku: dict[str, models.ProductTemplate] = {p.sku: p for p in products}

    for data in SALE_ITEMS_SEED:
        sale_idx: int = data["sale_index"]
        sku: str = data["product_sku"]

        sale = sales[sale_idx]
        product = products_by_sku.get(sku)
        if product is None:
            raise ValueError(f"Producto con SKU '{sku}' no encontrado para línea de venta.")

        item = models.SaleItem(
            sale_id=sale.id_sale,
            product_id=product.id_product,
            quantity=data["quantity"],
            unit_price=data["unit_price"],
            subtotal=data["subtotal"],
        )
        session.add(item)
        report.register("Líneas de venta", created=True)
