from sqlalchemy import Column, Integer, String, Boolean
from app.db.database import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True, nullable=False)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    email = Column(String(100), nullable=True)
    is_regular = Column(Boolean, default=False)
    visit_count = Column(Integer, default=0)