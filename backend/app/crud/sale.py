from collections.abc import Sequence

from sqlmodel import Session, col, select

from .. import models

# ── Read ─────────────────────────────────────────────────────────────


def get_sales(db: Session, skip: int = 0, limit: int = 100) -> Sequence[models.Sale]:
    return db.exec(
        select(models.Sale).order_by(col(models.Sale.id_sale)).offset(skip).limit(limit)
    ).all()


def get_sale_by_id(db: Session, sale_id: int) -> models.Sale | None:
    return db.exec(select(models.Sale).where(models.Sale.id_sale == sale_id)).first()


def get_sales_by_store(
    db: Session, store_id: int, skip: int = 0, limit: int = 100
) -> Sequence[models.Sale]:
    return db.exec(
        select(models.Sale)
        .where(models.Sale.store_id == store_id)
        .order_by(col(models.Sale.id_sale))
        .offset(skip)
        .limit(limit)
    ).all()


def get_sales_by_employee(
    db: Session, employee_id: int, skip: int = 0, limit: int = 100
) -> Sequence[models.Sale]:
    return db.exec(
        select(models.Sale)
        .where(models.Sale.employee_id == employee_id)
        .order_by(col(models.Sale.id_sale))
        .offset(skip)
        .limit(limit)
    ).all()


# ── Create ───────────────────────────────────────────────────────────


def create_sale(db: Session, sale_in: models.SaleCreate) -> models.Sale:
    db_sale = models.Sale.model_validate(sale_in)
    db.add(db_sale)
    db.commit()
    db.refresh(db_sale)
    return db_sale


# ── Update ───────────────────────────────────────────────────────────


def update_sale(db: Session, sale_id: int, sale_in: models.SaleUpdate) -> models.Sale | None:
    db_sale = get_sale_by_id(db, sale_id)
    if db_sale is None:
        return None

    update_data = sale_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_sale, field, value)

    db.add(db_sale)
    db.commit()
    db.refresh(db_sale)
    return db_sale


# ── Delete ───────────────────────────────────────────────────────────


def delete_sale(db: Session, sale_id: int) -> models.Sale | None:
    db_sale = get_sale_by_id(db, sale_id)
    if db_sale is None:
        return None

    db.delete(db_sale)
    db.flush()
    db.expunge(db_sale)
    db.commit()
    return db_sale
