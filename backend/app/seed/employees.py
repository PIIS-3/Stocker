"""
employees.py — Datos de prueba y lógica de seed para Empleados.
"""
from __future__ import annotations

from typing import Any, Dict, List

from sqlmodel import Session

from .. import models
from ._base import SeedReport, upsert_by_field


# ── Datos de prueba ───────────────────────────────────────────────────────────

EMPLOYEES_SEED: List[Dict[str, Any]] = [
    {
        "first_name": "Carlos",
        "last_name": "García López",
        "username": "carlos.garcia",
        "hashed_password": "$2b$12$xK7q3mN8vZ9pL2wR5tQ1u.encrypted",  # Dummy hash
        "role_id": 1,  # SuperAdmin (asume que rol 1 existe)
        "store_name": "Almacén Central Madrid",
        "status": models.StatusEnum.Active,
    },
    {
        "first_name": "María",
        "last_name": "López Martínez",
        "username": "maria.lopez",
        "hashed_password": "$2b$12$xK7q3mN8vZ9pL2wR5tQ1u.encrypted",
        "role_id": 2,  # Manager
        "store_name": "Centro Distribución Barcelona",
        "status": models.StatusEnum.Active,
    },
    {
        "first_name": "Juan",
        "last_name": "Martín Rodríguez",
        "username": "juan.martin",
        "hashed_password": "$2b$12$xK7q3mN8vZ9pL2wR5tQ1u.encrypted",
        "role_id": 2,  # Manager
        "store_name": "Almacén Valencia",
        "status": models.StatusEnum.Active,
    },
    {
        "first_name": "Ana",
        "last_name": "Rodríguez Fernández",
        "username": "ana.rodriguez",
        "hashed_password": "$2b$12$xK7q3mN8vZ9pL2wR5tQ1u.encrypted",
        "role_id": 3,  # Staff
        "store_name": "Almacén Central Madrid",
        "status": models.StatusEnum.Active,
    },
    {
        "first_name": "Pedro",
        "last_name": "Sánchez García",
        "username": "pedro.sanchez",
        "hashed_password": "$2b$12$xK7q3mN8vZ9pL2wR5tQ1u.encrypted",
        "role_id": 3,  # Staff
        "store_name": "Centro Distribución Barcelona",
        "status": models.StatusEnum.Active,
    },
    {
        "first_name": "Laura",
        "last_name": "Fernández Moreno",
        "username": "laura.fernandez",
        "hashed_password": "$2b$12$xK7q3mN8vZ9pL2wR5tQ1u.encrypted",
        "role_id": 3,  # Staff
        "store_name": "Delegación Sevilla",
        "status": models.StatusEnum.Active,
    },
    {
        "first_name": "David",
        "last_name": "González Díaz",
        "username": "david.gonzalez",
        "hashed_password": "$2b$12$xK7q3mN8vZ9pL2wR5tQ1u.encrypted",
        "role_id": 3,  # Staff
        "store_name": "Sucursal Bilbao",
        "status": models.StatusEnum.Active,
    },
    {
        "first_name": "Isabel",
        "last_name": "Jiménez López",
        "username": "isabel.jimenez",
        "hashed_password": "$2b$12$xK7q3mN8vZ9pL2wR5tQ1u.encrypted",
        "role_id": 3,  # Staff
        "store_name": "Almacén Zaragoza",
        "status": models.StatusEnum.Active,
    },
]


# ── Lógica de seed ────────────────────────────────────────────────────────────

def seed_employees(
    session: Session,
    report: SeedReport,
    stores_by_name: dict[str, models.Store],
) -> None:
    """Inserta o actualiza los empleados semilla.

    Args:
        stores_by_name:  Mapa {store_name → Store} devuelto por seed_stores().
                        Los role_id se especifican directamente en los datos.
    """
    for data in EMPLOYEES_SEED:
        store_name = data.pop("store_name")

        store = stores_by_name.get(store_name)
        if store is None:
            raise ValueError(
                f"Tienda '{store_name}' no encontrada para el empleado "
                f"'{data['username']}'. Asegúrate de ejecutar seed_stores primero."
            )

        _, created = upsert_by_field(
            session,
            models.Employee,
            lookup_field="username",
            lookup_value=data["username"],
            data={**data, "store_id": store.id_store},
        )
        report.register("Empleados", created=created)
