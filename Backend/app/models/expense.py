# pyrefly: ignore [missing-import]
from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime, timezone
from app.db.database import Base

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)        # ឧទាហរណ៍៖ ទិញគ្រាប់កាហ្វេ
    amount = Column(Float, nullable=False)             # ឧទាហរណ៍៖ 45.0
    category = Column(String(50), nullable=False)      # ឧទាហរណ៍៖ Inventory, Utility, Salary
    description = Column(String(255), nullable=True)   # បញ្ជាក់បន្ថែម
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))