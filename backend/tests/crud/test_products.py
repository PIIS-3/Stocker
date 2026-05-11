from sqlmodel import Session
from app.crud.products import (
    get_product_templates,
    get_products,
    get_product_by_id,
    get_product_by_sku,
    get_product_by_name,
    create_product,
    update_product,
    delete_product,
)
from app.models.category import Category
from app.models.product import ProductTemplate, ProductTemplateCreate, ProductTemplateUpdate

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


def test_get_product_by_sku(session: Session):
    category = Category(category_name="Electrónica", description="Gadgets")
    session.add(category)
    session.commit()
    session.refresh(category)

    product = ProductTemplate(
        sku="SKU-TEST-001",
        product_name="Headphones",
        brand="Sony",
        fixed_selling_price=299.99,
        category_id=category.id_category,
    )
    session.add(product)
    session.commit()

    found = get_product_by_sku(session, sku="SKU-TEST-001")
    assert found is not None
    assert found.product_name == "Headphones"


def test_get_product_by_name(session: Session):
    category = Category(category_name="Deportes", description="Equipamiento deportivo")
    session.add(category)
    session.commit()
    session.refresh(category)

    product = ProductTemplate(
        sku="SKU-SPORT-001",
        product_name="Running Shoes",
        brand="Nike",
        fixed_selling_price=129.99,
        category_id=category.id_category,
    )
    session.add(product)
    session.commit()

    found = get_product_by_name(session, product_name="Running Shoes")
    assert found is not None
    assert found.sku == "SKU-SPORT-001"


def test_create_product(session: Session):
    category = Category(category_name="Alimentos", description="Productos alimenticios")
    session.add(category)
    session.commit()
    session.refresh(category)

    product_in = ProductTemplateCreate(
        sku="SKU-FOOD-001",
        product_name="Café Premium",
        brand="Lavazza",
        fixed_selling_price=15.99,
        category_id=category.id_category,
    )

    created = create_product(session, product_in=product_in)

    assert created.id_product is not None
    assert created.sku == "SKU-FOOD-001"
    assert created.product_name == "Café Premium"


def test_update_product(session: Session):
    category = Category(category_name="Muebles", description="Muebles y decoración")
    session.add(category)
    session.commit()
    session.refresh(category)

    product = ProductTemplate(
        sku="SKU-FURN-001",
        product_name="Mesa Madera",
        brand="Ikea",
        fixed_selling_price=199.99,
        category_id=category.id_category,
    )
    session.add(product)
    session.commit()
    session.refresh(product)

    product_id = product.id_product
    product_update = ProductTemplateUpdate(
        product_name="Mesa Madera Premium",
        fixed_selling_price=249.99,
    )
    updated = update_product(session, product_id=product_id, product_in=product_update)

    assert updated is not None
    assert updated.product_name == "Mesa Madera Premium"
    assert updated.fixed_selling_price == 249.99


def test_delete_product(session: Session):
    category = Category(category_name="Libros", description="Literatura")
    session.add(category)
    session.commit()
    session.refresh(category)

    product = ProductTemplate(
        sku="SKU-BOOK-001",
        product_name="Python avanzado",
        brand="Editorial XYZ",
        fixed_selling_price=45.99,
        category_id=category.id_category,
    )
    session.add(product)
    session.commit()
    session.refresh(product)

    product_id = product.id_product
    deleted = delete_product(session, product_id=product_id)

    assert deleted is not None
    assert deleted.id_product == product_id
    assert get_product_by_id(session, product_id=product_id) is None
