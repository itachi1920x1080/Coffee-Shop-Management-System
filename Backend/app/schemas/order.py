from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class OrderItemBase(BaseModel):
    menu_id: int
    quantity: int

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemMenu(BaseModel):
    name: str
    price: float

    class Config:
        from_attributes = True

class OrderItemResponse(OrderItemBase):
    id: int
    subtotal: float
    menu: Optional[OrderItemMenu] = None

    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    table_id: Optional[int] = None
    customer_id: Optional[int] = None
    booking_id: Optional[int] = None

class OrderCreate(OrderBase):
    items: List[OrderItemCreate] # Allows creating an order with items immediately

class OrderResponse(OrderBase):
    id: int
    order_number: str
    total_amount: float
    status: str
    created_at: datetime
    items: List[OrderItemResponse] # Includes the nested items in the response

    class Config:
        from_attributes = True