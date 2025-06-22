# utils/config.py

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database - PostgreSQL in production, SQLite fallback in dev
    DATABASE_URL: str = "sqlite+aiosqlite:///./meetings.db"

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # Celery
    CELERY_BROKER_URL: str = "memory://"
    CELERY_RESULT_BACKEND: str = "cache+memory://"

    # API Keys
    GROQ_API_KEY: str
    GOOGLE_API_KEY: str

    # Firebase
    FIREBASE_PROJECT_ID: str
    FIREBASE_ADMIN_SDK_PATH: str

    # Upload
    MAX_FILE_SIZE: int = 10 * 1024 * 1024
    ALLOWED_EXTENSIONS: list[str] = [".txt", ".pdf", ".docx"]

    # App
    DEVELOPMENT_MODE: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
