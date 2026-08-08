from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class InventoryBase(BaseModel):
    item_name: str
    category: str
    quantity: float
    unit: str
    min_stock_level: float

class InventoryCreate(InventoryBase):
    pass

class InventoryUpdate(BaseModel):
    item_name: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    min_stock_level: Optional[float] = None

class InventoryStockUpdate(BaseModel):
    amount: float
    action: str  # "add" or "deduct"

class InventoryResponse(InventoryBase):
    id: int
    last_updated: datetime

    class Config:
        orm_mode = True
        from_attributes = True
