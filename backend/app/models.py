from typing import Optional, List
from datetime import datetime, timezone
from enum import Enum as PyEnum
from sqlmodel import SQLModel, Field, Relationship

# --- ENUMS ---
class StatusEnum(str, PyEnum):
    Active = "Active"
    Inactive = "Inactive"

class RoleRoleEnum(str, PyEnum):
    SuperAdmin = "SuperAdmin"
    Manager = "Manager"
    Staff = "Staff"

# --- CATEGORY ---
class CategoryBase(SQLModel):
    category_name: str = Field(unique=True, index=True)
    description: Optional[str] = None
    status: StatusEnum = Field(default=StatusEnum.Active)

class Category(CategoryBase, table=True):
    id_category: Optional[int] = Field(default=None, primary_key=True)
    created_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))

    products: List["ProductTemplate"] = Relationship(back_populates="category")

# --- PRODUCT TEMPLATE ---
class ProductTemplateBase(SQLModel):
    sku: str = Field(unique=True, index=True)
    product_name: str
    brand: Optional[str] = None
    fixed_selling_price: float
    status: StatusEnum = Field(default=StatusEnum.Active)
    category_id: int = Field(foreign_key="category.id_category")

class ProductTemplate(ProductTemplateBase, table=True):
    __tablename__ = "product_template"
    id_product: Optional[int] = Field(default=None, primary_key=True)
    created_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))

    category: Optional[Category] = Relationship(back_populates="products")

class ProductTemplateResponse(ProductTemplateBase):
    id_product: int
    created_at: Optional[datetime] = None
    category: Optional[CategoryBase] = None

# --- STORE ---
class StoreBase(SQLModel):
    store_name: str = Field(unique=True, index=True)
    address: Optional[str] = None
    status: StatusEnum = Field(default=StatusEnum.Active)

class Store(StoreBase, table=True):
    id_store: Optional[int] = Field(default=None, primary_key=True)
    created_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))

    employees: List["Employee"] = Relationship(back_populates="store")

# --- ROLE ---
class RoleBase(SQLModel):
    role_name: RoleRoleEnum = Field(unique=True)
    status: StatusEnum = Field(default=StatusEnum.Active)

class Role(RoleBase, table=True):
    id_role: Optional[int] = Field(default=None, primary_key=True)
    created_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))

    employees: List["Employee"] = Relationship(back_populates="role")

# --- EMPLOYEE ---
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

    role: Optional[Role] = Relationship(back_populates="employees")
    store: Optional[Store] = Relationship(back_populates="employees")

class EmployeeResponse(EmployeeBase):
    id_employee: int
    created_at: datetime
    role: Optional[RoleBase] = None
    store: Optional[StoreBase] = None
