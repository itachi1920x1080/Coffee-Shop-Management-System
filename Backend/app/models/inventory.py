from sqlalchemy import Column, Integer, String, Float, DateTime
from app.db.database import Base
import datetime

class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String(255), index=True)
    category = Column(String(255), index=True)
    quantity = Column(Float, default=0.0)
    unit = Column(String(50))  # e.g., kg, liters, pcs
    min_stock_level = Column(Float, default=5.0)
    last_updated = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
