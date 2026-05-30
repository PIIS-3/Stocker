from collections.abc import Sequence

from sqlmodel import Session, col, select

from .. import models


# ── Read ─────────────────────────────────────────────────────────────


def get_stocks(db: Session, skip: int = 0, limit: int = 100) -> Sequence[models.Stock]:
    return db.exec(
        select(models.Stock).order_by(col(models.Stock.id_stock)).offset(skip).limit(limit)
    ).all()


def get_stock_by_id(db: Session, stock_id: int) -> models.Stock | None:
    return db.exec(select(models.Stock).where(models.Stock.id_stock == stock_id)).first()


def get_stock_by_product_and_store(
    db: Session, product_id: int, store_id: int
) -> models.Stock | None:
    return db.exec(
        select(models.Stock).where(
            models.Stock.product_id == product_id,
            models.Stock.store_id == store_id,
        )
    ).first()


def get_stocks_by_store(
    db: Session, store_id: int, skip: int = 0, limit: int = 100
) -> Sequence[models.Stock]:
    return db.exec(
        select(models.Stock)
        .where(models.Stock.store_id == store_id)
        .order_by(col(models.Stock.id_stock))
        .offset(skip)
        .limit(limit)
    ).all()


def get_stocks_by_product(
    db: Session, product_id: int, skip: int = 0, limit: int = 100
) -> Sequence[models.Stock]:
    return db.exec(
        select(models.Stock)
        .where(models.Stock.product_id == product_id)
        .order_by(col(models.Stock.id_stock))
        .offset(skip)
        .limit(limit)
    ).all()


# ── Create ───────────────────────────────────────────────────────────


def create_stock(db: Session, stock_in: models.StockCreate) -> models.Stock:
    db_stock = models.Stock.model_validate(stock_in)
    db.add(db_stock)
    db.commit()
    db.refresh(db_stock)
    return db_stock


# ── Update ───────────────────────────────────────────────────────────


def update_stock(
    db: Session, stock_id: int, stock_in: models.StockUpdate
) -> models.Stock | None:
    db_stock = get_stock_by_id(db, stock_id)
    if db_stock is None:
        return None

    update_data = stock_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_stock, field, value)

    db.add(db_stock)
    db.commit()
    db.refresh(db_stock)
    return db_stock


# ── Delete ───────────────────────────────────────────────────────────


def delete_stock(db: Session, stock_id: int) -> models.Stock | None:
    db_stock = get_stock_by_id(db, stock_id)
    if db_stock is None:
        return None

    db.delete(db_stock)
    db.flush()
    db.expunge(db_stock)
    db.commit()
    return db_stock
