from sqlmodel import Session

from app.crud.sale_item import (
    create_sale_item,
    delete_sale_item,
    get_items_by_product,
    get_items_by_sale,
    get_sale_item_by_id,
    get_sale_items,
    update_sale_item,
)
from app.models.category import Category
from app.models.employee import Employee
from app.models.enums import RoleEnum, SaleStatusEnum
from app.models.product import ProductTemplate
from app.models.role import Role
from app.models.sale import Sale
from app.models.sale_item import SaleItem, SaleItemCreate, SaleItemUpdate
from app.models.store import Store


def _seed_role(session: Session) -> Role:
    role = Role(role_name=RoleEnum.Staff)
    session.add(role)
    session.commit()
    session.refresh(role)
    return role


def _seed_store(session: Session) -> Store:
    store = Store(store_name="TiendaTest", address="Calle Test 1")
    session.add(store)
    session.commit()
    session.refresh(store)
    return store


def _seed_employee(
    session: Session,
    username: str,
    role_id: int,
    store_id: int,
) -> Employee:
    employee = Employee(
        first_name="Test",
        last_name="User",
        username=username,
        hashed_password="hashed_pw_placeholder",
        role_id=role_id,
        store_id=store_id,
    )
    session.add(employee)
    session.commit()
    session.refresh(employee)
    return employee


def _seed_category(session: Session) -> Category:
    category = Category(category_name="Electrónica", description="Gadgets")
    session.add(category)
    session.commit()
    session.refresh(category)
    return category


def _seed_product(session: Session, category_id: int, sku: str = "SKU-001") -> ProductTemplate:
    product = ProductTemplate(
        sku=sku,
        product_name="Producto Test",
        brand="Marca Test",
        fixed_selling_price=50.0,
        category_id=category_id,
    )
    session.add(product)
    session.commit()
    session.refresh(product)
    return product


def _seed_sale(
    session: Session,
    store_id: int,
    employee_id: int,
) -> Sale:
    sale = Sale(
        store_id=store_id,
        employee_id=employee_id,
        total_amount=100.0,
        status=SaleStatusEnum.Completed,
    )
    session.add(sale)
    session.commit()
    session.refresh(sale)
    return sale


def _seed_item(
    session: Session,
    sale_id: int,
    product_id: int,
    quantity: int = 2,
    unit_price: float = 50.0,
    subtotal: float = 100.0,
) -> SaleItem:
    item = SaleItem(
        sale_id=sale_id,
        product_id=product_id,
        quantity=quantity,
        unit_price=unit_price,
        subtotal=subtotal,
    )
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


# ── Create ───────────────────────────────────────────────────────────


