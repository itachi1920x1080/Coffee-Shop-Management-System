from sqlalchemy.orm import Session
from app.models.inventory import Inventory
from app.schemas.inventory import InventoryCreate, InventoryUpdate

def get_inventory_items(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Inventory).offset(skip).limit(limit).all()

def get_inventory_item(db: Session, item_id: int):
    return db.query(Inventory).filter(Inventory.id == item_id).first()

def create_inventory_item(db: Session, item: InventoryCreate):
    db_item = Inventory(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def update_inventory_item(db: Session, db_item: Inventory, item_in: InventoryUpdate):
    update_data = item_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

def update_stock_level(db: Session, db_item: Inventory, amount: float, action: str):
    if action == "add":
        db_item.quantity += amount
    elif action == "deduct":
        db_item.quantity -= amount
        if db_item.quantity < 0:
            db_item.quantity = 0
            
    db.commit()
    db.refresh(db_item)
    return db_item

def delete_inventory_item(db: Session, db_item: Inventory):
    db.delete(db_item)
    db.commit()
    return db_item
