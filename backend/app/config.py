from pydantic_settings import BaseSettings
from functools import lru_cache
from pathlib import Path

# Get the backend directory path
BACKEND_DIR = Path(__file__).parent.parent
DATA_DIR = BACKEND_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = f"sqlite:///{DATA_DIR}/food_minded.db"

    # Security
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_HOURS: int = 24

    # External APIs
    USDA_API_KEY: str = ""
    GOOGLE_API_KEY: str = ""  # Gemini API - get from https://aistudio.google.com/apikey

    # Stripe
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_PRICE_PRO_MONTHLY: str = ""
    FRONTEND_URL: str = "http://localhost:3001"

    # App
    APP_NAME: str = "Food Minded"
    DEBUG: bool = False

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
