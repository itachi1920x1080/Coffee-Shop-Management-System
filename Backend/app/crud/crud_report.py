from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from datetime import date

from app.models.order import Order
from app.models.expense import Expense
from app.schemas.report import FinancialReportResponse

def get_financial_summary(db: Session, start_date: date, end_date: date) -> FinancialReportResponse:
    # 1. គណនាប្រាក់ចំណូលសរុបក្នុងចន្លោះកាលបរិច្ឆេទ
    income_result = db.query(func.sum(Order.total_amount)).filter(
        cast(Order.created_at, Date) >= start_date,
        cast(Order.created_at, Date) <= end_date,
        Order.status == "Paid"
    ).scalar()
    total_income = income_result if income_result else 0.0

    # 2. គណនាការចំណាយសរុបក្នុងចន្លោះកាលបរិច្ឆេទ
    expense_result = db.query(func.sum(Expense.amount)).filter(
        cast(Expense.created_at, Date) >= start_date,
        cast(Expense.created_at, Date) <= end_date
    ).scalar()
    total_expense = expense_result if expense_result else 0.0

    # 3. គណនាប្រាក់ចំណេញសុទ្ធ
    net_profit = total_income - total_expense

    return FinancialReportResponse(
        start_date=start_date,
        end_date=end_date,
        total_income=total_income,
        total_expense=total_expense,
        net_profit=net_profit
    )