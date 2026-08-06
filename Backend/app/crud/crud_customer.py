from sqlalchemy.orm import Session
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerUpdate

def get_customer(db: Session, customer_id: int):
    return db.query(Customer).filter(Customer.id == customer_id).first()

def get_customer_by_phone(db: Session, phone: str):
    return db.query(Customer).filter(Customer.phone == phone).first()

def get_customers(db: Session, skip: int = 0, limit: int = 100, search: str = None):
    query = db.query(Customer)
    
    # If a search term is provided, filter by name or phone
    if search:
        query = query.filter(
            (Customer.name.contains(search)) | (Customer.phone.contains(search))
        )
        
    return query.offset(skip).limit(limit).all()

def create_customer(db: Session, customer: CustomerCreate):
    db_customer = Customer(**customer.model_dump())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

def update_customer(db: Session, db_customer: Customer, customer_in: CustomerUpdate):
    update_data = customer_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_customer, field, value)
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

def increment_visit(db: Session, db_customer: Customer):
    db_customer.visit_count += 1
    # Automatically make them a regular if they visit more than 5 times
    if db_customer.visit_count >= 5:
        db_customer.is_regular = True
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

def delete_customer(db: Session, db_customer: Customer):
    db.delete(db_customer)
    db.commit()
    return db_customer