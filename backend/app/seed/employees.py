"""
employees.py — Datos de prueba y lógica de seed para Empleados.
"""
from __future__ import annotations

from typing import Any, Dict, List

from sqlmodel import Session

from .. import models
from ..core import security
from ._base import SeedReport, upsert_by_field


# ── Datos de prueba ───────────────────────────────────────────────────────────

# Todos los usuarios tendrán 'stocker123' como contraseña por defecto para desarrollo.
DEFAULT_PASSWORD = "stocker123"

EMPLOYEES_SEED: List[Dict[str, Any]] = [
    {
        "first_name": "Carlos",
        "last_name": "García López",
        "username": "carlos.garcia",
        "role_name": models.RoleEnum.SuperAdmin,
        "store_name": "Almacén Central Madrid",
        "status": models.StatusEnum.Active,
    },
    {
        "first_name": "María",
        "last_name": "López Martínez",
        "username": "maria.lopez",
        "role_name": models.RoleEnum.Manager,
        "store_name": "Centro Distribución Barcelona",
        "status": models.StatusEnum.Active,
    },
    {
        "first_name": "Juan",
        "last_name": "Martín Rodríguez",
        "username": "juan.martin",
        "role_name": models.RoleEnum.Manager,
        "store_name": "Almacén Valencia",
        "status": models.StatusEnum.Active,
    },
    {
        "first_name": "Ana",
        "last_name": "Rodríguez Fernández",
        "username": "ana.rodriguez",
        "role_name": models.RoleEnum.Staff,
        "store_name": "Almacén Central Madrid",
        "status": models.StatusEnum.Active,
    },
    {
        "first_name": "Pedro",
        "last_name": "Sánchez García",
        "username": "pedro.sanchez",
        "role_name": models.RoleEnum.Staff,
        "store_name": "Centro Distribución Barcelona",
        "status": models.StatusEnum.Active,
    },
    {
        "first_name": "Laura",
        "last_name": "Fernández Moreno",
        "username": "laura.fernandez",
        "role_name": models.RoleEnum.Staff,
        "store_name": "Delegación Sevilla",
        "status": models.StatusEnum.Active,
    },
    {
        "first_name": "David",
        "last_name": "González Díaz",
        "username": "david.gonzalez",
        "role_name": models.RoleEnum.Staff,
        "store_name": "Sucursal Bilbao",
        "status": models.StatusEnum.Active,
    },
    {
        "first_name": "Isabel",
        "last_name": "Jiménez López",
        "username": "isabel.jimenez",
        "role_name": models.RoleEnum.Staff,
        "store_name": "Almacén Zaragoza",
        "status": models.StatusEnum.Active,
    },
]


# ── Lógica de seed ────────────────────────────────────────────────────────────

def seed_employees(
    session: Session,
    report: SeedReport,
    stores_by_name: dict[str, models.Store],
    roles_by_name: dict[models.RoleEnum, models.Role],
) -> None:
    """Inserta o actualiza los empleados semilla.

    Args:
        stores_by_name:  Mapa {store_name → Store} devuelto por seed_stores().
        roles_by_name:   Mapa {role_name → Role} devuelto por seed_roles().
    """
    hashed_password = security.get_password_hash(DEFAULT_PASSWORD)

    for data in EMPLOYEES_SEED:
        store_name = data.pop("store_name")
        role_name = data.pop("role_name")

        store = stores_by_name.get(store_name)
        if store is None:
            raise ValueError(
                f"Tienda '{store_name}' no encontrada para el empleado '{data['username']}'."
            )

        role = roles_by_name.get(role_name)
        if role is None:
            raise ValueError(
                f"Rol '{role_name}' no encontrado para el empleado '{data['username']}'."
            )

        _, created = upsert_by_field(
            session,
            models.Employee,
            lookup_field="username",
            lookup_value=data["username"],
            data={
                **data,
                "store_id": store.id_store,
                "role_id": role.id_role,
                "hashed_password": hashed_password
            },
        )
        report.register("Empleados", created=created)
