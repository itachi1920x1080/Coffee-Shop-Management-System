from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from app.db.database import engine, Base, get_db

# 1. Import Models (ដើម្បីឲ្យ SQLAlchemy បង្កើតតារាង)
from app.models import user, category, menu, table, customer, order, payment # បន្ថែម payment
# 2. Import Routers (បំបែកមួយជួរៗដើម្បីកុំឲ្យច្រឡំ)
from app.api.routes import auth
from app.api.routes import category as category_route
from app.api.routes import menu as menu_route
from app.api.routes import table as table_route 
from app.api.routes import customer as customer_route
from app.api.routes import order as order_route
from app.api.routes import payment as payment_route # បន្ថែម payment router
from app.api.routes import receipt as receipt_route # បន្ថែមបន្ទាត់នេះ
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Coffee Shop API")

# 3. Register Routers បញ្ចូលទៅក្នុងកម្មវិធី
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(category_route.router, prefix="/categories", tags=["Categories"])
app.include_router(menu_route.router, prefix="/menus", tags=["Menus"]) 
app.include_router(table_route.router, prefix="/tables", tags=["Tables"])
app.include_router(customer_route.router, prefix="/customers", tags=["Customers"])
app.include_router(order_route.router, prefix="/orders", tags=["Orders"])
app.include_router(payment_route.router, prefix="/payments", tags=["Payments"])
app.include_router(receipt_route.router, prefix="/receipts", tags=["Receipts"])

@app.get("/")
def read_root():
    return {"message": "Coffee Shop API Running"}

@app.get("/db-check")
def check_db_connection(db: Session = Depends(get_db)):
    return {"status": "success", "message": "Database connection active!"}