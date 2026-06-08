from sqlmodel import Session

from app.crud.stock import (
    create_stock,
    delete_stock,
    get_stock_by_id,
    get_stock_by_product_and_store,
    get_stocks,
    update_stock,
)
from app.models.category import Category
from app.models.product import ProductTemplate
from app.models.stock import Stock, StockCreate, StockUpdate
from app.models.store import Store


# ── Helpers ──────────────────────────────────────────────────────────


def _seed_store(session: Session, name: str = "Tienda Test") -> Store:
    store = Store(store_name=name, address="Calle Test 123")
    session.add(store)
    session.commit()
    session.refresh(store)
    assert store.id_store is not None
    return store


def _seed_category(session: Session, name: str = "Categoría Test") -> Category:
    category = Category(category_name=name, description="Descripción de prueba")
    session.add(category)
    session.commit()
    session.refresh(category)
    assert category.id_category is not None
    return category


def _seed_product(
    session: Session,
    category_id: int,
    sku: str = "SKU-TEST",
    name: str = "Producto Test",
    price: float = 100.0,
) -> ProductTemplate:
    product = ProductTemplate(
        sku=sku,
        product_name=name,
        fixed_selling_price=price,
        category_id=category_id,
    )
    session.add(product)
    session.commit()
    session.refresh(product)
    return product


# ── CREATE ───────────────────────────────────────────────────────────


def test_create_stock(session: Session):
    store = _seed_store(session)
    category = _seed_category(session)
    product = _seed_product(session, category.id_category, sku="SKU-001", name="Monitor")

    stock_data = StockCreate(
        quantity=50,
        min_stock=10,
        product_id=product.id_product,
        store_id=store.id_store,
    )
    created_stock = create_stock(session, stock_data)

    assert created_stock.id_stock is not None
    assert created_stock.quantity == 50
    assert created_stock.min_stock == 10
    assert created_stock.product_id == product.id_product
    assert created_stock.store_id == store.id_store


def test_create_stock_multiple_different_combinations(session: Session):
    store1 = _seed_store(session, "Tienda 1")
    store2 = _seed_store(session, "Tienda 2")
    category = _seed_category(session)
    product1 = _seed_product(session, category.id_category, sku="SKU-A", name="Producto A")
    product2 = _seed_product(session, category.id_category, sku="SKU-B", name="Producto B")

    stock1 = create_stock(
        session,
        StockCreate(quantity=100, min_stock=20, product_id=product1.id_product, store_id=store1.id_store),
    )
    stock2 = create_stock(
        session,
        StockCreate(quantity=50, min_stock=10, product_id=product2.id_product, store_id=store1.id_store),
    )
    stock3 = create_stock(
        session,
        StockCreate(quantity=75, min_stock=15, product_id=product1.id_product, store_id=store2.id_store),
    )

    assert stock1.quantity == 100
    assert stock2.quantity == 50
    assert stock3.quantity == 75
    assert stock1.store_id == store1.id_store
    assert stock3.store_id == store2.id_store


# ── READ ─────────────────────────────────────────────────────────────


def test_get_stocks(session: Session):
    store = _seed_store(session)
    category = _seed_category(session)
    product1 = _seed_product(session, category.id_category, sku="SKU-001", name="Producto 1")
    product2 = _seed_product(session, category.id_category, sku="SKU-002", name="Producto 2")

    create_stock(
        session,
        StockCreate(quantity=50, min_stock=10, product_id=product1.id_product, store_id=store.id_store),
    )
    create_stock(
        session,
        StockCreate(quantity=75, min_stock=15, product_id=product2.id_product, store_id=store.id_store),
    )

    stocks = get_stocks(session)

    assert len(stocks) == 2
    quantities = {s.quantity for s in stocks}
    assert quantities == {50, 75}


def test_get_stocks_empty(session: Session):
    stocks = get_stocks(session)
    assert stocks == []


def test_get_stocks_with_pagination(session: Session):
    store = _seed_store(session)
    category = _seed_category(session)
    product = _seed_product(session, category.id_category)

    for i in range(5):
        create_stock(
            session,
            StockCreate(
                quantity=10 + i,
                min_stock=2,
                product_id=product.id_product,
                store_id=store.id_store if i == 0 else (_seed_store(session, f"Store {i}").id_store),
            ),
        )

    page1 = get_stocks(session, skip=0, limit=2)
    page2 = get_stocks(session, skip=2, limit=2)

    assert len(page1) == 2
    assert len(page2) == 2


# ── READ BY ID ───────────────────────────────────────────────────────


