import os
import shutil
import urllib.request
import urllib.parse
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.menu import MenuCreate, MenuResponse, MenuUpdate
from app.crud import crud_menu, crud_category
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

UPLOAD_DIR = "uploads/images"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/", response_model=MenuResponse, status_code=status.HTTP_201_CREATED)
def create_menu(menu_in: MenuCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Check if category exists
    category = crud_category.get_category(db, category_id=menu_in.category_id)
    if not category:
        raise HTTPException(status_code=400, detail="Category does not exist")
    
    # Check if code exists
    if crud_menu.get_menu_by_code(db, code=menu_in.code):
        raise HTTPException(status_code=400, detail="Menu code already exists")
        
    return crud_menu.create_menu(db, menu=menu_in)

@router.get("/", response_model=List[MenuResponse])
def read_menus(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_menu.get_menus(db, skip=skip, limit=limit)

@router.get("/{menu_id}", response_model=MenuResponse)
def read_menu(menu_id: int, db: Session = Depends(get_db)):
    menu = crud_menu.get_menu(db, menu_id=menu_id)
    if not menu:
        raise HTTPException(status_code=404, detail="Menu not found")
    return menu

@router.put("/{menu_id}", response_model=MenuResponse)
def update_menu(menu_id: int, menu_in: MenuUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    menu = crud_menu.get_menu(db, menu_id=menu_id)
    if not menu:
        raise HTTPException(status_code=404, detail="Menu not found")
    return crud_menu.update_menu(db, db_menu=menu, menu_in=menu_in)

# IMAGE UPLOAD ENDPOINT
@router.post("/{menu_id}/image", response_model=MenuResponse)
def upload_menu_image(
    menu_id: int, 
    file: UploadFile = File(...), 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    menu = crud_menu.get_menu(db, menu_id=menu_id)
    if not menu:
        raise HTTPException(status_code=404, detail="Menu not found")
    
    # Secure filename and save
    file_extension = file.filename.split(".")[-1]
    new_filename = f"menu_{menu_id}.{file_extension}"
    file_location = f"{UPLOAD_DIR}/{new_filename}"
    
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)
        
    # Update DB with URL path
    image_url = f"/uploads/images/{new_filename}"
    return crud_menu.update_menu_image(db, db_menu=menu, image_path=image_url)

@router.post("/{menu_id}/generate-image", response_model=MenuResponse)
def generate_menu_image(
    menu_id: int, 
    prompt: str,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    menu = crud_menu.get_menu(db, menu_id=menu_id)
    if not menu:
        raise HTTPException(status_code=404, detail="Menu not found")
    
    # 1. Generate image using placeholder service (prototype)
    safe_prompt = urllib.parse.quote(prompt.lower().replace(" ", ","))
    image_url = f"https://loremflickr.com/320/240/coffee,{safe_prompt}/all"
    
    new_filename = f"menu_{menu_id}_ai.jpg"
    file_location = f"{UPLOAD_DIR}/{new_filename}"
    
    try:
        req = urllib.request.Request(image_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response, open(file_location, 'wb') as out_file:
            shutil.copyfileobj(response, out_file)
    except Exception as e:
        print(f"Error downloading image: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate image")
        
    # Update DB with URL path
    saved_image_url = f"/uploads/images/{new_filename}?t={os.urandom(4).hex()}"
    return crud_menu.update_menu_image(db, db_menu=menu, image_path=saved_image_url)

from sqlalchemy.exc import IntegrityError

@router.delete("/{menu_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_menu(menu_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    menu = crud_menu.get_menu(db, menu_id=menu_id)
    if not menu:
        raise HTTPException(status_code=404, detail="Menu not found")
    
    try:
        crud_menu.delete_menu(db, db_menu=menu)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400, 
            detail="Cannot delete this menu item because it is associated with existing orders. Please consider making it inactive instead."
        )
    return None