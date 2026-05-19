from enum import StrEnum


class StatusEnum(StrEnum):
    Active = "Active"
    Inactive = "Inactive"


class RoleEnum(StrEnum):
    SuperAdmin = "SuperAdmin"
    Manager = "Manager"
    Staff = "Staff"


class SaleStatusEnum(StrEnum):
    Completed = "Completed"
    Cancelled = "Cancelled"
    Pending = "Pending"
