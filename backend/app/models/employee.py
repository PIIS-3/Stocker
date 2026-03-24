from typing import Optional, TYPE_CHECKING
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Relationship
from .enums import StatusEnum

if TYPE_CHECKING:
    from .role import Role, RoleBase
    from .store import Store, StoreBase

class EmployeeBase(SQLModel):
    first_name: str
    last_name: str
    username: str = Field(unique=True, index=True)
    status: StatusEnum = Field(default=StatusEnum.Active)
    role_id: int = Field(foreign_key="role.id_role")
    store_id: int = Field(foreign_key="store.id_store")

class EmployeeCreate(EmployeeBase):
    password: str

class Employee(EmployeeBase, table=True):
    id_employee: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str
    created_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))

    role: Optional["Role"] = Relationship(back_populates="employees")
    store: Optional["Store"] = Relationship(back_populates="employees")

class EmployeeResponse(EmployeeBase):
    id_employee: int
    created_at: datetime
    role: Optional["RoleBase"] = None
    store: Optional["StoreBase"] = None
