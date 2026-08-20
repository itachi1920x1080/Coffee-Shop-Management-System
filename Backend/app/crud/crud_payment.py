from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.payment import Payment
from app.models.order import Order
from app.schemas.payment import PaymentCreate

EXCHANGE_RATE = 4100.0 # កំណត់អត្រាប្តូរប្រាក់ 1$ = 4100៛ (អ្នកអាចប្តូរបាន)

def process_payment(db: Session, payment_in: PaymentCreate):
    # 1. រកមើល Order
    order = db.query(Order).filter(Order.id == payment_in.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # 2. បញ្ជាក់ថា Order នេះមិនទាន់បានបង់ប្រាក់
    if order.status == "Paid":
        raise HTTPException(status_code=400, detail="This order is already paid")

    total_usd = order.total_amount
    total_khr = total_usd * EXCHANGE_RATE
    
    change_usd = 0.0
    change_khr = 0.0

    # 3. គណនាប្រាក់អាប់ផ្អែកលើរូបិយប័ណ្ណដែលអតិថិជនបង់
    if payment_in.payment_currency == "USD":
        if payment_in.amount_received < total_usd:
            raise HTTPException(status_code=400, detail="Not enough money provided (USD)")
        change_usd = payment_in.amount_received - total_usd
        change_khr = change_usd * EXCHANGE_RATE
        
    elif payment_in.payment_currency == "KHR":
        if payment_in.amount_received < total_khr:
            raise HTTPException(status_code=400, detail="Not enough money provided (KHR)")
        change_khr = payment_in.amount_received - total_khr
        change_usd = change_khr / EXCHANGE_RATE

    # 4. បង្កើតកំណត់ត្រាបង់ប្រាក់
    db_payment = Payment(
        order_id=order.id,
        exchange_rate=EXCHANGE_RATE,
        amount_received=payment_in.amount_received,
        payment_currency=payment_in.payment_currency,
        change_usd=round(change_usd, 2), # ធ្វើឲ្យនៅសល់ទសភាគ២ខ្ទង់
        change_khr=round(change_khr, 0)  # ប្រាក់រៀលមិនត្រូវការទសភាគទេ
    )
    db.add(db_payment)

    # 5. ផ្លាស់ប្តូរស្ថានភាព Order ទៅជា Paid
    order.status = "Paid"
    
    # 5.5. បើមានភ្ជាប់ជាមួយការកក់បន្ទប់ (Booking) ឲ្យវាទៅជា Paid ដែរ
    if order.booking_id and order.booking:
        order.booking.payment_status = "Paid"
        order.booking.payment_note = "Paid together with coffee order"

    db.add(order)

    # 6. Save ចូល Database
    db.commit()
    db.refresh(db_payment)
    return db_payment
