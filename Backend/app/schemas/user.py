from pydantic import BaseModel, EmailStr
from typing import Optional

# Data required to create a new user
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: Optional[str] = "cashier"

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

# Data returned to the frontend (password excluded!)
class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True

# Token response schema
class Token(BaseModel):
    access_token: str
    token_type: str