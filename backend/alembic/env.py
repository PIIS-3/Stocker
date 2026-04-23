from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# Objeto de configuración de Alembic — proporciona acceso a los
# valores del archivo .ini que se está utilizando.
config = context.config

# Configurar los loggers de Python usando el archivo .ini.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

import os
import sys

# Añadir el directorio raíz del backend al path de Python para que
# Alembic pueda importar el paquete 'app' y sus modelos correctamente.
sys.path.insert(0, os.path.realpath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.config import settings
from sqlmodel import SQLModel
import app.models  # noqa: F401
# Importación necesaria para que SQLModel registre los modelos en metadata

# Metadata de los modelos — Alembic la usa para detectar cambios
# en el esquema y generar migraciones automáticas (autogenerate).
target_metadata = SQLModel.metadata

# Sobreescribimos la URL de conexión del .ini con la que viene de
# las variables de entorno (settings), para que sea consistente con
# la configuración del docker-compose o del .env local.
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)


def run_migrations_offline() -> None:
    """Ejecutar migraciones en modo 'offline'.

    Configura el contexto solo con la URL, sin crear un motor.
    Útil para generar scripts SQL sin conexión a la base de datos.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Ejecutar migraciones en modo 'online'.

    Crea un motor de base de datos y ejecuta las migraciones
    directamente contra la base de datos conectada.
    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
