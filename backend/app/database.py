import os

from sqlalchemy import text
from sqlmodel import Session, create_engine

from .core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    # Imprime las sentencias SQL en consola. Activar con SQL_ECHO=true.
    echo=os.getenv("SQL_ECHO", "false").lower() == "true",
    # Verifica la conexión antes de reutilizarla para evitar errores por timeout.
    pool_pre_ping=True,
)


def get_db():
    """Genera una sesión de BD por petición HTTP. Se cierra al terminar."""
    with Session(engine) as session:
        yield session


def ensure_db_objects() -> None:
    """Crea los triggers de updated_at si no existen. Seguro de llamar en cada arranque."""
    # SQLModel solo crea tablas e índices automáticamente.
    # Los triggers de PostgreSQL hay que crearlos aparte.
    # PostgreSQL no tiene ON UPDATE CURRENT_TIMESTAMP (eso es MySQL);
    # el trigger BEFORE UPDATE es el equivalente nativo en Postgres.
    _TABLES = ("store", "product_template", "employee", "category", "role")

    with Session(engine) as session:
        # Función PL/pgSQL compartida — SET updated_at = NOW() en cada UPDATE.
        session.exec(
            text("""
            CREATE OR REPLACE FUNCTION set_updated_at()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = NOW();
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        """)
        )

        # Postgres no soporta CREATE TRIGGER IF NOT EXISTS,
        # se comprueba en pg_trigger antes de crear.
        for table in _TABLES:
            session.exec(
                text(f"""
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM pg_trigger
                        WHERE tgname = 'trg_{table}_updated_at'
                        AND tgrelid = '{table}'::regclass
                    ) THEN
                        CREATE TRIGGER trg_{table}_updated_at
                            BEFORE UPDATE ON {table}
                            FOR EACH ROW EXECUTE FUNCTION set_updated_at();
                    END IF;
                END;
                $$;
            """)
            )

        session.commit()
