from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.db.database import Base

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    # unique=True មានន័យថា វិក្កយបត្រមួយ (Order) អាចមានការបង់ប្រាក់តែមួយដងគត់
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, unique=True)
    exchange_rate = Column(Float, nullable=False)          # ឧទាហរណ៍ 4100
    amount_received = Column(Float, nullable=False)        # ប្រាក់ដែលអតិថិជនហុចឲ្យ
    payment_currency = Column(String(10), nullable=False)  # 'USD' ឬ 'KHR'
    change_usd = Column(Float, nullable=False)             # ប្រាក់អាប់ជាដុល្លារ
    change_khr = Column(Float, nullable=False)             # ប្រាក់អាប់ជារៀល
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    order = relationship("Order")
