from sqlmodel import Session

from app.crud.categories import (
    create_category,
    delete_category,
    get_categories,
    get_category_by_id,
    get_category_by_name,
    update_category,
)
from app.models.category import Category, CategoryCreate, CategoryUpdate
from app.models.enums import StatusEnum

# ── Helpers ──────────────────────────────────────────────────────────


def _seed(
    session: Session, name: str, description: str = "Desc", status: StatusEnum = StatusEnum.Active
) -> Category:
    category = Category(category_name=name, description=description, status=status)
    session.add(category)
    session.commit()
    session.refresh(category)
    return category


# ── Create ───────────────────────────────────────────────────────────


def test_create_category_assigns_id(session: Session):
    category_in = CategoryCreate(category_name="Electrónica", description="Gadgets y más")

    result = create_category(session, category_in=category_in)

    assert result.id_category is not None
    assert result.category_name == "Electrónica"
    assert result.description == "Gadgets y más"
    assert result.status == StatusEnum.Active


def test_create_category_default_status_is_active(session: Session):
    category_in = CategoryCreate(category_name="Hogar")

    result = create_category(session, category_in=category_in)

    assert result.status == StatusEnum.Active


def test_create_category_inactive_status(session: Session):
    category_in = CategoryCreate(category_name="Archivada", status=StatusEnum.Inactive)

    result = create_category(session, category_in=category_in)

    assert result.status == StatusEnum.Inactive


# ── Read ─────────────────────────────────────────────────────────────


def test_get_categories_returns_all(session: Session):
    _seed(session, "Electrónica")
    _seed(session, "Hogar")

    results = get_categories(session)

    assert len(results) == 2
    names = {c.category_name for c in results}
    assert names == {"Electrónica", "Hogar"}


def test_get_categories_empty_db(session: Session):
    results = get_categories(session)

    assert results == []


def test_get_categories_pagination_skip(session: Session):
    _seed(session, "A")
    _seed(session, "B")
    _seed(session, "C")

    results = get_categories(session, skip=2, limit=100)

    assert len(results) == 1


def test_get_categories_pagination_limit(session: Session):
    _seed(session, "A")
    _seed(session, "B")
    _seed(session, "C")

    results = get_categories(session, skip=0, limit=2)

    assert len(results) == 2


def test_get_category_by_id_found(session: Session):
    seeded = _seed(session, "Electrónica")

    result = get_category_by_id(session, category_id=seeded.id_category)

    assert result is not None
    assert result.id_category == seeded.id_category
    assert result.category_name == "Electrónica"


def test_get_category_by_id_not_found(session: Session):
    result = get_category_by_id(session, category_id=999999)

    assert result is None


def test_get_category_by_name_found(session: Session):
    _seed(session, "Deportes")

    result = get_category_by_name(session, category_name="Deportes")

    assert result is not None
    assert result.category_name == "Deportes"


def test_get_category_by_name_not_found(session: Session):
    result = get_category_by_name(session, category_name="Inexistente")

    assert result is None


def test_get_category_by_name_case_sensitive(session: Session):
    _seed(session, "Deportes")

    result = get_category_by_name(session, category_name="deportes")

    # El campo es case-sensitive por defecto en SQLite y PostgreSQL
    assert result is None


# ── Update ───────────────────────────────────────────────────────────


def test_update_category_changes_description(session: Session):
    seeded = _seed(session, "Electrónica", description="Original")
    update_in = CategoryUpdate(description="Actualizada")

    result = update_category(session, category_id=seeded.id_category, category_in=update_in)

    assert result is not None
    assert result.description == "Actualizada"
    assert result.category_name == "Electrónica"  # campo no enviado queda intacto


def test_update_category_changes_name(session: Session):
    seeded = _seed(session, "Nombre viejo")
    update_in = CategoryUpdate(category_name="Nombre nuevo")

    result = update_category(session, category_id=seeded.id_category, category_in=update_in)

    assert result is not None
    assert result.category_name == "Nombre nuevo"


def test_update_category_changes_status(session: Session):
    seeded = _seed(session, "Activa", status=StatusEnum.Active)
    update_in = CategoryUpdate(status=StatusEnum.Inactive)

    result = update_category(session, category_id=seeded.id_category, category_in=update_in)

    assert result is not None
    assert result.status == StatusEnum.Inactive


def test_update_category_exclude_unset_leaves_other_fields(session: Session):
    seeded = _seed(session, "Música", description="Instrumentos", status=StatusEnum.Active)
    update_in = CategoryUpdate(description="Solo música")

    result = update_category(session, category_id=seeded.id_category, category_in=update_in)

    assert result is not None
    assert result.category_name == "Música"  # intacto
    assert result.status == StatusEnum.Active  # intacto
    assert result.description == "Solo música"  # actualizado


def test_update_category_not_found_returns_none(session: Session):
    update_in = CategoryUpdate(description="X")

    result = update_category(session, category_id=999999, category_in=update_in)

    assert result is None


# ── Delete ───────────────────────────────────────────────────────────


def test_delete_category_returns_deleted_record(session: Session):
    seeded = _seed(session, "Efímera")

    result = delete_category(session, category_id=seeded.id_category)

    assert result is not None
    assert result.id_category == seeded.id_category
    assert result.category_name == "Efímera"


def test_delete_category_removes_from_db(session: Session):
    seeded = _seed(session, "Transitoria")

    delete_category(session, category_id=seeded.id_category)
    after = get_category_by_id(session, category_id=seeded.id_category)

    assert after is None


def test_delete_category_not_found_returns_none(session: Session):
    result = delete_category(session, category_id=999999)

    assert result is None
