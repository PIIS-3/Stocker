from pydantic import BaseModel


class SummaryResponse(BaseModel):
    total_sales: int
    total_revenue: float
    cancelled_sales: int
    pending_sales: int
    low_stock_count: int


class SalesByStoreItem(BaseModel):
    store_id: int
    store_name: str
    total_sales: int
    total_revenue: float


class TopProductItem(BaseModel):
    product_id: int
    product_name: str
    sku: str
    units_sold: int
    total_revenue: float


class LowStockItem(BaseModel):
    stock_id: int
    product_id: int
    product_name: str
    sku: str
    store_id: int
    store_name: str
    quantity: int
    min_stock: int
