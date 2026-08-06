from sqlalchemy.orm import Session
from app.models.menu import Menu
from app.schemas.menu import MenuCreate, MenuUpdate
def get_menu(db: Session, menu_id: int):
    return db.query(Menu).filter(Menu.id == menu_id).first()  
def get_menu_by_code(db: Session, code: str):
    return db.query(Menu).filter(Menu.code==code).first()   
def get_menus(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Menu).offset(skip).limit(limit).all()

def create_menu(db: Session, menu: MenuCreate):
    db_menu = Menu(**menu.model_dump())
    db.add(db_menu)
    db.commit()
    db.refresh(db_menu)
    return db_menu

def update_menu(db: Session, db_menu: Menu, menu_in: MenuUpdate):
    update_data = menu_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_menu, field, value)
    db.add(db_menu)
    db.commit()
    db.refresh(db_menu)
    return db_menu

def update_menu_image(db: Session, db_menu: Menu, image_path: str):
    db_menu.image = image_path
    db.add(db_menu)
    db.commit()
    db.refresh(db_menu)
    return db_menu

def delete_menu(db: Session, db_menu: Menu):
    db.delete(db_menu)
    db.commit()
    return db_menu