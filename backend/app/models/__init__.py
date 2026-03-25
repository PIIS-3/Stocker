# Re-exportación centralizada de todos los modelos.
# Permite que el resto de la aplicación importe desde 'app.models'
# directamente (ej: from app.models import Category) sin necesidad
# de conocer la estructura interna del paquete.

# ── Enums ────────────────────────────────────────────────────────────
from .enums import StatusEnum, RoleEnum

# ── Categoría ────────────────────────────────────────────────────────
from .category import CategoryBase, Category

# ── Producto ─────────────────────────────────────────────────────────
from .product import ProductTemplateBase, ProductTemplate, ProductTemplateResponse

# ── Tienda ───────────────────────────────────────────────────────────
from .store import StoreBase, Store

# ── Rol ──────────────────────────────────────────────────────────────
from .role import RoleBase, Role

# ── Empleado ─────────────────────────────────────────────────────────
from .employee import EmployeeBase, EmployeeCreate, Employee, EmployeeResponse

__all__ = [
    # Enums
    "StatusEnum",
    "RoleEnum",
    # Categoría
    "CategoryBase",
    "Category",
    # Producto
    "ProductTemplateBase",
    "ProductTemplate",
    "ProductTemplateResponse",
    # Tienda
    "StoreBase",
    "Store",
    # Rol
    "RoleBase",
    "Role",
    # Empleado
    "EmployeeBase",
    "EmployeeCreate",
    "Employee",
    "EmployeeResponse",
]
