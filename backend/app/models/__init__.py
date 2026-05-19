# Re-exportación centralizada de todos los modelos.
# Permite que el resto de la aplicación importe desde 'app.models'
# directamente (ej: from app.models import Category) sin necesidad
# de conocer la estructura interna del paquete.

# ── Enums ────────────────────────────────────────────────────────────
# ── Categoría ────────────────────────────────────────────────────────
from .category import Category, CategoryBase, CategoryCreate, CategoryResponse, CategoryUpdate

# ── Empleado ─────────────────────────────────────────────────────────
from .employee import Employee, EmployeeBase, EmployeeCreate, EmployeeResponse, EmployeeUpdate
from .enums import RoleEnum, SaleStatusEnum, StatusEnum

# ── Mixins ───────────────────────────────────────────────────────────
from .mixins import TimestampMixin

# ── Producto ─────────────────────────────────────────────────────────
from .product import (
    ProductTemplate,
    ProductTemplateBase,
    ProductTemplateCreate,
    ProductTemplateResponse,
    ProductTemplateUpdate,
)

# ── Rol ──────────────────────────────────────────────────────────────
from .role import Role, RoleBase, RoleResponse

# ── Venta ────────────────────────────────────────────────────────────
from .sale import Sale, SaleBase, SaleCreate, SaleResponse, SaleUpdate

# ── Línea de venta ───────────────────────────────────────────────────
from .sale_item import SaleItem, SaleItemBase, SaleItemCreate, SaleItemResponse, SaleItemUpdate

# ── Stock ────────────────────────────────────────────────────────────
from .stock import Stock, StockBase, StockCreate, StockResponse, StockUpdate

# ── Tienda ───────────────────────────────────────────────────────────
from .store import Store, StoreBase, StoreCreate, StoreResponse, StoreUpdate

# ── Auth / Token ─────────────────────────────────────────────────────
from .token import Token, TokenData

__all__ = [
    # Enums
    "StatusEnum",
    "RoleEnum",
    "SaleStatusEnum",
    # Mixins
    "TimestampMixin",
    # Categoría
    "CategoryBase",
    "CategoryCreate",
    "CategoryUpdate",
    "Category",
    "CategoryResponse",
    # Producto
    "ProductTemplateBase",
    "ProductTemplateCreate",
    "ProductTemplateUpdate",
    "ProductTemplate",
    "ProductTemplateResponse",
    # Tienda
    "StoreBase",
    "StoreCreate",
    "StoreUpdate",
    "Store",
    "StoreResponse",
    # Rol
    "RoleBase",
    "Role",
    "RoleResponse",
    # Empleado
    "EmployeeBase",
    "EmployeeCreate",
    "EmployeeUpdate",
    "Employee",
    "EmployeeResponse",
    # Stock
    "StockBase",
    "StockCreate",
    "StockUpdate",
    "Stock",
    "StockResponse",
    # Venta
    "SaleBase",
    "SaleCreate",
    "SaleUpdate",
    "Sale",
    "SaleResponse",
    # Línea de venta
    "SaleItemBase",
    "SaleItemCreate",
    "SaleItemUpdate",
    "SaleItem",
    "SaleItemResponse",
    # Token
    "Token",
    "TokenData",
]
