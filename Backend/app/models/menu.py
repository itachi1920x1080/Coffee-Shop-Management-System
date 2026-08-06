# pyrefly: ignore [missing-import]
from sqlalchemy import Column,Integer,String,Boolean,ForeignKey,Float
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import relationship
from app.db.database import Base

class Menu(Base):
    __tablename__ = "menu"
    id = Column(Integer,primary_key=True,index=True)
    code = Column(String(500),unique=True ,nullable = False)
    category_id=Column(Integer,ForeignKey("categories.id"),nullable=False)
    name = Column(String(100),nullable=False)
    price = Column(Float,nullable=False)
    description = Column(String(255),nullable=True)
    image=Column(String(255),nullable=True)
    status = Column(Boolean,default = True)
    category = relationship("Category")
    
