# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from app.models.table import Table
from app.schemas.table import TableCreate, TableUpdate

def get_table(db: Session, table_id: int):
    return db.query(Table).filter(Table.id == table_id).first()

def get_table_by_number(db: Session, number: str):
    return db.query(Table).filter(Table.number == number).first()

def get_tables(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Table).offset(skip).limit(limit).all()

def create_table(db: Session, table: TableCreate):
    db_table = Table(**table.model_dump())
    db.add(db_table)
    db.commit()
    db.refresh(db_table)
    return db_table

def update_table(db: Session, db_table: Table, table_in: TableUpdate):
    update_data = table_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_table, field, value)
    db.add(db_table)
    db.commit()
    db.refresh(db_table)
    return db_table

def delete_table(db: Session, db_table: Table):
    db.delete(db_table)
    db.commit()
    return db_table