def test_create_sale_item_assigns_id(session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee = _seed_employee(session, "emp1", role.id_role, store.id_store)
    category = _seed_category(session)
    product = _seed_product(session, category.id_category)
    sale = _seed_sale(session, store.id_store, employee.id_employee)

    item_in = SaleItemCreate(
        sale_id=sale.id_sale,
        product_id=product.id_product,
        quantity=3,
        unit_price=25.0,
        subtotal=75.0,
    )

    result = create_sale_item(session, item_in=item_in)

    assert result.id_sale_item is not None
    assert result.sale_id == sale.id_sale
    assert result.product_id == product.id_product
    assert result.quantity == 3
    assert result.unit_price == 25.0
    assert result.subtotal == 75.0


# ── Read ─────────────────────────────────────────────────────────────


def test_get_sale_items_returns_all(session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee = _seed_employee(session, "emp2", role.id_role, store.id_store)
    category = _seed_category(session)
    product = _seed_product(session, category.id_category)
    sale = _seed_sale(session, store.id_store, employee.id_employee)

    _seed_item(session, sale.id_sale, product.id_product, quantity=1, subtotal=50.0)
    _seed_item(session, sale.id_sale, product.id_product, quantity=2, subtotal=100.0)

    results = get_sale_items(session)

    assert len(results) == 2


def test_get_sale_items_empty_db(session: Session):
    results = get_sale_items(session)

    assert results == []


def test_get_sale_items_pagination(session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee = _seed_employee(session, "emp3", role.id_role, store.id_store)
    category = _seed_category(session)
    product = _seed_product(session, category.id_category)
    sale = _seed_sale(session, store.id_store, employee.id_employee)

    _seed_item(session, sale.id_sale, product.id_product, quantity=1, subtotal=10.0)
    _seed_item(session, sale.id_sale, product.id_product, quantity=2, subtotal=20.0)
    _seed_item(session, sale.id_sale, product.id_product, quantity=3, subtotal=30.0)

    results = get_sale_items(session, skip=0, limit=2)

    assert len(results) == 2


def test_get_sale_item_by_id_found(session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee = _seed_employee(session, "emp4", role.id_role, store.id_store)
    category = _seed_category(session)
    product = _seed_product(session, category.id_category)
    sale = _seed_sale(session, store.id_store, employee.id_employee)
    seeded = _seed_item(session, sale.id_sale, product.id_product, quantity=5, subtotal=250.0)

    result = get_sale_item_by_id(session, item_id=seeded.id_sale_item)

    assert result is not None
    assert result.id_sale_item == seeded.id_sale_item
    assert result.quantity == 5


def test_get_sale_item_by_id_not_found(session: Session):
    result = get_sale_item_by_id(session, item_id=999999)

    assert result is None


def test_get_items_by_sale(session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee = _seed_employee(session, "emp5", role.id_role, store.id_store)
    category = _seed_category(session)
    product = _seed_product(session, category.id_category)
    sale1 = _seed_sale(session, store.id_store, employee.id_employee)
    sale2 = _seed_sale(session, store.id_store, employee.id_employee)

    _seed_item(session, sale1.id_sale, product.id_product, quantity=1, subtotal=10.0)
    _seed_item(session, sale2.id_sale, product.id_product, quantity=2, subtotal=20.0)

    results = get_items_by_sale(session, sale_id=sale1.id_sale)

    assert len(results) == 1
    assert results[0].quantity == 1


def test_get_items_by_product(session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee = _seed_employee(session, "emp6", role.id_role, store.id_store)
    category = _seed_category(session)
    product1 = _seed_product(session, category.id_category, sku="SKU-A")
    product2 = _seed_product(session, category.id_category, sku="SKU-B")
    sale = _seed_sale(session, store.id_store, employee.id_employee)

    _seed_item(session, sale.id_sale, product1.id_product, quantity=1, subtotal=10.0)
    _seed_item(session, sale.id_sale, product2.id_product, quantity=2, subtotal=20.0)

    results = get_items_by_product(session, product_id=product1.id_product)

    assert len(results) == 1
    assert results[0].quantity == 1


# ── Update ───────────────────────────────────────────────────────────


def test_update_sale_item_changes_quantity(session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee = _seed_employee(session, "emp7", role.id_role, store.id_store)
    category = _seed_category(session)
    product = _seed_product(session, category.id_category)
    sale = _seed_sale(session, store.id_store, employee.id_employee)
    seeded = _seed_item(session, sale.id_sale, product.id_product, quantity=2, subtotal=100.0)

    update_in = SaleItemUpdate(quantity=5)
    result = update_sale_item(session, item_id=seeded.id_sale_item, item_in=update_in)

    assert result is not None
    assert result.quantity == 5
    assert result.unit_price == 50.0


def test_update_sale_item_changes_unit_price(session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee = _seed_employee(session, "emp8", role.id_role, store.id_store)
    category = _seed_category(session)
    product = _seed_product(session, category.id_category)
    sale = _seed_sale(session, store.id_store, employee.id_employee)
    seeded = _seed_item(session, sale.id_sale, product.id_product, unit_price=50.0, subtotal=100.0)

    update_in = SaleItemUpdate(unit_price=75.0)
    result = update_sale_item(session, item_id=seeded.id_sale_item, item_in=update_in)

    assert result is not None
    assert result.unit_price == 75.0
    assert result.quantity == 2


def test_update_sale_item_changes_subtotal(session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee = _seed_employee(session, "emp9", role.id_role, store.id_store)
    category = _seed_category(session)
    product = _seed_product(session, category.id_category)
    sale = _seed_sale(session, store.id_store, employee.id_employee)
    seeded = _seed_item(session, sale.id_sale, product.id_product, subtotal=100.0)

    update_in = SaleItemUpdate(subtotal=350.0)
    result = update_sale_item(session, item_id=seeded.id_sale_item, item_in=update_in)

    assert result is not None
    assert result.subtotal == 350.0


def test_update_sale_item_exclude_unset(session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee = _seed_employee(session, "emp10", role.id_role, store.id_store)
    category = _seed_category(session)
    product = _seed_product(session, category.id_category)
    sale = _seed_sale(session, store.id_store, employee.id_employee)
    seeded = _seed_item(
        session, sale.id_sale, product.id_product, quantity=3, unit_price=20.0, subtotal=60.0
    )

    update_in = SaleItemUpdate(quantity=4)
    result = update_sale_item(session, item_id=seeded.id_sale_item, item_in=update_in)

    assert result is not None
    assert result.quantity == 4
    assert result.unit_price == 20.0
    assert result.subtotal == 60.0


def test_update_sale_item_not_found_returns_none(session: Session):
    update_in = SaleItemUpdate(quantity=10)

    result = update_sale_item(session, item_id=999999, item_in=update_in)

    assert result is None


# ── Delete ───────────────────────────────────────────────────────────


def test_delete_sale_item_returns_deleted_record(session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee = _seed_employee(session, "emp11", role.id_role, store.id_store)
    category = _seed_category(session)
    product = _seed_product(session, category.id_category)
    sale = _seed_sale(session, store.id_store, employee.id_employee)
    seeded = _seed_item(session, sale.id_sale, product.id_product, quantity=1, subtotal=50.0)

    result = delete_sale_item(session, item_id=seeded.id_sale_item)

    assert result is not None
    assert result.id_sale_item == seeded.id_sale_item
    assert result.quantity == 1


def test_delete_sale_item_removes_from_db(session: Session):
    role = _seed_role(session)
    store = _seed_store(session)
    employee = _seed_employee(session, "emp12", role.id_role, store.id_store)
    category = _seed_category(session)
    product = _seed_product(session, category.id_category)
    sale = _seed_sale(session, store.id_store, employee.id_employee)
    seeded = _seed_item(session, sale.id_sale, product.id_product)

    delete_sale_item(session, item_id=seeded.id_sale_item)
    after = get_sale_item_by_id(session, item_id=seeded.id_sale_item)

    assert after is None


def test_delete_sale_item_not_found_returns_none(session: Session):
    result = delete_sale_item(session, item_id=999999)

    assert result is None
