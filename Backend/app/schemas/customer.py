from pydantic import BaseModel
from typing import Optional

class CustomerBase(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    is_regular: Optional[bool] = False

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    is_regular: Optional[bool] = None

class CustomerResponse(CustomerBase):
    id: int
    visit_count: int

    class Config:
        from_attributes = True