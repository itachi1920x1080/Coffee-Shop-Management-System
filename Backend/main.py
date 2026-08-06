from fastapi import FastAPI, Depends
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from app.db.database import engine, Base, get_db
from app.models import user as model_user, category as model_category, menu as model_menu

# Import our routers
from app.api.routes import auth, category as category_route, menu as menu_route

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Coffee Shop API")

# Register the auth router
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(category_route.router, prefix="/categories", tags=["Categories"])
app.include_router(menu_route.router, prefix="/menus", tags=["Menus"]) 

@app.get("/")
def read_root():
    return {"message": "Coffee Shop API Running"}

@app.get("/db-check")
def check_db_connection(db: Session = Depends(get_db)):
    return {"status": "success", "message": "Database connection active!"}
