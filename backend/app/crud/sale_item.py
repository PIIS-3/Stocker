from collections.abc import Sequence

from sqlmodel import Session, col, select

from .. import models

# ── Read ─────────────────────────────────────────────────────────────


def get_sale_items(db: Session, skip: int = 0, limit: int = 100) -> Sequence[models.SaleItem]:
    return db.exec(
        select(models.SaleItem)
        .order_by(col(models.SaleItem.id_sale_item))
        .offset(skip)
        .limit(limit)
    ).all()


def get_sale_item_by_id(db: Session, item_id: int) -> models.SaleItem | None:
    return db.exec(select(models.SaleItem).where(models.SaleItem.id_sale_item == item_id)).first()


def get_items_by_sale(
    db: Session, sale_id: int, skip: int = 0, limit: int = 100
) -> Sequence[models.SaleItem]:
    return db.exec(
        select(models.SaleItem)
        .where(models.SaleItem.sale_id == sale_id)
        .order_by(col(models.SaleItem.id_sale_item))
        .offset(skip)
        .limit(limit)
    ).all()


def get_items_by_product(
    db: Session, product_id: int, skip: int = 0, limit: int = 100
) -> Sequence[models.SaleItem]:
    return db.exec(
        select(models.SaleItem)
        .where(models.SaleItem.product_id == product_id)
        .order_by(col(models.SaleItem.id_sale_item))
        .offset(skip)
        .limit(limit)
    ).all()


# ── Create ───────────────────────────────────────────────────────────


def create_sale_item(db: Session, item_in: models.SaleItemCreate) -> models.SaleItem:
    db_item = models.SaleItem.model_validate(item_in)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


# ── Update ───────────────────────────────────────────────────────────


def update_sale_item(
    db: Session, item_id: int, item_in: models.SaleItemUpdate
) -> models.SaleItem | None:
    db_item = get_sale_item_by_id(db, item_id)
    if db_item is None:
        return None

    update_data = item_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_item, field, value)

    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


# ── Delete ───────────────────────────────────────────────────────────


def delete_sale_item(db: Session, item_id: int) -> models.SaleItem | None:
    db_item = get_sale_item_by_id(db, item_id)
    if db_item is None:
        return None

    db.delete(db_item)
    db.flush()
    db.expunge(db_item)
    db.commit()
    return db_item
