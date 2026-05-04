from sqlmodel import Session

from app.crud.products import get_product_by_id, get_product_templates, get_products
from app.models.category import Category
from app.models.product import ProductTemplate


def test_get_product_templates(session: Session):
    # 1. Crear una categoría necesaria para el ProductTemplate
    category = Category(category_name="Electrónica", description="Gadgets y más")
    session.add(category)
    session.commit()
    session.refresh(category)

    # 2. Crear un par de plantillas de producto
    product1 = ProductTemplate(
        sku="SKU001",
        product_name="Smartphone X",
        brand="Apple",
        fixed_selling_price=999.99,
        category_id=category.id_category,
    )
    product2 = ProductTemplate(
        sku="SKU002",
        product_name="Laptop Pro",
        brand="Dell",
        fixed_selling_price=1499.99,
        category_id=category.id_category,
    )
    session.add(product1)
    session.add(product2)
    session.commit()

    # 3. Probar la función CRUD
    products = get_product_templates(session)

    assert len(products) == 2
    assert products[0].product_name == "Smartphone X"
    assert products[1].sku == "SKU002"


def test_get_products_and_get_product_by_id(session: Session):
    category = Category(category_name="Hogar", description="Productos del hogar")
    session.add(category)
    session.commit()
    session.refresh(category)

    product = ProductTemplate(
        sku="SKU100",
        product_name="Aspiradora",
        brand="Dyson",
        fixed_selling_price=399.99,
        category_id=category.id_category,
    )
    session.add(product)
    session.commit()
    session.refresh(product)

    products = get_products(session)
    found = get_product_by_id(session, product_id=product.id_product)

    assert any(item.id_product == product.id_product for item in products)
    assert found is not None
    assert found.id_product == product.id_product
    assert found.product_name == "Aspiradora"
