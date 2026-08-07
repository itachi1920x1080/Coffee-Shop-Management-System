from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from datetime import datetime, timezone

from app.models.order import Order, OrderItem
from app.models.customer import Customer
from app.models.menu import Menu
from app.models.expense import Expense
from app.schemas.dashboard import DashboardMetricsResponse, BestSellingMenu

def get_dashboard_metrics(db: Session) -> DashboardMetricsResponse:
    # យកកាលបរិច្ឆេទថ្ងៃនេះ
    today = datetime.now(timezone.utc).date()

    # 1. រាប់ចំនួន Order ថ្ងៃនេះ
    today_orders_count = db.query(Order).filter(
        cast(Order.created_at, Date) == today,
        Order.status == "Paid"
    ).count()

    # 2. បូកសរុបប្រាក់ចំណូលថ្ងៃនេះ
    today_income_result = db.query(func.sum(Order.total_amount)).filter(
        cast(Order.created_at, Date) == today,
        Order.status == "Paid"
    ).scalar()
    today_income = today_income_result if today_income_result else 0.0

    # 3. រាប់ចំនួនអតិថិជនសរុប
    total_customers = db.query(Customer).count()

    # 3.1 បូកសរុបការចំណាយថ្ងៃនេះ (Today's Expenses)
    today_expenses_result = db.query(func.sum(Expense.amount)).filter(
        cast(Expense.created_at, Date) == today
    ).scalar()
    today_expenses = today_expenses_result if today_expenses_result else 0.0

    # 4. រកមុខម្ហូបដែលលក់ដាច់ជាងគេ
    best_item_query = db.query(
        OrderItem.menu_id, 
        func.sum(OrderItem.quantity).label('total_qty')
    ).join(Order).filter(
        Order.status == "Paid"
    ).group_by(
        OrderItem.menu_id
    ).order_by(
        func.sum(OrderItem.quantity).desc()
    ).first()

    best_selling_menu = None
    if best_item_query:
        menu_id, total_qty = best_item_query
        menu_item = db.query(Menu).filter(Menu.id == menu_id).first()
        if menu_item:
            best_selling_menu = BestSellingMenu(
                menu_name=menu_item.name,
                total_quantity_sold=total_qty
            )

    # 5. គណនាប្រាក់ចំណេញសុទ្ធ (Net Profit = ចំណូលថ្ងៃនេះ - ចំណាយថ្ងៃនេះ)
    net_profit = today_income - today_expenses

    # បញ្ជូនទិន្នន័យទាំងអស់ត្រលប់ទៅវិញ
    return DashboardMetricsResponse(
        today_orders_count=today_orders_count,
        today_income=today_income,
        total_customers=total_customers,
        total_expenses=today_expenses, # ដាក់តម្លៃពិតប្រាកដ
        net_profit=net_profit,          # ប្រាក់ចំណេញពិតប្រាកដ
        best_selling_menu=best_selling_menu
    )
