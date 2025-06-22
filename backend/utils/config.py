import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database - Use SQLite for development if PostgreSQL not available
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./meetings.db")
    
    # Redis - Optional for development
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # LLM APIs
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "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")
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "AIzaSyB53YA8CpfC_YLSyfYajZpe4VGOG_6Zvbs")
    
    # Firebase
    FIREBASE_PROJECT_ID: str = os.getenv("FIREBASE_PROJECT_ID", "meeting-summariser-ai")
    FIREBASE_ADMIN_SDK_PATH: str = os.getenv("FIREBASE_ADMIN_SDK_PATH", "firebase-admin-sdk.json")
    
    # Celery - Use in-memory for development
    CELERY_BROKER_URL: str = os.getenv("CELERY_BROKER_URL", "memory://")
    CELERY_RESULT_BACKEND: str = os.getenv("CELERY_RESULT_BACKEND", "cache+memory://")
    
    # File upload
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS: list = [".txt", ".pdf", ".docx"]
    
    # Development mode
    DEVELOPMENT_MODE: bool = os.getenv("DEVELOPMENT_MODE", "true").lower() == "true"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()