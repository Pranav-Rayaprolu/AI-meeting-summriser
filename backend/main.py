import os
import logging
import jwt
from datetime import datetime, timedelta
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import uuid

from api.endpoints import meetings, action_items, analytics
from auth.firebase_jwt import verify_firebase_token
from models.database import Base, get_db
from utils.config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/app.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Create async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=True,
    future=True
)

# Create async session factory
async_session = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up Meeting Summarizer AI Backend...")

    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    logger.info("Database tables created successfully")
    yield

    # Shutdown
    logger.info("Shutting down...")
    await engine.dispose()

# Create FastAPI app
app = FastAPI(
    title="Meeting Summarizer AI Backend",
    description="Backend API for Meeting Summarizer AI with LangChain, Groq, and Firebase Auth",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ai-meeting-summriser.vercel.app",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security scheme
security = HTTPBearer()

# Include routers
app.include_router(meetings.router, prefix="/api", tags=["meetings"])
app.include_router(action_items.router, prefix="/api", tags=["action-items"])
app.include_router(analytics.router, prefix="/api", tags=["analytics"])

@app.get("/")
async def root():
    return {"message": "Meeting Summarizer AI Backend", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

# Development authentication endpoint
@app.post("/dev/login")
async def dev_login(email: str = Form(...), password: str = Form(...)):
    """
    Development login endpoint for testing
    """
    if not settings.DEVELOPMENT_MODE:
        raise HTTPException(status_code=404, detail="Endpoint not available in production")

    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Valid email is required")

    if not password or len(password) < 3:
        raise HTTPException(status_code=400, detail="Password must be at least 3 characters")

    # Create a mock Firebase uid and convert to UUID
    mock_uid = email
    user_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, mock_uid))
    payload = {
        "user_id": user_uuid,
        "email": email,
        "name": email.split("@")[0],
        "exp": datetime.utcnow() + timedelta(hours=24)
    }

    token = jwt.encode(payload, "dev-secret-key", algorithm="HS256")

    return {
        "token": token,
        "user": {
            "id": payload["user_id"],
            "email": payload["email"],
            "name": payload["name"],
            "role": "user"
        }
    }
