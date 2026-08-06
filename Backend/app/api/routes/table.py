from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.table import TableCreate, TableResponse, TableUpdate
from app.crud import crud_table
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=TableResponse, status_code=status.HTTP_201_CREATED)
def create_table(table_in: TableCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if crud_table.get_table_by_number(db, number=table_in.number):
        raise HTTPException(status_code=400, detail="Table number already exists")
    return crud_table.create_table(db, table=table_in)

@router.get("/", response_model=List[TableResponse])
def read_tables(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud_table.get_tables(db, skip=skip, limit=limit)

@router.get("/{table_id}", response_model=TableResponse)
def read_table(table_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    table = crud_table.get_table(db, table_id=table_id)
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    return table

@router.put("/{table_id}", response_model=TableResponse)
def update_table(table_id: int, table_in: TableUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    table = crud_table.get_table(db, table_id=table_id)
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    
    # ពិនិត្យមើលថាតើលេខតុថ្មីមានរួចហើយឬនៅ
    if table_in.number:
        existing_table = crud_table.get_table_by_number(db, number=table_in.number)
        if existing_table and existing_table.id != table_id:
            raise HTTPException(status_code=400, detail="Table number already exists")

    return crud_table.update_table(db, db_table=table, table_in=table_in)

@router.delete("/{table_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_table(table_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    table = crud_table.get_table(db, table_id=table_id)
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    crud_table.delete_table(db, db_table=table)
    return None