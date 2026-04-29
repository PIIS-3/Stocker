"""
roles.py — Datos de prueba y lógica de seed para Roles.
"""
from __future__ import annotations

from typing import Any, Dict, List

from sqlmodel import Session

from .. import models
from ._base import SeedReport, upsert_by_field


# ── Datos de prueba ───────────────────────────────────────────────────────────

ROLES_SEED: List[Dict[str, Any]] = [
    {
        "role_name": models.RoleEnum.SuperAdmin,
        "status": models.StatusEnum.Active,
    },
    {
        "role_name": models.RoleEnum.Manager,
        "status": models.StatusEnum.Active,
    },
    {
        "role_name": models.RoleEnum.Staff,
        "status": models.StatusEnum.Active,
    },
]


# ── Lógica de seed ────────────────────────────────────────────────────────────

def seed_roles(session: Session, report: SeedReport) -> dict[models.RoleEnum, models.Role]:
    """Inserta o actualiza los roles semilla y devuelve un mapa por nombre."""
    roles_by_name: dict[models.RoleEnum, models.Role] = {}

    for data in ROLES_SEED:
        role, created = upsert_by_field(
            session,
            models.Role,
            lookup_field="role_name",
            lookup_value=data["role_name"],
            data=data,
        )
        roles_by_name[data["role_name"]] = role
        report.register("Roles", created=created)

    return roles_by_name