def test_get_stock_by_id(session: Session):
    store = _seed_store(session)
    category = _seed_category(session)
    product = _seed_product(session, category.id_category, sku="SKU-BYID", name="Stock by ID")

    created = create_stock(
        session,
        StockCreate(quantity=100, min_stock=20, product_id=product.id_product, store_id=store.id_store),
    )

    found = get_stock_by_id(session, created.id_stock)

    assert found is not None
    assert found.id_stock == created.id_stock
    assert found.quantity == 100
    assert found.product_id == product.id_product


def test_get_stock_by_id_not_found(session: Session):
    result = get_stock_by_id(session, 999999)
    assert result is None


def test_get_stock_by_product_and_store(session: Session):
    store = _seed_store(session)
    category = _seed_category(session)
    product = _seed_product(session, category.id_category)

    created = create_stock(
        session,
        StockCreate(quantity=50, min_stock=10, product_id=product.id_product, store_id=store.id_store),
    )

    found = get_stock_by_product_and_store(
        session,
        product_id=product.id_product,
        store_id=store.id_store,
    )

    assert found is not None
    assert found.id_stock == created.id_stock
    assert found.quantity == 50


def test_get_stock_by_product_and_store_not_found(session: Session):
    store = _seed_store(session)
    result = get_stock_by_product_and_store(
        session,
        product_id=999999,
        store_id=store.id_store,
    )
    assert result is None


# ── UPDATE ───────────────────────────────────────────────────────────


def test_update_stock_quantity(session: Session):
    store = _seed_store(session)
    category = _seed_category(session)
    product = _seed_product(session, category.id_category)

    stock = create_stock(
        session,
        StockCreate(quantity=50, min_stock=10, product_id=product.id_product, store_id=store.id_store),
    )

    updated = update_stock(session, stock.id_stock, StockUpdate(quantity=100))

    assert updated is not None
    assert updated.quantity == 100
    assert updated.min_stock == 10  # No cambia


def test_update_stock_min_stock(session: Session):
    store = _seed_store(session)
    category = _seed_category(session)
    product = _seed_product(session, category.id_category)

    stock = create_stock(
        session,
        StockCreate(quantity=50, min_stock=10, product_id=product.id_product, store_id=store.id_store),
    )

    updated = update_stock(session, stock.id_stock, StockUpdate(min_stock=25))

    assert updated is not None
    assert updated.min_stock == 25
    assert updated.quantity == 50  # No cambia


def test_update_stock_both_fields(session: Session):
    store = _seed_store(session)
    category = _seed_category(session)
    product = _seed_product(session, category.id_category)

    stock = create_stock(
        session,
        StockCreate(quantity=50, min_stock=10, product_id=product.id_product, store_id=store.id_store),
    )

    updated = update_stock(
        session,
        stock.id_stock,
        StockUpdate(quantity=150, min_stock=30),
    )

    assert updated is not None
    assert updated.quantity == 150
    assert updated.min_stock == 30


def test_update_stock_not_found(session: Session):
    result = update_stock(session, 999999, StockUpdate(quantity=100))
    assert result is None


def test_update_stock_partial_update(session: Session):
    """Solo algunos campos son seteados en el update."""
    store = _seed_store(session)
    category = _seed_category(session)
    product = _seed_product(session, category.id_category)

    stock = create_stock(
        session,
        StockCreate(quantity=50, min_stock=10, product_id=product.id_product, store_id=store.id_store),
    )

    # Update con solo quantity (min_stock no se especifica)
    updated = update_stock(session, stock.id_stock, StockUpdate(quantity=200))

    assert updated.quantity == 200
    assert updated.min_stock == 10  # Se mantiene el valor anterior


# ── DELETE ───────────────────────────────────────────────────────────


def test_delete_stock(session: Session):
    store = _seed_store(session)
    category = _seed_category(session)
    product = _seed_product(session, category.id_category)

    stock = create_stock(
        session,
        StockCreate(quantity=50, min_stock=10, product_id=product.id_product, store_id=store.id_store),
    )
    stock_id = stock.id_stock

    deleted = delete_stock(session, stock_id)

    assert deleted is not None
    assert deleted.id_stock == stock_id
    assert get_stock_by_id(session, stock_id) is None


def test_delete_stock_not_found(session: Session):
    result = delete_stock(session, 999999)
    assert result is None


def test_delete_stock_actual_removal(session: Session):
    store = _seed_store(session)
    category = _seed_category(session)
    product = _seed_product(session, category.id_category)

    stock = create_stock(
        session,
        StockCreate(quantity=50, min_stock=10, product_id=product.id_product, store_id=store.id_store),
    )

    delete_stock(session, stock.id_stock)

    # Verificar que después de eliminar, la lista está vacía
    stocks = get_stocks(session)
    assert len(stocks) == 0
