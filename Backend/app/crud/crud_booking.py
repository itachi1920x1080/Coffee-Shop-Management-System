from sqlalchemy.orm import Session
from app.models.booking import Room, Booking
from app.schemas.booking import RoomCreate, RoomUpdate, BookingCreate, BookingUpdate

# --- Room CRUD ---
def get_rooms(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Room).offset(skip).limit(limit).all()

def get_room(db: Session, room_id: int):
    return db.query(Room).filter(Room.id == room_id).first()

def create_room(db: Session, room: RoomCreate):
    db_room = Room(**room.dict())
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    return db_room

def update_room(db: Session, db_room: Room, room_in: RoomUpdate):
    update_data = room_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_room, key, value)
    db.commit()
    db.refresh(db_room)
    return db_room

def delete_room(db: Session, db_room: Room):
    db.delete(db_room)
    db.commit()
    return db_room

# --- Booking CRUD ---
def get_bookings(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Booking).order_by(Booking.start_time.desc()).offset(skip).limit(limit).all()

def get_booking(db: Session, booking_id: int):
    return db.query(Booking).filter(Booking.id == booking_id).first()

def create_booking(db: Session, booking: BookingCreate):
    db_booking = Booking(**booking.dict())
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking

def update_booking(db: Session, db_booking: Booking, booking_in: BookingUpdate):
    update_data = booking_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_booking, key, value)
    db.commit()
    db.refresh(db_booking)
    return db_booking

def delete_booking(db: Session, db_booking: Booking):
    db.delete(db_booking)
    db.commit()
    return db_booking
