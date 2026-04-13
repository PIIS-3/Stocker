from __future__ import annotations

from typing import Any, Dict, List, Tuple

from sqlalchemy.exc import SQLAlchemyError
from sqlmodel import Session, select

from . import models
from .database import engine

# Datos semilla en estructuras dict para facilitar mantenimiento y pruebas UI.
CATEGORIES_SEED: List[Dict[str, Any]] = [
    {
        "category_name": "Electrónica",
        "description": "Dispositivos, cables y componentes tecnológicos",
    },
    {
        "category_name": "Herramientas",
        "description": "Herramientas manuales y eléctricas para mantenimiento",
    },
    {
        "category_name": "Papelería",
        "description": "Material de oficina, papel y consumibles",
    },
    {
        "category_name": "Limpieza",
        "description": "Productos de higiene y limpieza industrial",
    },
]

PRODUCTS_SEED: List[Dict[str, Any]] = [
    {
        "product_name": "Monitor 24 Pulgadas LED",
        "sku": "ELEC-MON-001",
        "fixed_selling_price": 150.00,
        "category_name": "Electrónica",
    },
    {
        "product_name": "Teclado Mecánico RGB",
        "sku": "ELEC-TEC-002",
        "fixed_selling_price": 85.50,
        "category_name": "Electrónica",
    },
    {
        "product_name": "Taladro Percutor 18V",
        "sku": "TOOL-TAL-045",
        "fixed_selling_price": 120.00,
        "category_name": "Herramientas",
    },
    {
        "product_name": "Caja de Folios A4 (500h)",
        "sku": "PAP-FOL-100",
        "fixed_selling_price": 5.95,
        "category_name": "Papelería",
    },
    {
        "product_name": "Destornillador de Precisión Set",
        "sku": "TOOL-DES-230",
        "fixed_selling_price": 24.90,
        "category_name": "Herramientas",
    },
    {
        "product_name": "Desinfectante Multiusos 1L",
        "sku": "LIMP-DES-010",
        "fixed_selling_price": 3.75,
        "category_name": "Limpieza",
    },
]


def upsert_category(session: Session, data: Dict[str, Any]) -> Tuple[models.Category, bool]:
    existing = session.exec(
        select(models.Category).where(models.Category.category_name == data["category_name"])
    ).first()

    if existing:
        existing.description = data["description"]
        existing.status = models.StatusEnum.Active
        session.add(existing)
        return existing, False

    created = models.Category(
        category_name=data["category_name"],
        description=data["description"],
        status=models.StatusEnum.Active,
    )
    session.add(created)
    session.flush()
    return created, True


def upsert_product(
    session: Session, data: Dict[str, Any], category_id: int
) -> Tuple[models.ProductTemplate, bool]:
    existing = session.exec(
        select(models.ProductTemplate).where(models.ProductTemplate.sku == data["sku"])
    ).first()

    if existing:
        existing.product_name = data["product_name"]
        existing.fixed_selling_price = data["fixed_selling_price"]
        existing.category_id = category_id
        existing.status = models.StatusEnum.Active
        session.add(existing)
        return existing, False

    created = models.ProductTemplate(
        product_name=data["product_name"],
        sku=data["sku"],
        fixed_selling_price=data["fixed_selling_price"],
        category_id=category_id,
        status=models.StatusEnum.Active,
    )
    session.add(created)
    session.flush()
    return created, True


def run_seed() -> None:
    categories_created = 0
    categories_updated = 0
    products_created = 0
    products_updated = 0

    with Session(engine) as session:
        try:
            categories_by_name: Dict[str, models.Category] = {}

            for category_data in CATEGORIES_SEED:
                category, created = upsert_category(session, category_data)
                categories_by_name[category.category_name] = category
                if created:
                    categories_created += 1
                else:
                    categories_updated += 1

            for product_data in PRODUCTS_SEED:
                category_name = product_data["category_name"]
                category = categories_by_name.get(category_name)
                if not category:
                    raise ValueError(
                        f"Categoría no encontrada para el producto {product_data['sku']}: {category_name}"
                    )

                _, created = upsert_product(session, product_data, category.id_category)
                if created:
                    products_created += 1
                else:
                    products_updated += 1

            session.commit()
        except (SQLAlchemyError, ValueError) as exc:
            session.rollback()
            raise SystemExit(f"Error ejecutando seed: {exc}") from exc

    print("Seed completado correctamente")
    print(f"Categorías creadas: {categories_created}")
    print(f"Categorías actualizadas: {categories_updated}")
    print(f"Productos creados: {products_created}")
    print(f"Productos actualizados: {products_updated}")


if __name__ == "__main__":
    run_seed()
