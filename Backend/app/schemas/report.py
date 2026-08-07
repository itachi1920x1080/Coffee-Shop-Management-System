from pydantic import BaseModel
from datetime import date
from typing import Optional

class FinancialReportResponse(BaseModel):
    start_date: date
    end_date: date
    total_income: float
    total_expense: float
    net_profit: float