from pydantic import BaseModel, Field
from typing import Optional

class TableBase(BaseModel):
    number: str
    capacity: int
    # Regex pattern ធានាថាស្ថានភាព (status) គឺពិតជាពាក្យមួយក្នុងចំណោមពាក្យទាំងនេះ
    status: Optional[str] = Field(default="Available", pattern="^(Available|Occupied|Reserved)$")

class TableCreate(TableBase):
    pass

class TableUpdate(BaseModel):
    number: Optional[str] = None
    capacity: Optional[int] = None
    status: Optional[str] = Field(default=None, pattern="^(Available|Occupied|Reserved)$")

class TableResponse(TableBase):
    id: int

    class Config:
        from_attributes = True