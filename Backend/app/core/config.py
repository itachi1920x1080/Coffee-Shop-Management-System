from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME : str = "Coffee Shop API"
    DATABASE_URL : str
    class Config : 
        env_file = ".env"
settings = Settings()

