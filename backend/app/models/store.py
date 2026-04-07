from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Relationship
from pydantic import field_validator

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


# ── Schemas de API ───────────────────────────────────────────────────

class StoreCreate(SQLModel):
    """Schema de entrada para crear una tienda (POST)."""
    store_name: str = Field(min_length=1, max_length=100)
    address: Optional[str] = Field(default=None, max_length=255)
    status: StatusEnum = Field(default=StatusEnum.Active)

    @field_validator("store_name")
    @classmethod
    def store_name_not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("store_name no puede estar vacío o contener solo espacios")
        return v.strip()


class StoreUpdate(SQLModel):
    """Schema de entrada para actualizar una tienda (PUT). Todos los campos son opcionales."""
    store_name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    address: Optional[str] = Field(default=None, max_length=255)
    status: Optional[StatusEnum] = None

    @field_validator("store_name")
    @classmethod
    def store_name_not_blank(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            raise ValueError("store_name no puede estar vacío o contener solo espacios")
        return v.strip() if v else v


class StoreResponse(SQLModel):
    """Schema de salida para devolver datos de una tienda (GET)."""
    id_store: int
    store_name: str
    address: Optional[str] = None
    status: StatusEnum
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
