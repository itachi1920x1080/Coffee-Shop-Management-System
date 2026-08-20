from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.inventory import InventoryCreate, InventoryUpdate, InventoryResponse, InventoryStockUpdate, InventoryLogResponse
from app.crud import crud_inventory
from app.api.deps import get_current_manager, get_current_user

router = APIRouter()

@router.get("/", response_model=List[InventoryResponse])
def read_inventory_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return crud_inventory.get_inventory_items(db, skip=skip, limit=limit)

@router.post("/", response_model=InventoryResponse)
def create_inventory_item(item: InventoryCreate, db: Session = Depends(get_db), current_user = Depends(get_current_manager)):
    return crud_inventory.create_inventory_item(db=db, item=item)

@router.put("/{item_id}", response_model=InventoryResponse)
def update_inventory_item(item_id: int, item_in: InventoryUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_manager)):
    db_item = crud_inventory.get_inventory_item(db, item_id=item_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    return crud_inventory.update_inventory_item(db=db, db_item=db_item, item_in=item_in)

@router.put("/{item_id}/stock", response_model=InventoryResponse)
def update_stock_level(item_id: int, stock_update: InventoryStockUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_item = crud_inventory.get_inventory_item(db, item_id=item_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    if stock_update.action not in ["add", "deduct"]:
        raise HTTPException(status_code=400, detail="Action must be 'add' or 'deduct'")
    return crud_inventory.update_stock_level(
        db=db, 
        db_item=db_item, 
        amount=stock_update.amount, 
        action=stock_update.action,
        performed_by=current_user.username
    )

@router.get("/{item_id}/logs", response_model=List[InventoryLogResponse])
def read_inventory_logs(item_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_item = crud_inventory.get_inventory_item(db, item_id=item_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    return crud_inventory.get_inventory_logs(db, item_id=item_id)

@router.delete("/{item_id}")
def delete_inventory_item(item_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_manager)):
    db_item = crud_inventory.get_inventory_item(db, item_id=item_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    crud_inventory.delete_inventory_item(db=db, db_item=db_item)
    return {"message": "Item deleted successfully"}
