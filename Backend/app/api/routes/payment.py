from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.payment import PaymentCreate, PaymentResponse
from app.crud import crud_payment
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
def checkout_order(
    payment_in: PaymentCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # យើងហៅអនុគមន៍ដំណើរការបង់ប្រាក់ពី CRUD
    return crud_payment.process_payment(db, payment_in=payment_in)
