import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.database import Base, engine
from app.models.inventory import InventoryLog

print("Creating InventoryLog table...")
Base.metadata.create_all(bind=engine, tables=[InventoryLog.__table__])
print("Table created successfully.")
