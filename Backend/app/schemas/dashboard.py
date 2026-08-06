from pydantic import BaseModel
from typing import Optional

class BestSellingMenu(BaseModel):
    menu_name: str
    total_quantity_sold: int

class DashboardMetricsResponse(BaseModel):
    today_orders_count: int
    today_income: float
    total_customers: int
    total_expenses: float  # នឹងប្រើប្រាស់នៅជំហានបន្ទាប់
    net_profit: float      # នឹងប្រើប្រាស់នៅជំហានបន្ទាប់
    best_selling_menu: Optional[BestSellingMenu] = None
