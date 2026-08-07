import sys
import os

# Add the Backend directory to the python path so we can import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.category import Category

def seed():
    db = SessionLocal()
    categories_to_seed = [
        "Hot Coffee", "Iced Coffee", "Cold Brew", "Espresso Drinks", "Specialty Coffee",
        "Tea", "Hot Tea", "Iced Tea", "Milk Tea", "Bubble Tea", "Herbal Tea", "Specialty Tea",
        "Milk Drinks", "Chocolate Drinks", "Matcha Drinks", "Yogurt Drinks",
        "Smoothies", "Frappes", "Shakes", "Frozen Drinks",
        "Juice", "Fresh Fruit Drinks", "Lemonade", "Coconut Drinks",
        "Soda", "Soft Drinks", "Energy Drinks", "Water",
        "Mocktails", "Cocktails (optional)", "Alcoholic Drinks (optional)", "Seasonal Drinks", "Signature Drinks",
        "Specialty Drinks"
    ]
    
    try:
        existing = db.query(Category).all()
        existing_names = {c.name for c in existing}
        
        added = 0
        for name in categories_to_seed:
            if name not in existing_names:
                cat = Category(name=name, description="System seeded category")
                db.add(cat)
                added += 1
                
        db.commit()
        print(f"Successfully seeded {added} categories!")
    except Exception as e:
        print(f"Error seeding categories: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
