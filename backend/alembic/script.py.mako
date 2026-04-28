"""
${message}

Revision ID: ${up_revision}
Revises: ${down_revision | comma,n}
Create Date: ${create_date}

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
import sqlmodel # Importante para tipos de datos personalizados de SQLModel
${imports if imports else ""}

# Identificadores de revisión
revision: str = ${repr(up_revision)}
down_revision: Union[str, Sequence[str], None] = ${repr(down_revision)}
branch_labels: Union[str, Sequence[str], None] = ${repr(branch_labels)}
depends_on: Union[str, Sequence[str], None] = ${repr(depends_on)}


def upgrade() -> None:
    """Aplicar cambios en el esquema."""
    ${upgrades if upgrades else "pass"}


def downgrade() -> None:
    """Revertir cambios en el esquema."""
    ${downgrades if downgrades else "pass"}
