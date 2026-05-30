from datetime import datetime

from sqlalchemy import func
from sqlmodel import Session, select

from .. import models


def get_summary(
    db: Session,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
) -> dict:
    """KPIs globales: ventas completadas, ingresos, canceladas, pendientes y alertas de stock."""
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
    """Ingresos y número de ventas completadas agrupados por tienda."""
    q = (
        select(
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
            "store_id": r.id_store,
            "store_name": r.store_name,
            "total_sales": r.total_sales,
            "total_revenue": float(r.total_revenue),
        }
        for r in rows
    ]


def get_top_products(db: Session, limit: int = 10) -> list[dict]:
    """Productos más vendidos por unidades totales vendidas."""
    rows = db.exec(
        select(
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
        .order_by(func.sum(models.SaleItem.quantity).desc())
        .limit(limit)
    ).all()

    return [
        {
            "product_id": r.id_product,
            "product_name": r.product_name,
            "sku": r.sku,
            "units_sold": r.units_sold,
            "total_revenue": float(r.total_revenue),
        }
        for r in rows
    ]


def get_low_stock(db: Session) -> list[dict]:
    """Productos cuya cantidad actual está por debajo del umbral mínimo."""
    rows = db.exec(
        select(
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
            "stock_id": r.id_stock,
            "product_id": r.id_product,
            "product_name": r.product_name,
            "sku": r.sku,
            "store_id": r.id_store,
            "store_name": r.store_name,
            "quantity": r.quantity,
            "min_stock": r.min_stock,
        }
        for r in rows
    ]
