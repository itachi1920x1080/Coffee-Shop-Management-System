from sqlalchemy import Column, Integer, String
from app.db.database import Base

class Table(Base):
    __tablename__ = "tables"

    id = Column(Integer, primary_key=True, index=True)
    number = Column(String(20), unique=True, index=True, nullable=False) # ឧទាហរណ៍ "T-01"
    capacity = Column(Integer, nullable=False)                           # ឧទាហរណ៍ 4 (នាក់)
    status = Column(String(20), default="Available")                     # Available, Occupied, Reserved
    floor = Column(String(50), default="Ground Floor")                   # e.g., Ground Floor, Floor 1