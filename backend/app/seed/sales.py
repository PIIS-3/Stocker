"""
sales.py — Datos de prueba y lógica de seed para Ventas.
"""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from sqlmodel import Session, select

from .. import models
from ._base import SeedReport

SALES_SEED: list[dict[str, Any]] = [
    {
        "store_name": "Almacén Central Madrid",
        "employee_username": "carlos.garcia",
        "total_amount": 316.50,
        "status": models.SaleStatusEnum.Completed,
        "sale_date": datetime(2026, 5, 10, 9, 30, 0, tzinfo=UTC),
    },
    {
        "store_name": "Almacén Central Madrid",
        "employee_username": "ana.rodriguez",
        "total_amount": 120.00,
        "status": models.SaleStatusEnum.Completed,
        "sale_date": datetime(2026, 5, 10, 10, 15, 0, tzinfo=UTC),
    },
    {
        "store_name": "Centro Distribución Barcelona",
        "employee_username": "maria.lopez",
        "total_amount": 174.15,
        "status": models.SaleStatusEnum.Completed,
        "sale_date": datetime(2026, 5, 10, 11, 0, 0, tzinfo=UTC),
    },
    {
        "store_name": "Centro Distribución Barcelona",
        "employee_username": "pedro.sanchez",
        "total_amount": 48.75,
        "status": models.SaleStatusEnum.Completed,
        "sale_date": datetime(2026, 5, 11, 8, 45, 0, tzinfo=UTC),
    },
    {
        "store_name": "Almacén Valencia",
        "employee_username": "juan.martin",
        "total_amount": 325.50,
        "status": models.SaleStatusEnum.Completed,
        "sale_date": datetime(2026, 5, 11, 9, 30, 0, tzinfo=UTC),
    },
    {
        "store_name": "Delegación Sevilla",
        "employee_username": "laura.fernandez",
        "total_amount": 270.00,
        "status": models.SaleStatusEnum.Completed,
        "sale_date": datetime(2026, 5, 11, 10, 0, 0, tzinfo=UTC),
    },
    {
        "store_name": "Sucursal Bilbao",
        "employee_username": "david.gonzalez",
        "total_amount": 90.40,
        "status": models.SaleStatusEnum.Completed,
        "sale_date": datetime(2026, 5, 11, 11, 30, 0, tzinfo=UTC),
    },
    {
        "store_name": "Almacén Zaragoza",
        "employee_username": "isabel.jimenez",
        "total_amount": 0.0,
        "status": models.SaleStatusEnum.Cancelled,
        "sale_date": datetime(2026, 5, 12, 8, 15, 0, tzinfo=UTC),
    },
    {
        "store_name": "Almacén Central Madrid",
        "employee_username": "carlos.garcia",
        "total_amount": 150.00,
        "status": models.SaleStatusEnum.Pending,
        "sale_date": datetime(2026, 5, 12, 9, 0, 0, tzinfo=UTC),
    },
    {
        "store_name": "Centro Distribución Barcelona",
        "employee_username": "maria.lopez",
        "total_amount": 204.90,
        "status": models.SaleStatusEnum.Completed,
        "sale_date": datetime(2026, 5, 12, 10, 30, 0, tzinfo=UTC),
    },
]


def seed_sales(
    session: Session,
    report: SeedReport,
    stores_by_name: dict[str, models.Store],
) -> list[models.Sale]:
    """Inserta ventas de prueba en la base de datos.

    Las ventas se insertan directamente (no upsert) porque son datos
    transaccionales. Si existen ventas previas, se omite la inserción
    para evitar duplicados en ejecuciones repetidas.
    """
    existing = session.exec(select(models.Sale).limit(1)).first()
    if existing is not None:
        report.register("Ventas", created=False)
        return []

    employees = session.exec(select(models.Employee)).all()
    employees_by_username: dict[str, models.Employee] = {e.username: e for e in employees}

    sales: list[models.Sale] = []

    for data in SALES_SEED:
        store_name: str = data["store_name"]
        employee_username: str = data["employee_username"]

        store = stores_by_name.get(store_name)
        if store is None:
            raise ValueError(f"Tienda '{store_name}' no encontrada para la venta seed.")

        employee = employees_by_username.get(employee_username)
        if employee is None:
            raise ValueError(f"Empleado '{employee_username}' no encontrado para la venta seed.")

        sale = models.Sale(
            store_id=store.id_store,
            employee_id=employee.id_employee,
            total_amount=data["total_amount"],
            status=data["status"],
            sale_date=data["sale_date"],
        )
        session.add(sale)
        session.flush()
        sales.append(sale)
        report.register("Ventas", created=True)

    return sales
