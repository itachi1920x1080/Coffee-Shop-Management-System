import csv
from io import StringIO, BytesIO
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

from app.db.database import get_db
from app.schemas.report import FinancialReportResponse
from app.crud import crud_report
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/summary", response_model=FinancialReportResponse)
def read_financial_report(
    start_date: date = Query(..., description="ទម្រង់: YYYY-MM-DD"),
    end_date: date = Query(..., description="ទម្រង់: YYYY-MM-DD"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if start_date > end_date:
        raise HTTPException(status_code=400, detail="Start date cannot be after end date")
    return crud_report.get_financial_summary(db, start_date=start_date, end_date=end_date)

@router.get("/export/csv")
def export_report_csv(
    start_date: date = Query(...),
    end_date: date = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = crud_report.get_financial_summary(db, start_date=start_date, end_date=end_date)
    
    # បង្កើត CSV File នៅក្នុង Memory
    stream = StringIO()
    writer = csv.writer(stream)
    
    # សរសេរក្បាលតារាង (Headers) និងទិន្នន័យ
    writer.writerow(["Start Date", "End Date", "Total Income (USD)", "Total Expense (USD)", "Net Profit (USD)"])
    writer.writerow([report.start_date, report.end_date, report.total_income, report.total_expense, report.net_profit])
    
    stream.seek(0)
    response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = f"attachment; filename=Financial_Report_{start_date}_to_{end_date}.csv"
    return response

@router.get("/export/pdf")
def export_report_pdf(
    start_date: date = Query(...),
    end_date: date = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = crud_report.get_financial_summary(db, start_date=start_date, end_date=end_date)
    
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    
    p.setFont("Helvetica-Bold", 16)
    p.drawString(200, 750, "FINANCIAL SUMMARY REPORT")
    
    p.setFont("Helvetica", 12)
    p.drawString(50, 710, f"Period: {report.start_date} to {report.end_date}")
    p.line(50, 690, 550, 690)
    
    p.drawString(50, 660, "Total Income:")
    p.drawString(200, 660, f"${report.total_income:.2f}")
    
    p.drawString(50, 630, "Total Expenses:")
    p.drawString(200, 630, f"${report.total_expense:.2f}")
    
    p.line(50, 610, 550, 610)
    
    p.setFont("Helvetica-Bold", 14)
    p.drawString(50, 580, "NET PROFIT:")
    p.drawString(200, 580, f"${report.net_profit:.2f}")
    
    p.showPage()
    p.save()
    
    buffer.seek(0)
    headers = {"Content-Disposition": f"attachment; filename=Report_{start_date}_to_{end_date}.pdf"}
    return StreamingResponse(buffer, media_type="application/pdf", headers=headers)