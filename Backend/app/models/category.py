# pyrefly: ignore [missing-import]
from sqlalchemy import Column,Integer,String
from app.db.database import Base


class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer,primary_key=True,index=True)
    name = Column(String(50),unique=True,index=True,nullable=False)
    description = Column(String(255),nullable=True)