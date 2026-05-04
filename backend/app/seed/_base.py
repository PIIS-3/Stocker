"""
_base.py — Utilidades compartidas para todos los módulos de seed.

Proporciona:
- SeedReport: acumulador de contadores creados/actualizados por entidad.
- upsert_by_field: helper genérico que evita duplicar la lógica de upsert
en cada módulo de seed.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from sqlmodel import Session, SQLModel, select

# ── SeedReport ────────────────────────────────────────────────────────────────


@dataclass
class EntityReport:
    """Contador de operaciones para una entidad concreta."""

    created: int = 0
    updated: int = 0

    @property
    def total(self) -> int:
        return self.created + self.updated


@dataclass
class SeedReport:
    """Informe global del seed. Cada módulo añade sus propios contadores."""

    _entities: dict[str, EntityReport] = field(default_factory=dict)

    def register(self, entity: str, *, created: bool) -> None:
        """Registra una operación create o update para la entidad indicada."""
        if entity not in self._entities:
            self._entities[entity] = EntityReport()
        if created:
            self._entities[entity].created += 1
        else:
            self._entities[entity].updated += 1

    def print_summary(self) -> None:
        """Imprime un resumen por consola al estilo del seed original."""
        print("\n── Seed completado correctamente ──")
        for entity, counts in self._entities.items():
            print(
                f"  {entity}: {counts.created} creados, "
                f"{counts.updated} actualizados  (total {counts.total})"
            )
        print()


# ── upsert_by_field ───────────────────────────────────────────────────────────


def upsert_by_field(
    session: Session,
    model_cls: type[SQLModel],
    lookup_field: str,
    lookup_value: Any,
    data: dict[str, Any],
) -> tuple[SQLModel, bool]:
    """Inserta o actualiza un registro identificado por `lookup_field`.

    Args:
        session:       Sesión SQLModel activa (sin commit).
        model_cls:     Clase ORM (ej: Store, Category).
        lookup_field:  Nombre del campo único para buscar el registro existente.
        lookup_value:  Valor del campo de búsqueda.
        data:          Diccionario con todos los campos a establecer/actualizar.

    Returns:
        (instancia, True)  si fue creada.
        (instancia, False) si fue actualizada.
    """
    # Búsqueda por el campo único proporcionado.
    column = getattr(model_cls, lookup_field)
    existing: SQLModel | None = session.exec(
        select(model_cls).where(column == lookup_value)
    ).first()

    if existing:
        # Actualización parcial: aplica solo los campos del dict.
        for key, value in data.items():
            setattr(existing, key, value)
        session.add(existing)
        return existing, False

    # Creación: pasa el dict como kwargs al constructor del modelo.
    instance = model_cls(**data)
    session.add(instance)
    session.flush()  # Obtiene el PK asignado por la BD sin hacer commit.
    return instance, True
