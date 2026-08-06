from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.customer import CustomerCreate, CustomerResponse, CustomerUpdate
from app.crud import crud_customer
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(customer_in: CustomerCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if crud_customer.get_customer_by_phone(db, phone=customer_in.phone):
        raise HTTPException(status_code=400, detail="Customer with this phone number already exists")
    return crud_customer.create_customer(db, customer=customer_in)

@router.get("/", response_model=List[CustomerResponse])
def read_customers(
    skip: int = 0, 
    limit: int = 100, 
    search: Optional[str] = Query(None, description="Search by name or phone"),
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    return crud_customer.get_customers(db, skip=skip, limit=limit, search=search)

@router.get("/{customer_id}", response_model=CustomerResponse)
def read_customer(customer_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    customer = crud_customer.get_customer(db, customer_id=customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(customer_id: int, customer_in: CustomerUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    customer = crud_customer.get_customer(db, customer_id=customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    if customer_in.phone:
        existing_customer = crud_customer.get_customer_by_phone(db, phone=customer_in.phone)
        if existing_customer and existing_customer.id != customer_id:
            raise HTTPException(status_code=400, detail="Phone number already registered to another customer")

    return crud_customer.update_customer(db, db_customer=customer, customer_in=customer_in)

@router.post("/{customer_id}/visit", response_model=CustomerResponse)
def add_customer_visit(customer_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    customer = crud_customer.get_customer(db, customer_id=customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return crud_customer.increment_visit(db, db_customer=customer)

@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(customer_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    customer = crud_customer.get_customer(db, customer_id=customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    crud_customer.delete_customer(db, db_customer=customer)
    return None