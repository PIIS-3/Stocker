from datetime import datetime
from typing import Literal

from sqlalchemy import func
from sqlmodel import Session, select

from .. import models


def get_summary(
    db: Session,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
) -> dict:
    """
    Devuelve los 5 KPIs principales del dashboard en un único objeto.

    Calcula por separado ventas completadas (con sus ingresos), canceladas y pendientes.
    Los tres contadores se filtran por el mismo rango de fechas si se indica.
    low_stock_count no aplica filtro de fecha: siempre refleja el estado actual
    del inventario (cuántos registros de stock tienen quantity < min_stock ahora mismo).
    """
    sale_q = select(
        func.count(models.Sale.id_sale).label("total_sales"),
        func.coalesce(func.sum(models.Sale.total_amount), 0).label("total_revenue"),
    ).where(models.Sale.status == models.SaleStatusEnum.Completed)

    cancelled_q = select(func.count(models.Sale.id_sale)).where(
        models.Sale.status == models.SaleStatusEnum.Cancelled
    )

    pending_q = select(func.count(models.Sale.id_sale)).where(
        models.Sale.status == models.SaleStatusEnum.Pending
    )

    if date_from:
        sale_q = sale_q.where(models.Sale.sale_date >= date_from)
        cancelled_q = cancelled_q.where(models.Sale.sale_date >= date_from)
        pending_q = pending_q.where(models.Sale.sale_date >= date_from)
    if date_to:
        sale_q = sale_q.where(models.Sale.sale_date <= date_to)
        cancelled_q = cancelled_q.where(models.Sale.sale_date <= date_to)
        pending_q = pending_q.where(models.Sale.sale_date <= date_to)

    total_sales, total_revenue = db.exec(sale_q).one()
    cancelled_sales = db.exec(cancelled_q).one()
    pending_sales = db.exec(pending_q).one()

    low_stock_count = db.exec(
        select(func.count(models.Stock.id_stock)).where(
            models.Stock.quantity < models.Stock.min_stock
        )
    ).one()

    return {
        "total_sales": total_sales,
        "total_revenue": float(total_revenue),
        "cancelled_sales": cancelled_sales,
        "pending_sales": pending_sales,
        "low_stock_count": low_stock_count,
    }


def get_sales_by_store(
    db: Session,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
) -> list[dict]:
    """
    Agrupa las ventas COMPLETADAS por tienda y calcula el total de transacciones
    e ingresos de cada una. Resultado ordenado de mayor a menor ingreso.

    Solo aparecen tiendas con al menos una venta completada en el período.
    Útil para el gráfico comparativo de tiendas en el dashboard.
    """
    q = (
        select(  # type: ignore[call-overload]
            models.Store.id_store,
            models.Store.store_name,
            func.count(models.Sale.id_sale).label("total_sales"),
            func.coalesce(func.sum(models.Sale.total_amount), 0).label("total_revenue"),
        )
        .join(models.Sale, models.Sale.store_id == models.Store.id_store)
        .where(models.Sale.status == models.SaleStatusEnum.Completed)
        .group_by(models.Store.id_store, models.Store.store_name)
        .order_by(func.sum(models.Sale.total_amount).desc())
    )

    if date_from:
        q = q.where(models.Sale.sale_date >= date_from)
    if date_to:
        q = q.where(models.Sale.sale_date <= date_to)

    rows = db.exec(q).all()
    return [
        {
            "store_id": id_store,
            "store_name": store_name,
            "total_sales": total_sales,
            "total_revenue": float(total_revenue),
        }
        for id_store, store_name, total_sales, total_revenue in rows
    ]


def get_top_products(
    db: Session,
    limit: int = 10,
    sort_by: Literal["units", "revenue"] = "units",
) -> list[dict]:
    """
    Ranking de los N productos más vendidos. Cada item incluye siempre tanto
    las unidades vendidas (units_sold) como los ingresos generados (total_revenue),
    lo que permite mostrar dos perspectivas distintas del mismo dato:

      sort_by='units'   → ordena por unidades vendidas. Muestra qué productos se
                          mueven más (volumen de ventas). Un producto barato puede
                          liderar este ranking aunque genere pocos ingresos.

      sort_by='revenue' → ordena por ingresos generados. Muestra qué productos
                          aportan más dinero. Un producto caro con pocas unidades
                          puede superar en este ranking a uno muy vendido pero barato.

    El front puede llamar dos veces al endpoint con distinto sort_by para montar
    dos tablas/gráficos independientes, o usar uno solo según la necesidad.
    """
    order_col = (
        func.sum(models.SaleItem.quantity)
        if sort_by == "units"
        else func.sum(models.SaleItem.subtotal)
    )

    rows = db.exec(
        select(  # type: ignore[call-overload]
            models.ProductTemplate.id_product,
            models.ProductTemplate.product_name,
            models.ProductTemplate.sku,
            func.sum(models.SaleItem.quantity).label("units_sold"),
            func.coalesce(func.sum(models.SaleItem.subtotal), 0).label("total_revenue"),
        )
        .join(models.SaleItem, models.SaleItem.product_id == models.ProductTemplate.id_product)
        .group_by(
            models.ProductTemplate.id_product,
            models.ProductTemplate.product_name,
            models.ProductTemplate.sku,
        )
        .order_by(order_col.desc())
        .limit(limit)
    ).all()

    return [
        {
            "product_id": id_product,
            "product_name": product_name,
            "sku": sku,
            "units_sold": units_sold,
            "total_revenue": float(total_revenue),
        }
        for id_product, product_name, sku, units_sold, total_revenue in rows
    ]


def get_low_stock(db: Session) -> list[dict]:
    """
    Lista todos los registros de stock donde quantity < min_stock.
    Resultado ordenado de menor a mayor quantity (el más crítico primero).

    Devuelve tanto quantity como min_stock para que el front pueda calcular
    el déficit exacto: deficit = min_stock - quantity.
    Incluye el nombre del producto, su SKU y la tienda afectada para que la
    alerta sea directamente legible sin necesidad de cruces adicionales.
    """
    rows = db.exec(
        select(  # type: ignore[call-overload]
            models.Stock.id_stock,
            models.ProductTemplate.id_product,
            models.ProductTemplate.product_name,
            models.ProductTemplate.sku,
            models.Store.id_store,
            models.Store.store_name,
            models.Stock.quantity,
            models.Stock.min_stock,
        )
        .join(models.ProductTemplate, models.ProductTemplate.id_product == models.Stock.product_id)
        .join(models.Store, models.Store.id_store == models.Stock.store_id)
        .where(models.Stock.quantity < models.Stock.min_stock)
        .order_by(models.Stock.quantity)
    ).all()

    return [
        {
            "stock_id": id_stock,
            "product_id": id_product,
            "product_name": product_name,
            "sku": sku,
            "store_id": id_store,
            "store_name": store_name,
            "quantity": quantity,
            "min_stock": min_stock,
        }
        for id_stock, id_product, product_name, sku, id_store, store_name, quantity, min_stock in rows  # noqa: E501
    ]
