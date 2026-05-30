"""
Dashboard — Endpoints de estadísticas para el panel de administración
=====================================================================

BASE URL: /api/dashboard

Todos los endpoints requieren token de empleado (Authorization: Bearer <token>).

────────────────────────────────────────────────────────────────────────────────
ENDPOINTS DISPONIBLES
────────────────────────────────────────────────────────────────────────────────

  GET /api/dashboard/summary
      KPIs globales del negocio. Devuelve ventas completadas, ingresos totales,
      ventas canceladas, ventas pendientes y número de productos con stock bajo.
      Params opcionales: date_from, date_to (ISO 8601, ej: 2026-01-01T00:00:00)
      → Usar para las tarjetas de resumen superiores del dashboard.

  GET /api/dashboard/sales-by-store
      Ingresos y número de ventas agrupados por tienda, ordenados de mayor a menor
      ingreso. Solo cuenta ventas con status "Completed".
      Params opcionales: date_from, date_to
      → Usar para el gráfico de barras / tabla comparativa de tiendas.

  GET /api/dashboard/top-products
      Ranking de productos más vendidos por unidades. Incluye ingresos generados.
      Param opcional: limit (default: 10, máximo recomendado: 20)
      → Usar para la tabla o gráfico de top productos.

  GET /api/dashboard/low-stock
      Lista de productos cuya cantidad actual (quantity) está por debajo del umbral
      mínimo configurado (min_stock). Ordenados de menor a mayor stock restante.
      Sin params.
      → Usar para la sección de alertas / notificaciones de stock crítico.

────────────────────────────────────────────────────────────────────────────────
FILTRO DE FECHAS
────────────────────────────────────────────────────────────────────────────────

  Los endpoints summary y sales-by-store aceptan date_from y date_to como query
  params en formato ISO 8601. Ejemplos de uso:

    /api/dashboard/summary?date_from=2026-01-01T00:00:00&date_to=2026-01-31T23:59:59
    /api/dashboard/summary?date_from=2026-05-01T00:00:00   ← desde mayo hasta hoy

  Si no se pasan, se devuelven datos de todos los tiempos.

────────────────────────────────────────────────────────────────────────────────
SHAPES DE RESPUESTA (para tipar en el frontend)
────────────────────────────────────────────────────────────────────────────────

  SummaryResponse:
    total_sales:     number   — ventas completadas en el período
    total_revenue:   number   — ingresos totales (€) de ventas completadas
    cancelled_sales: number   — ventas canceladas en el período
    pending_sales:   number   — ventas pendientes en el período
    low_stock_count: number   — productos con quantity < min_stock (sin filtro de fecha)

  SalesByStoreItem:
    store_id:      number
    store_name:    string
    total_sales:   number   — ventas completadas de esa tienda
    total_revenue: number   — ingresos (€) de esa tienda

  TopProductItem:
    product_id:    number
    product_name:  string
    sku:           string
    units_sold:    number   — unidades totales vendidas
    total_revenue: number   — ingresos (€) generados por ese producto

  LowStockItem:
    stock_id:      number
    product_id:    number
    product_name:  string
    sku:           string
    store_id:      number
    store_name:    string
    quantity:      number   — stock actual
    min_stock:     number   — umbral mínimo configurado
"""

from datetime import datetime

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
        "Devuelve las métricas principales del negocio: ventas completadas, ingresos totales, "
        "ventas canceladas, ventas pendientes y productos con stock bajo el mínimo. "
        "Acepta filtro opcional por rango de fechas (date_from / date_to en ISO 8601). "
        "low_stock_count siempre refleja el estado actual del inventario, sin filtro de fecha."
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
        "Devuelve el total de ventas completadas e ingresos agrupados por tienda, "
        "ordenados de mayor a menor ingreso. "
        "Acepta filtro opcional por rango de fechas (date_from / date_to en ISO 8601)."
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
        "Devuelve el ranking de productos más vendidos por unidades totales, "
        "junto con los ingresos que han generado. "
        "El parámetro limit controla cuántos productos devolver (por defecto 10)."
    ),
)
def get_top_products(
    limit: int = Query(default=10, ge=1, le=50, description="Número de productos a devolver."),
    db: Session = Depends(get_db),
):
    return crud_dashboard.get_top_products(db, limit=limit)


# ── GET /dashboard/low-stock ─────────────────────────────────────────


@router.get(
    "/low-stock",
    response_model=list[LowStockItem],
    summary="Alertas de stock bajo",
    description=(
        "Devuelve los productos cuya cantidad actual (quantity) está por debajo "
        "del umbral mínimo configurado (min_stock), ordenados de menor a mayor stock restante. "
        "Usar para mostrar alertas en el dashboard."
    ),
)
def get_low_stock(db: Session = Depends(get_db)):
    return crud_dashboard.get_low_stock(db)
