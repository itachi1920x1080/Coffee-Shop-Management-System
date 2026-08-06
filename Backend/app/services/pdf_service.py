from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from app.models.order import Order
from app.models.payment import Payment

def generate_receipt_pdf(order: Order, payment: Payment) -> BytesIO:
    # បង្កើត buffer សម្រាប់ផ្ទុកទិន្នន័យ PDF ជាបណ្តោះអាសន្ន
    buffer = BytesIO()
    
    # បង្កើតផ្ទាំងគំនូរ (Canvas) សម្រាប់សរសេរ
    p = canvas.Canvas(buffer, pagesize=letter)
    
    # ក្បាលវិក្កយបត្រ (Header)
    p.setFont("Helvetica-Bold", 16)
    p.drawString(200, 750, "COFFEE SHOP MANAGEMENT SYSTEM")
    
    p.setFont("Helvetica", 12)
    p.drawString(50, 710, f"Order Number: {order.order_number}")
    p.drawString(50, 690, f"Date: {order.created_at.strftime('%Y-%m-%d %H:%M')}")
    p.drawString(50, 670, f"Status: {order.status}")
    
    # គូរបន្ទាត់
    p.line(50, 650, 550, 650)
    
    # បញ្ជីទំនិញ (Items)
    y_position = 630
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, y_position, "Item")
    p.drawString(300, y_position, "Qty")
    p.drawString(450, y_position, "Subtotal")
    
    y_position -= 20
    p.setFont("Helvetica", 12)
    
    for item in order.items:
        # ប្រសិនបើបញ្ជីវែង យើងត្រូវពិនិត្យកុំឲ្យវាហួសក្រដាសចុះក្រោម (មិនទាន់ធ្វើសម្រាប់កម្រិតមូលដ្ឋាននេះទេ)
        menu_name = item.menu.name if item.menu else "Unknown Item"
        p.drawString(50, y_position, menu_name)
        p.drawString(300, y_position, str(item.quantity))
        p.drawString(450, y_position, f"${item.subtotal:.2f}")
        y_position -= 20
        
    p.line(50, y_position, 550, y_position)
    y_position -= 20
    
    # សរុបទឹកប្រាក់ (Totals & Payment)
    p.setFont("Helvetica-Bold", 12)
    p.drawString(300, y_position, "Total Amount:")
    p.drawString(450, y_position, f"${order.total_amount:.2f}")
    
    y_position -= 20
    p.setFont("Helvetica", 12)
    p.drawString(300, y_position, f"Paid ({payment.payment_currency}):")
    p.drawString(450, y_position, f"{payment.amount_received}")
    
    y_position -= 20
    p.drawString(300, y_position, "Change (USD):")
    p.drawString(450, y_position, f"${payment.change_usd:.2f}")
    
    y_position -= 20
    p.drawString(300, y_position, "Change (KHR):")
    p.drawString(450, y_position, f"{payment.change_khr} Riel")
    
    # បញ្ចប់ និងរក្សាទុក PDF ទៅក្នុង buffer
    p.showPage()
    p.save()
    
    # ទាញ Pointer មកដើមឯកសារវិញ ដើម្បីឲ្យ FastAPI អាចអានវាបញ្ជូនទៅ Frontend
    buffer.seek(0)
    return buffer
