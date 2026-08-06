from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.crud.crud_order import get_order
from app.models.payment import Payment
from app.services.pdf_service import generate_receipt_pdf
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/{order_id}/download")
def download_receipt(
    order_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # រកមើល Order
    order = get_order(db, order_id=order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    # ប្រាកដថា Order នោះបានបង់លុយរួច
    if order.status != "Paid":
        raise HTTPException(status_code=400, detail="Cannot generate receipt for unpaid order")
        
    # ទាញយកកំណត់ត្រាបង់ប្រាក់
    payment = db.query(Payment).filter(Payment.order_id == order_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")
        
    # បង្កើតឯកសារ PDF
    pdf_buffer = generate_receipt_pdf(order=order, payment=payment)
    
    # បញ្ជូន PDF ជាទម្រង់ Download ត្រលប់ទៅ Client
    headers = {
        "Content-Disposition": f"attachment; filename=receipt_{order.order_number}.pdf"
    }
    return StreamingResponse(pdf_buffer, media_type="application/pdf", headers=headers)
