from sqlmodel import Session

from app.models.store import Store, StoreCreate, StoreUpdate
from app.models.enums import StatusEnum
from app.crud.stores import (
    get_stores,
    get_store_by_id,
    get_store_by_name,
    create_store,
    update_store,
    delete_store,
)


# ── Helpers ──────────────────────────────────────────────────────────

def _seed(
    session: Session,
    name: str,
    address: str = "Calle Mayor 1",
    status: StatusEnum = StatusEnum.Active,
) -> Store:
    store = Store(store_name=name, address=address, status=status)
    session.add(store)
    session.commit()
    session.refresh(store)
    return store


# ── Create ───────────────────────────────────────────────────────────

def test_create_store_assigns_id(session: Session):
    store_in = StoreCreate(store_name="Tienda Central", address="Gran Vía 10")

    result = create_store(session, store_in=store_in)

    assert result.id_store is not None
    assert result.store_name == "Tienda Central"
    assert result.address == "Gran Vía 10"
    assert result.status == StatusEnum.Active


def test_create_store_default_status_is_active(session: Session):
    store_in = StoreCreate(store_name="Tienda Norte", address="Calle Norte 5")

    result = create_store(session, store_in=store_in)

    assert result.status == StatusEnum.Active


def test_create_store_inactive_status(session: Session):
    store_in = StoreCreate(
        store_name="Tienda Cerrada", address="Calle Sur 3", status=StatusEnum.Inactive
    )

    result = create_store(session, store_in=store_in)

    assert result.status == StatusEnum.Inactive


# ── Read ─────────────────────────────────────────────────────────────

def test_get_stores_returns_all(session: Session):
    _seed(session, "Tienda A")
    _seed(session, "Tienda B")

    results = get_stores(session)

    assert len(results) == 2
    names = {s.store_name for s in results}
    assert names == {"Tienda A", "Tienda B"}


def test_get_stores_empty_db(session: Session):
    results = get_stores(session)

    assert results == []


def test_get_stores_pagination_skip(session: Session):
    _seed(session, "A")
    _seed(session, "B")
    _seed(session, "C")

    results = get_stores(session, skip=2, limit=100)

    assert len(results) == 1


def test_get_stores_pagination_limit(session: Session):
    _seed(session, "A")
    _seed(session, "B")
    _seed(session, "C")

    results = get_stores(session, skip=0, limit=2)

    assert len(results) == 2


def test_get_store_by_id_found(session: Session):
    seeded = _seed(session, "Tienda Central", address="Gran Vía 10")

    result = get_store_by_id(session, store_id=seeded.id_store)

    assert result is not None
    assert result.id_store == seeded.id_store
    assert result.store_name == "Tienda Central"


def test_get_store_by_id_not_found(session: Session):
    result = get_store_by_id(session, store_id=999999)

    assert result is None


def test_get_store_by_name_found(session: Session):
    _seed(session, "TiendaExpress")

    result = get_store_by_name(session, store_name="TiendaExpress")

    assert result is not None
    assert result.store_name == "TiendaExpress"


def test_get_store_by_name_not_found(session: Session):
    result = get_store_by_name(session, store_name="Inexistente")

    assert result is None


def test_get_store_by_name_case_sensitive(session: Session):
    _seed(session, "TiendaExpress")

    result = get_store_by_name(session, store_name="tiendaexpress")

    assert result is None


# ── Update ───────────────────────────────────────────────────────────

def test_update_store_changes_address(session: Session):
    seeded = _seed(session, "Tienda Central", address="Calle Vieja 1")
    update_in = StoreUpdate(address="Calle Nueva 99")

    result = update_store(session, store_id=seeded.id_store, store_in=update_in)

    assert result is not None
    assert result.address == "Calle Nueva 99"
    assert result.store_name == "Tienda Central"  # campo no enviado queda intacto


def test_update_store_changes_name(session: Session):
    seeded = _seed(session, "Nombre viejo")
    update_in = StoreUpdate(store_name="Nombre nuevo")

    result = update_store(session, store_id=seeded.id_store, store_in=update_in)

    assert result is not None
    assert result.store_name == "Nombre nuevo"


def test_update_store_changes_status(session: Session):
    seeded = _seed(session, "Activa", status=StatusEnum.Active)
    update_in = StoreUpdate(status=StatusEnum.Inactive)

    result = update_store(session, store_id=seeded.id_store, store_in=update_in)

    assert result is not None
    assert result.status == StatusEnum.Inactive


def test_update_store_exclude_unset_leaves_other_fields(session: Session):
    seeded = _seed(session, "TiendaMixta", address="Calle Original 1", status=StatusEnum.Active)
    update_in = StoreUpdate(address="Calle Actualizada 2")

    result = update_store(session, store_id=seeded.id_store, store_in=update_in)

    assert result is not None
    assert result.store_name == "TiendaMixta"         # intacto
    assert result.status == StatusEnum.Active           # intacto
    assert result.address == "Calle Actualizada 2"     # actualizado


def test_update_store_not_found_returns_none(session: Session):
    update_in = StoreUpdate(address="X")

    result = update_store(session, store_id=999999, store_in=update_in)

    assert result is None


# ── Delete ───────────────────────────────────────────────────────────

def test_delete_store_returns_deleted_record(session: Session):
    seeded = _seed(session, "Efimera", address="Calle Sin Futuro 0")

    result = delete_store(session, store_id=seeded.id_store)

    assert result is not None
    assert result.id_store == seeded.id_store
    assert result.store_name == "Efimera"


def test_delete_store_removes_from_db(session: Session):
    seeded = _seed(session, "Transitoria")

    delete_store(session, store_id=seeded.id_store)
    after = get_store_by_id(session, store_id=seeded.id_store)

    assert after is None


def test_delete_store_not_found_returns_none(session: Session):
    result = delete_store(session, store_id=999999)

    assert result is None
