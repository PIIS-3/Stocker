"""
Paquete de seed para la base de datos.
Permite inicializar la base de datos con datos de prueba organizados por entidad.
"""
from __future__ import annotations

from sqlmodel import Session
from sqlalchemy.exc import SQLAlchemyError

from ..database import engine
from ._base import SeedReport
from .categories import seed_categories
from .products import seed_products
from .stores import seed_stores

def run_seed() -> None:
    """Ejecuta todos los seeders en una única transacción global."""
    report = SeedReport()

    with Session(engine) as session:
        try:
            # 1. Categorías (necesarias para productos)
            categories_map = seed_categories(session, report)
            
            # 2. Productos
            seed_products(session, report, categories_map)
            
            # 3. Tiendas
            seed_stores(session, report)

            session.commit()
            report.print_summary()
            
        except (SQLAlchemyError, ValueError) as exc:
            session.rollback()
            print(f"\n❌ Error ejecutando seed: {exc}")
            raise SystemExit(1) from exc

if __name__ == "__main__":
    run_seed()
