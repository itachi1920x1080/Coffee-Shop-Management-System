from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME : str = "Coffee Shop API"
    DATABASE_URL : str
    SECRET_KEY : str
    ALGORITHM : str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES : int = 30
    GEMINI_API_KEY: str | None = None

    class Config : 
        env_file = ".env"
settings = Settings()

