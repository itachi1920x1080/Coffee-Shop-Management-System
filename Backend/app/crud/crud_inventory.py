from sqlalchemy.orm import Session
from app.models.inventory import Inventory, InventoryLog
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

def update_stock_level(db: Session, db_item: Inventory, amount: float, action: str, performed_by: str = "System"):
    previous_quantity = db_item.quantity

    if action == "add":
        db_item.quantity += amount
    elif action == "deduct":
        db_item.quantity -= amount
        if db_item.quantity < 0:
            db_item.quantity = 0
            
    # Create log entry
    log_entry = InventoryLog(
        inventory_id=db_item.id,
        action=action,
        amount=amount,
        previous_quantity=previous_quantity,
        new_quantity=db_item.quantity,
        performed_by=performed_by
    )
    db.add(log_entry)

    db.commit()
    db.refresh(db_item)
    return db_item

def get_inventory_logs(db: Session, item_id: int):
    return db.query(InventoryLog).filter(InventoryLog.inventory_id == item_id).order_by(InventoryLog.created_at.desc()).all()

def delete_inventory_item(db: Session, db_item: Inventory):
    db.delete(db_item)
    db.commit()
    return db_item
