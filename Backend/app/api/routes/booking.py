from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.booking import RoomCreate, RoomUpdate, RoomResponse, BookingCreate, BookingUpdate, BookingResponse
from app.crud import crud_booking
from app.api.deps import get_current_user

router = APIRouter()

# --- Room Endpoints ---
@router.get("/rooms", response_model=List[RoomResponse])
def read_rooms(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return crud_booking.get_rooms(db, skip=skip, limit=limit)

@router.post("/rooms", response_model=RoomResponse)
def create_room(room: RoomCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return crud_booking.create_room(db=db, room=room)

@router.put("/rooms/{room_id}", response_model=RoomResponse)
def update_room(room_id: int, room_in: RoomUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_room = crud_booking.get_room(db, room_id=room_id)
    if not db_room:
        raise HTTPException(status_code=404, detail="Room not found")
    return crud_booking.update_room(db=db, db_room=db_room, room_in=room_in)

@router.delete("/rooms/{room_id}")
def delete_room(room_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_room = crud_booking.get_room(db, room_id=room_id)
    if not db_room:
        raise HTTPException(status_code=404, detail="Room not found")
    crud_booking.delete_room(db=db, db_room=db_room)
    return {"message": "Room deleted successfully"}


# --- Booking Endpoints ---
@router.get("/bookings", response_model=List[BookingResponse])
def read_bookings(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return crud_booking.get_bookings(db, skip=skip, limit=limit)

@router.post("/bookings", response_model=BookingResponse)
def create_booking(booking: BookingCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # Check if room exists
    db_room = crud_booking.get_room(db, room_id=booking.room_id)
    if not db_room:
        raise HTTPException(status_code=404, detail="Room not found")
    return crud_booking.create_booking(db=db, booking=booking)

@router.put("/bookings/{booking_id}", response_model=BookingResponse)
def update_booking(booking_id: int, booking_in: BookingUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_booking = crud_booking.get_booking(db, booking_id=booking_id)
    if not db_booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Check if new room exists
    if booking_in.room_id is not None:
        db_room = crud_booking.get_room(db, room_id=booking_in.room_id)
        if not db_room:
            raise HTTPException(status_code=404, detail="New Room not found")

    return crud_booking.update_booking(db=db, db_booking=db_booking, booking_in=booking_in)

@router.delete("/bookings/{booking_id}")
def delete_booking(booking_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_booking = crud_booking.get_booking(db, booking_id=booking_id)
    if not db_booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    crud_booking.delete_booking(db=db, db_booking=db_booking)
    return {"message": "Booking deleted successfully"}
