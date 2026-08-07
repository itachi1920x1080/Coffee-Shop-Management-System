from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.crud import crud_user
from app.api.deps import get_current_admin
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[UserResponse])
def read_users(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    return crud_user.get_users(db, skip=skip, limit=limit)

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_new_user(
    user_in: UserCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    if crud_user.get_user_by_username(db, username=user_in.username):
        raise HTTPException(status_code=400, detail="Username already registered")
    if crud_user.get_user_by_email(db, email=user_in.email):
        raise HTTPException(status_code=400, detail="Email already registered")
        
    return crud_user.create_user(db, user=user_in)

@router.put("/{user_id}", response_model=UserResponse)
def update_existing_user(
    user_id: int, 
    user_in: UserUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    user = crud_user.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Check if updating username/email causes a conflict
    if user_in.username and user_in.username != user.username:
        if crud_user.get_user_by_username(db, username=user_in.username):
            raise HTTPException(status_code=400, detail="Username already registered")
            
    if user_in.email and user_in.email != user.email:
        if crud_user.get_user_by_email(db, email=user_in.email):
            raise HTTPException(status_code=400, detail="Email already registered")

    return crud_user.update_user(db, db_user=user, user_in=user_in)

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_user(
    user_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    user = crud_user.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
        
    crud_user.delete_user(db, db_user=user)
    return None
