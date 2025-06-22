import os
import sys
import asyncio
import logging
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Set environment variables for development
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///./meetings.db")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379")
os.environ.setdefault("GROQ_API_KEY", "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")
os.environ.setdefault("GOOGLE_API_KEY", "AIzaSyB53YA8CpfC_YLSyfYajZpe4VGOG_6Zvbs")
os.environ.setdefault("FIREBASE_PROJECT_ID", "meeting-summariser-ai")
os.environ.setdefault("FIREBASE_ADMIN_SDK_PATH", "firebase-admin-sdk.json")

# Create logs directory
logs_dir = backend_dir / "logs"
logs_dir.mkdir(exist_ok=True)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(logs_dir / 'app.log'),
        logging.StreamHandler()
    ]
)

if __name__ == "__main__":
    import uvicorn
    
    print("🚀 Starting Meeting Summarizer AI Backend...")
    print("📍 Backend will be available at: http://localhost:8000")
    print("📋 API Documentation: http://localhost:8000/docs")
    print("🔍 Health Check: http://localhost:8000/health")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )