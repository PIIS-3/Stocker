from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Relationship

from .enums import StatusEnum

if TYPE_CHECKING:
    from .employee import Employee


class StoreBase(SQLModel):
    store_name: str = Field(unique=True, index=True)
    address: Optional[str] = None
    status: StatusEnum = Field(default=StatusEnum.Active)


class Store(StoreBase, table=True):
    id_store: Optional[int] = Field(default=None, primary_key=True)
    created_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))

    employees: List["Employee"] = Relationship(back_populates="store")
