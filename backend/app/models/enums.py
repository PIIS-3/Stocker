from enum import Enum as PyEnum

class StatusEnum(str, PyEnum):
    Active = "Active"
    Inactive = "Inactive"

class RoleRoleEnum(str, PyEnum):
    SuperAdmin = "SuperAdmin"
    Manager = "Manager"
    Staff = "Staff"
