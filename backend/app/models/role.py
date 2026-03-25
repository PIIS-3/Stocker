from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Relationship

from .enums import StatusEnum, RoleEnum

if TYPE_CHECKING:
    from .employee import Employee


class RoleBase(SQLModel):
    role_name: RoleEnum = Field(unique=True)
    status: StatusEnum = Field(default=StatusEnum.Active)


class Role(RoleBase, table=True):
    id_role: Optional[int] = Field(default=None, primary_key=True)
    created_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))

    employees: List["Employee"] = Relationship(back_populates="role")
