from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
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

    # Relationships
    logs = relationship("InventoryLog", back_populates="inventory", cascade="all, delete-orphan")

class InventoryLog(Base):
    __tablename__ = "inventory_logs"

    id = Column(Integer, primary_key=True, index=True)
    inventory_id = Column(Integer, ForeignKey("inventory.id", ondelete="CASCADE"), index=True)
    action = Column(String(50))  # e.g., 'add', 'deduct'
    amount = Column(Float)
    previous_quantity = Column(Float)
    new_quantity = Column(Float)
    performed_by = Column(String(255))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    inventory = relationship("Inventory", back_populates="logs")
