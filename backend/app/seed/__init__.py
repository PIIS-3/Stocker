"""
Paquete de seed para la base de datos.
Permite inicializar la base de datos con datos de prueba organizados por entidad.
"""
from __future__ import annotations

from sqlmodel import Session
from sqlalchemy.exc import SQLAlchemyError

from ..database import engine
from ._base import SeedReport
from .roles import seed_roles
from .categories import seed_categories
from .stores import seed_stores
from .products import seed_products
from .employees import seed_employees

def run_seed() -> None:
    """Ejecuta todos los seeders en una única transacción global.

    Este proceso interactúa directamente con la base de datos mediante SQLModel,
    por lo que NO requiere tokens de autenticación ni pasar por la capa API.
    """
    report = SeedReport()

    with Session(engine) as session:
        try:
            # ── 0. Roles ──────────────────────────────────────────────────────
            # Base jerárquica necesaria para crear empleados.
            roles_map = seed_roles(session, report)

            # ── 1. Categorías ─────────────────────────────────────────────────
            # Necesarias para clasificar los productos.
            categories_map = seed_categories(session, report)

            # ── 2. Tiendas ────────────────────────────────────────────────────
            # Lugar físico de trabajo para los empleados.
            stores_map = seed_stores(session, report)

            # ── 3. Productos ──────────────────────────────────────────────────
            # Plantillas de productos vinculadas a sus categorías.
            seed_products(session, report, categories_map)

            # ── 4. Empleados ──────────────────────────────────────────────────
            # Personal del sistema vinculado a roles y tiendas específicas.
            seed_employees(session, report, stores_map, roles_map)

            # Confirmación de todos los cambios.
            session.commit()
            report.print_summary()

        except (SQLAlchemyError, ValueError) as exc:
            session.rollback()
            print(f"\n❌ Error ejecutando seed: {exc}")
            raise SystemExit(1) from exc


if __name__ == "__main__":
    run_seed()
