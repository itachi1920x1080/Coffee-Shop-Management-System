from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from app.db.database import engine, Base, get_db

# 1. Import Models (ដើម្បីឲ្យ SQLAlchemy បង្កើតតារាង)
from app.models import user, category, menu, table, customer, order, payment, inventory, booking
# 2. Import Routers (បំបែកមួយជួរៗដើម្បីកុំឲ្យច្រឡំ)
from app.api.routes import auth
from app.api.routes import category as category_route
from app.api.routes import menu as menu_route
from app.api.routes import table as table_route 
from app.api.routes import customer as customer_route
from app.api.routes import order as order_route
from app.api.routes import payment as payment_route
from app.api.routes import receipt as receipt_route 
from app.api.routes import dashboard as dashboard_route # បន្ថែម dashboard
from app.api.routes import expense as expense_route
from app.api.routes import report as report_route
from app.api.routes import ai as ai_route
from app.api.routes import user as user_route
from app.api.routes import inventory as inventory_route
from app.api.routes import booking as booking_route
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Coffee Shop API")

# Mount static files for image uploads
os.makedirs("uploads/images", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# កំណត់ CORS (Cross-Origin Resource Sharing) ដើម្បីអនុញ្ញាតឲ្យ React Frontend អាចតភ្ជាប់មក Backend បាន
origins = [
    "http://localhost:5173",    # Vite React Dev Server default port
    "http://127.0.0.1:5173",
    "http://localhost:3000",    # Create React App / Next.js default port
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      # អាចប្តូរជា ["*"] ប្រសិនបើចង់អនុញ្ញាតគ្រប់ domain/port
    allow_credentials=True,
    allow_methods=["*"],        # អនុញ្ញាតគ្រប់ methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],        # អនុញ្ញាតគ្រប់ headers (រួមទាំង Authorization Bearer Token ផងដែរ)
)

# 3. Register Routers បញ្ចូលទៅក្នុងកម្មវិធី
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(category_route.router, prefix="/categories", tags=["Categories"])
app.include_router(menu_route.router, prefix="/menus", tags=["Menus"]) 
app.include_router(table_route.router, prefix="/tables", tags=["Tables"])
app.include_router(customer_route.router, prefix="/customers", tags=["Customers"])
app.include_router(order_route.router, prefix="/orders", tags=["Orders"])
app.include_router(payment_route.router, prefix="/payments", tags=["Payments"])
app.include_router(receipt_route.router, prefix="/receipts", tags=["Receipts"])
app.include_router(dashboard_route.router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(expense_route.router, prefix="/expenses", tags=["Expenses"])
app.include_router(report_route.router, prefix="/reports", tags=["Reports"])
app.include_router(ai_route.router, prefix="/ai", tags=["AI Generation"])
app.include_router(user_route.router, prefix="/users", tags=["Users (Staff)"])
app.include_router(inventory_route.router, prefix="/inventory", tags=["Inventory"])
app.include_router(booking_route.router, prefix="/workspace", tags=["Workspace Bookings"])


@app.get("/")
def read_root():
    return {"message": "Coffee Shop API Running"}

@app.get("/db-check")
def check_db_connection(db: Session = Depends(get_db)):
    return {"status": "success", "message": "Database connection active!"}