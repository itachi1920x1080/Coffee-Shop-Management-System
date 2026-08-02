from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from app.db.database import engine, Base, get_db
from app.models import user 

# Import our router
from app.api.routes import auth

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Coffee Shop API")

# Register the auth router
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])

@app.get("/")
def read_root():
    return {"message": "Coffee Shop API Running"}

@app.get("/db-check")
def check_db_connection(db: Session = Depends(get_db)):
    return {"status": "success", "message": "Database connection active!"}