# Coffee Shop Management System - Backend

This is the FastAPI backend for the Coffee Shop Management System. It provides a robust set of RESTful APIs for managing menus, categories, orders, customers, and more, along with AI-powered features for generating product ideas and images.

## Features
- **FastAPI Framework**: High-performance, easy-to-use API framework.
- **SQLAlchemy ORM**: Database interactions and migrations.
- **AI Menu Generation**: Uses Google Gemini API to automatically generate menu product suggestions based on categories.
- **AI Image Generation**: Uses Pollinations AI to automatically generate thumbnails and product images for menu items.
- **JWT Authentication**: Secure login and session management.

## Prerequisites
- Python 3.9+
- A Google Gemini API Key (for AI text generation)

## Installation

1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Environment Setup
Create a `.env` file in the root of the `Backend` directory and add the following configurations:

```env
# Database Settings
DATABASE_URL="sqlite:///./coffee_shop.db"

# Security Settings
SECRET_KEY="your-secret-key-here"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Google Gemini API
GEMINI_API_KEY="your-google-gemini-api-key"
```

## Running the Server

Start the development server with Uvicorn:

```bash
uvicorn main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.

## API Documentation
Once the server is running, you can access the automatic interactive API documentation provided by FastAPI:
- **Swagger UI**: `http://127.0.0.1:8000/docs`
- **ReDoc**: `http://127.0.0.1:8000/redoc`
