from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from app.db.database import engine, Base, get_db
from app.models import user
Base.metadata.create_all (bind= engine)
app = FastAPI(title="Coffee Shop API")

@app.get("/")
def read_root():
    return {"message":"Coffee Shop AIP Running "}


@app.get("/db_tests")
def checke_db_connection (db:Session = Depends(get_db)):
    return { 
        "status " : "success",
        "message" : "Database connected successfully and table  are create !"
    }
