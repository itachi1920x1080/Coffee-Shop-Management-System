from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.order import OrderCreate, OrderResponse
from app.crud import crud_order
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(order_in: OrderCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud_order.create_order(db, order_in=order_in)

@router.get("/", response_model=List[OrderResponse])
def read_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud_order.get_orders(db, skip=skip, limit=limit)

@router.get("/{order_id}", response_model=OrderResponse)
def read_order(order_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    order = crud_order.get_order(db, order_id=order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.put("/{order_id}/items", response_model=OrderResponse)
def modify_order_items(
    order_id: int, 
    menu_id: int, 
    quantity: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Pass quantity > 0 to add/update an item.
    Pass quantity = 0 to remove the item.
    """
    order = crud_order.get_order(db, order_id=order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    updated_order = crud_order.modify_order_item(db, order_id=order_id, menu_id=menu_id, quantity=quantity)
    if not updated_order:
        raise HTTPException(status_code=400, detail="Menu item not found")
        
    return updated_order