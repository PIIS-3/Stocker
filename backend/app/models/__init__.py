# Re-exportación centralizada de todos los modelos.
# Permite que el resto de la aplicación importe desde 'app.models'
# directamente (ej: from app.models import Category) sin necesidad
# de conocer la estructura interna del paquete.

# ── Enums ────────────────────────────────────────────────────────────
from .enums import StatusEnum, RoleEnum

# ── Mixins ───────────────────────────────────────────────────────────
from .mixins import TimestampMixin

# ── Categoría ────────────────────────────────────────────────────────
from .category import CategoryBase, CategoryCreate, CategoryUpdate, Category, CategoryResponse

# ── Producto ─────────────────────────────────────────────────────────
from .product import ProductTemplateBase, ProductTemplate, ProductTemplateResponse

# ── Tienda ───────────────────────────────────────────────────────────
from .store import StoreBase, StoreCreate, StoreUpdate, Store, StoreResponse

# ── Rol ──────────────────────────────────────────────────────────────
from .role import RoleBase, Role

# ── Empleado ─────────────────────────────────────────────────────────
from .employee import EmployeeBase, EmployeeCreate, EmployeeUpdate, Employee, EmployeeResponse

__all__ = [
    # Enums
    "StatusEnum",
    "RoleEnum",
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
    # Empleado
    "EmployeeBase",
    "EmployeeCreate",
    "EmployeeUpdate",
    "Employee",
    "EmployeeResponse",
]
