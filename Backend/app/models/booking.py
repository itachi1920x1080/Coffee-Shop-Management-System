from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base
import datetime

class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True) # e.g. "Meeting Room A"
    capacity = Column(Integer, default=1)
    price_per_hour = Column(Float, default=0.0)
    status = Column(String(50), default="Available") # Available, Occupied, Maintenance

    bookings = relationship("Booking", back_populates="room")

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("rooms.id"))
    customer_name = Column(String(255))
    customer_phone = Column(String(50), nullable=True)
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    status = Column(String(50), default="Pending") # Pending, Active, Completed, Cancelled
    payment_status = Column(String(50), default="Unpaid") # Unpaid, Paid, Partially Paid
    payment_note = Column(String(255), nullable=True) # e.g. Paid in advance, Pay after
    total_price = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    room = relationship("Room", back_populates="bookings")
