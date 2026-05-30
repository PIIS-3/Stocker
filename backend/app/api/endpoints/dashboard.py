"""
Dashboard — Endpoints de estadísticas para el panel de administración
=====================================================================

BASE URL: /api/dashboard

Todos los endpoints requieren token de empleado (Authorization: Bearer <token>).

────────────────────────────────────────────────────────────────────────────────
ENDPOINTS DISPONIBLES
────────────────────────────────────────────────────────────────────────────────

  GET /api/dashboard/summary
      Tarjetas de resumen superiores del dashboard. Devuelve 5 KPIs en un solo
      objeto:
        · total_sales      → número de ventas COMPLETADAS en el período
        · total_revenue    → suma de ingresos (€) de esas ventas completadas
        · cancelled_sales  → número de ventas CANCELADAS en el período
        · pending_sales    → número de ventas PENDIENTES en el período
        · low_stock_count  → cuántos registros de stock tienen quantity < min_stock
                             (este contador refleja el estado actual del inventario,
                              NO se filtra por fecha aunque se pasen date_from/date_to)

      Params opcionales: date_from, date_to (ISO 8601, ej: 2026-01-01T00:00:00)
      Si no se pasan fechas, se devuelven datos de todos los tiempos.

  GET /api/dashboard/sales-by-store
      Gráfico/tabla comparativa de tiendas. Para cada tienda devuelve:
        · total_sales    → ventas COMPLETADAS de esa tienda en el período
        · total_revenue  → ingresos (€) generados por esa tienda en el período
      Resultado ordenado de mayor a menor ingreso (la tienda que más vende, primero).
      Solo incluye tiendas que tengan al menos una venta completada en el período.

      Params opcionales: date_from, date_to

  GET /api/dashboard/top-products
      Ranking de los N productos más vendidos. Cada item devuelve:
        · units_sold     → unidades totales vendidas del producto
        · total_revenue  → ingresos (€) generados por ese producto

      El param sort_by controla el criterio de ordenación:
        · sort_by=units    (default) → ordena por unidades vendidas
                                       Útil para ver qué productos se mueven más
        · sort_by=revenue            → ordena por ingresos generados
                                       Útil para ver qué productos aportan más dinero
                                       (un producto caro con pocas unidades puede
                                        superar en ingresos a uno barato muy vendido)
      El param limit controla cuántos devolver (default: 10, máximo: 50).

  GET /api/dashboard/low-stock
      Sección de alertas del dashboard. Lista todos los registros de stock donde
      la cantidad actual (quantity) está por debajo del mínimo configurado (min_stock).
      Incluye el nombre del producto, su SKU, la tienda afectada y ambos valores
      (quantity y min_stock) para que el front pueda calcular cuántas unidades
      faltan para llegar al mínimo: deficit = min_stock - quantity
      Resultado ordenado de menor a mayor quantity (el más crítico, primero).

────────────────────────────────────────────────────────────────────────────────
FILTRO DE FECHAS
────────────────────────────────────────────────────────────────────────────────

  Los endpoints summary y sales-by-store aceptan date_from y date_to en ISO 8601.
  Se pueden combinar libremente:

    Mes concreto:   ?date_from=2026-01-01T00:00:00&date_to=2026-01-31T23:59:59
    Desde una fecha: ?date_from=2026-05-01T00:00:00   (hasta hoy)
    Hasta una fecha: ?date_to=2026-03-31T23:59:59     (desde el principio)
    Sin filtro:     sin params  (todos los tiempos)

────────────────────────────────────────────────────────────────────────────────
SHAPES DE RESPUESTA (para tipar en el frontend)
────────────────────────────────────────────────────────────────────────────────

  SummaryResponse:
    total_sales:     number   — ventas completadas en el período
    total_revenue:   number   — ingresos totales (€) de ventas completadas
    cancelled_sales: number   — ventas canceladas en el período
    pending_sales:   number   — ventas pendientes en el período
    low_stock_count: number   — productos con quantity < min_stock (estado actual)

  SalesByStoreItem:
    store_id:      number
    store_name:    string
    total_sales:   number   — ventas completadas de esa tienda en el período
    total_revenue: number   — ingresos (€) de esa tienda en el período

  TopProductItem:
    product_id:    number
    product_name:  string
    sku:           string
    units_sold:    number   — unidades totales vendidas (suma de sale_item.quantity)
    total_revenue: number   — ingresos (€) generados (suma de sale_item.subtotal)

  LowStockItem:
    stock_id:      number
    product_id:    number
    product_name:  string
    sku:           string
    store_id:      number
    store_name:    string
    quantity:      number   — stock actual en esa tienda
    min_stock:     number   — umbral mínimo configurado (deficit = min_stock - quantity)
"""

