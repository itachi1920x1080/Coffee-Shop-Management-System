from unicodedata import category
from pydantic import BaseModel
from typing import Optional

class MenuBase(BaseModel):
    code:str
    category_id:int
    name:str
    price:float
    description:Optional[str]=None
    status:bool=True 

class   MenuCreate(MenuBase):
    pass
class MenuUpdate(BaseModel):
    code: Optional[str] = None
    category_id: Optional[int] = None  
    name: Optional[str] = None
    price: Optional[float] = None 
    description: Optional[str] = None   
    status: Optional[bool] = None   
class MenuResponse(MenuBase):
    id:int
    image:Optional[str]=None   
    class Config:
        from_attributes = True
          