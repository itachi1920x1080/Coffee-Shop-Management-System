from fastapi import FastAPI, Depends
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from app.db.database import engine, Base, get_db
from app.models import user, category as model_category

# Import our routers
from app.api.routes import auth, category

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Coffee Shop API")

# Register the auth router
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(category.router, prefix="/categories", tags=["Categories"])

@app.get("/")
def read_root():
    return {"message": "Coffee Shop API Running"}

@app.get("/db-check")
def check_db_connection(db: Session = Depends(get_db)):
    return {"status": "success", "message": "Database connection active!"}