from datetime import datetime
from typing import Literal

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from ...crud import dashboard as crud_dashboard
from ...database import get_db
from ..deps import get_current_employee
from .schemas.dashboard import (
    LowStockItem,
    SalesByStoreItem,
    SummaryResponse,
    TopProductItem,
)

router = APIRouter(tags=["Dashboard"], dependencies=[Depends(get_current_employee)])


# ── GET /dashboard/summary ───────────────────────────────────────────


@router.get(
    "/summary",
    response_model=SummaryResponse,
    summary="KPIs globales del dashboard",
    description=(
        "Devuelve en un único objeto los 5 KPIs principales: ventas completadas, "
        "ingresos totales, ventas canceladas, ventas pendientes y productos con stock "
        "por debajo del mínimo. Los cuatro primeros se filtran por fecha si se pasan "
        "date_from/date_to. low_stock_count refleja siempre el estado actual del inventario."
    ),
)
def get_summary(
    date_from: datetime | None = Query(default=None, description="Inicio del período (ISO 8601)."),
    date_to: datetime | None = Query(default=None, description="Fin del período (ISO 8601)."),
    db: Session = Depends(get_db),
):
    return crud_dashboard.get_summary(db, date_from=date_from, date_to=date_to)


# ── GET /dashboard/sales-by-store ────────────────────────────────────


@router.get(
    "/sales-by-store",
    response_model=list[SalesByStoreItem],
    summary="Ingresos y ventas por tienda",
    description=(
        "Para cada tienda con ventas completadas en el período devuelve el número de "
        "transacciones y los ingresos generados, ordenados de mayor a menor ingreso. "
        "Útil para el gráfico de barras o tabla comparativa entre tiendas. "
        "Acepta filtro por rango de fechas (date_from / date_to en ISO 8601)."
    ),
)
def get_sales_by_store(
    date_from: datetime | None = Query(default=None, description="Inicio del período (ISO 8601)."),
    date_to: datetime | None = Query(default=None, description="Fin del período (ISO 8601)."),
    db: Session = Depends(get_db),
):
    return crud_dashboard.get_sales_by_store(db, date_from=date_from, date_to=date_to)


# ── GET /dashboard/top-products ──────────────────────────────────────


@router.get(
    "/top-products",
    response_model=list[TopProductItem],
    summary="Productos más vendidos",
    description=(
        "Ranking de los N productos más vendidos. Cada producto incluye tanto las "
        "unidades vendidas (units_sold) como los ingresos generados (total_revenue), "
        "permitiendo dos lecturas distintas del mismo resultado. "
        "El param sort_by controla el orden: 'units' para ranking por unidades vendidas "
        "(qué producto se mueve más), 'revenue' para ranking por ingresos "
        "(qué producto aporta más dinero, aunque venda menos unidades). "
        "El param limit controla cuántos productos devolver (default 10, máximo 50)."
    ),
)
def get_top_products(
    sort_by: Literal["units", "revenue"] = Query(
        default="units",
        description="Orden: 'units' = por unidades vendidas, 'revenue' = por ingresos generados.",
    ),
    limit: int = Query(default=10, ge=1, le=50, description="Número de productos a devolver."),
    db: Session = Depends(get_db),
):
    return crud_dashboard.get_top_products(db, limit=limit, sort_by=sort_by)


# ── GET /dashboard/low-stock ─────────────────────────────────────────


@router.get(
    "/low-stock",
    response_model=list[LowStockItem],
    summary="Alertas de stock bajo",
    description=(
        "Lista todos los registros de stock donde quantity < min_stock, ordenados "
        "de menor a mayor quantity (el más crítico primero). "
        "Incluye quantity y min_stock para que el front pueda mostrar el déficit: "
        "deficit = min_stock - quantity. "
        "Cada alerta indica exactamente qué producto falta y en qué tienda."
    ),
)
def get_low_stock(db: Session = Depends(get_db)):
    return crud_dashboard.get_low_stock(db)
