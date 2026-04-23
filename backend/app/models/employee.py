from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship

from .enums import StatusEnum
from .role import Role, RoleBase
from .store import Store, StoreBase
from .mixins import TimestampMixin


class EmployeeBase(SQLModel):
    first_name: str
    last_name: str
    username: str = Field(unique=True, index=True)
    status: StatusEnum = Field(default=StatusEnum.Active)
    role_id: int = Field(foreign_key="role.id_role")
    store_id: int = Field(foreign_key="store.id_store")


class EmployeeCreate(EmployeeBase):
    password: str


# Hereda TimestampMixin para created_at y updated_at centralizados.
class Employee(TimestampMixin, EmployeeBase, table=True):
    id_employee: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str

    role: Optional[Role] = Relationship(back_populates="employees")
    store: Optional[Store] = Relationship(back_populates="employees")


class EmployeeResponse(EmployeeBase):
    id_employee: int
    created_at: datetime
    role: Optional[RoleBase] = None
    store: Optional[StoreBase] = None
