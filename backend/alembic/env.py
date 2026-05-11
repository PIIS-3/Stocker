# ── Alembic Environment ──────────────────────────────────────────────
# Este script configura el contexto de ejecución de las migraciones.

import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from sqlmodel import SQLModel

from alembic import context

# Añadir el directorio raíz al path de Python para importar 'app'
sys.path.insert(0, os.path.realpath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.config import settings

# Configuración de Alembic
config = context.config

# Interpretar el archivo de configuración para el logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# URL de la base de datos (prioridad a la variable de entorno del proyecto)
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

# Metadata de los modelos para autogenerate
target_metadata = SQLModel.metadata


def run_migrations_offline() -> None:
    """Ejecutar migraciones en modo 'offline' (genera SQL crudo)."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,  # Detectar cambios en tipos de columnas
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Ejecutar migraciones en modo 'online' (contra la BD real)."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,  # Detectar cambios en tipos de columnas (ej. VARCHAR(50) -> (100))
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
