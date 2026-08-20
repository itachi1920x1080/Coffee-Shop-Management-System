from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Room Schemas
class RoomBase(BaseModel):
    name: str
    capacity: int
    price_per_hour: float
    status: str = "Available"

class RoomCreate(RoomBase):
    pass

class RoomUpdate(BaseModel):
    name: Optional[str] = None
    capacity: Optional[int] = None
    price_per_hour: Optional[float] = None
    status: Optional[str] = None

class RoomResponse(RoomBase):
    id: int

    class Config:
        from_attributes = True
        orm_mode = True

# Booking Schemas
class BookingBase(BaseModel):
    room_id: int
    customer_name: str
    customer_phone: Optional[str] = None
    start_time: datetime
    end_time: datetime
    status: str = "Pending"
    payment_status: str = "Unpaid"
    payment_note: Optional[str] = None
    total_price: float = 0.0

class BookingCreate(BookingBase):
    pass

class BookingUpdate(BaseModel):
    room_id: Optional[int] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: Optional[str] = None
    payment_status: Optional[str] = None
    payment_note: Optional[str] = None
    total_price: Optional[float] = None

class BookingResponse(BookingBase):
    id: int
    created_at: datetime
    room: RoomResponse

    class Config:
        from_attributes = True
        orm_mode = True
