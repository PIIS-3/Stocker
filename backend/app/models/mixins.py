from typing import Optional
from datetime import datetime
import sqlalchemy as sa
from sqlmodel import SQLModel, Field


# ── TimestampMixin ────────────────────────────────────────────────────
# Añade created_at y updated_at a cualquier modelo ORM con tabla.
# Los genera PostgreSQL directamente — Python nunca los calcula.
#   - created_at → PostgreSQL/SQLite pone CURRENT_TIMESTAMP al hacer el INSERT.
#   - updated_at → PostgreSQL/SQLite pone CURRENT_TIMESTAMP al INSERT y el trigger
#     (database.py → ensure_db_objects) lo actualiza en cada UPDATE.
#
# ¿Por qué sa_column_kwargs y no sa_column=Column(...)?
#   SQLAlchemy no permite que dos tablas compartan el mismo objeto Column.
#   sa_column_kwargs pasa los parámetros como diccionario y SQLModel
#   crea un Column nuevo e independiente por cada tabla que hereda el mixin.
#
# Parámetros de sa_column_kwargs:
#   server_default=sa.text("CURRENT_TIMESTAMP")
#       Le dice al motor DB que use CURRENT_TIMESTAMP como valor por defecto
#       cuando el campo no se envía explícitamente. sa.text() es necesario
#       para que SQLAlchemy lo trate como SQL crudo.
#   nullable=True
#       La columna acepta NULL en la BD. El objeto Python tendrá None
#       hasta que el db.refresh() traiga el valor asignado por PostgreSQL.
class TimestampMixin(SQLModel):
    created_at: Optional[datetime] = Field(
        default=None,
        sa_column_kwargs={"server_default": sa.text("CURRENT_TIMESTAMP"), "nullable": True},
    )
    updated_at: Optional[datetime] = Field(
        default=None,
        sa_column_kwargs={"server_default": sa.text("CURRENT_TIMESTAMP"), "nullable": True},
    )




