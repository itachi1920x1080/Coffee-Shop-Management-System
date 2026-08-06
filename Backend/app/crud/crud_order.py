import uuid
from sqlalchemy.orm import Session
from app.models.order import Order, OrderItem
from app.models.menu import Menu
from app.schemas.order import OrderCreate

def get_order(db: Session, order_id: int):
    return db.query(Order).filter(Order.id == order_id).first()

def get_orders(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Order).offset(skip).limit(limit).all()

def recalculate_total(db: Session, order_id: int):
    order = get_order(db, order_id)
    total = sum(item.subtotal for item in order.items)
    order.total_amount = total
    db.commit()
    db.refresh(order)
    return order

def create_order(db: Session, order_in: OrderCreate):
    # Generate unique Order ID (e.g., ORD-A1B2C3)
    order_num = f"ORD-{uuid.uuid4().hex[:6].upper()}"
    
    db_order = Order(
        order_number=order_num,
        table_id=order_in.table_id,
        customer_id=order_in.customer_id
    )
    db.add(db_order)
    db.flush() # Saves to DB to get the ID, but doesn't fully commit yet

    for item in order_in.items:
        menu_item = db.query(Menu).filter(Menu.id == item.menu_id).first()
        if menu_item:
            subtotal = menu_item.price * item.quantity
            db_order_item = OrderItem(
                order_id=db_order.id,
                menu_id=item.menu_id,
                quantity=item.quantity,
                subtotal=subtotal
            )
            db.add(db_order_item)
            
    db.commit()
    return recalculate_total(db, db_order.id)

def modify_order_item(db: Session, order_id: int, menu_id: int, quantity: int):
    order_item = db.query(OrderItem).filter(OrderItem.order_id == order_id, OrderItem.menu_id == menu_id).first()
    menu_item = db.query(Menu).filter(Menu.id == menu_id).first()

    if not menu_item:
        return None

    if quantity <= 0:
        # Remove item completely if quantity is 0 or less
        if order_item:
            db.delete(order_item)
    else:
        # Update or Add item
        if order_item:
            order_item.quantity = quantity
            order_item.subtotal = menu_item.price * quantity
        else:
            new_item = OrderItem(
                order_id=order_id, 
                menu_id=menu_id, 
                quantity=quantity, 
                subtotal=menu_item.price * quantity
            )
            db.add(new_item)
            
    db.commit()
    return recalculate_total(db, order_id)