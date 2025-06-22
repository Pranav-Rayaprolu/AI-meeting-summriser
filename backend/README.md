# Meeting Summarizer AI - Backend

A production-grade FastAPI backend for the Meeting Summarizer AI application with LangChain, Groq, Firebase Auth, and Celery.

## 🚀 Features

- **FastAPI** - Modern, fast web framework for building APIs
- **LangChain Integration** - Groq (primary) and Google AI Studio (fallback) for LLM processing
- **Firebase Authentication** - JWT token validation
- **PostgreSQL** - Robust database with async support
- **Redis** - Caching and message broker
- **Celery** - Async task processing for LLM operations
- **Docker** - Containerized deployment
- **File Processing** - Support for TXT, PDF, and DOCX files

## 🛠️ Quick Start

### Prerequisites

- Docker and Docker Compose
- Python 3.11+ (for local development)

### 1. Environment Setup

Copy the environment template:
```bash
cp .env.example .env
```

Update the `.env` file with your API keys:
- `GROQ_API_KEY` - Your Groq API key
- `GOOGLE_API_KEY` - Your Google AI Studio API key
- `FIREBASE_PROJECT_ID` - Your Firebase project ID

### 2. Run with Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

### 3. Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Start PostgreSQL and Redis
docker-compose up -d db redis

# Run FastAPI server
uvicorn main:app --reload

# Run Celery worker (in another terminal)
celery -A tasks.summary_worker worker --loglevel=info
```

## 📋 API Endpoints

### Authentication
All endpoints require Firebase JWT token in Authorization header:
```
Authorization: Bearer <firebase_jwt_token>
```

### Meetings
- `POST /api/meetings/upload` - Upload meeting transcript
- `GET /api/meeting/{id}/summary` - Get meeting summary
- `GET /api/meeting/{id}/action-items` - Get action items
- `GET /api/meetings` - Get user's meetings

### Action Items
- `PUT /api/action-items/{id}` - Update action item
- `GET /api/action-items/user` - Get user's action items

### Analytics
- `GET /api/analytics/user/{id}` - Get user analytics
- `GET /api/analytics/dashboard` - Get dashboard analytics

## 🗃️ Database Schema

### Tables
- `users` - User information
- `meetings` - Meeting records
- `meeting_summaries` - AI-generated summaries
- `action_items` - Extracted action items
- `meeting_keywords` - Keyword frequency data

## 🧠 LLM Processing

The system uses LangChain to orchestrate LLM calls:

1. **Primary**: Groq API (Mixtral-8x7B model)
2. **Fallback**: Google AI Studio (Gemini Pro)
3. **Structured Output**: Pydantic models for validation
4. **Retry Logic**: Exponential backoff with 3 retries

## 🔧 Architecture

```
Frontend (React) → FastAPI → PostgreSQL
                     ↓
                  Celery Worker → LLM APIs
                     ↓
                   Redis Cache
```

## 📊 Monitoring

- **Health Check**: `GET /health`
- **Flower UI**: http://localhost:5555 (Celery monitoring)
- **Logs**: `./logs/app.log`

## 🔐 Security

- Firebase JWT validation
- CORS configuration for frontend
- Input validation and sanitization
- Rate limiting ready (can be added)

## 🚀 Deployment

### Production Deployment

1. **Environment Variables**: Set production values in `.env`
2. **Database**: Use managed PostgreSQL (AWS RDS, etc.)
3. **Redis**: Use managed Redis (AWS ElastiCache, etc.)
4. **Scaling**: Deploy multiple Celery workers
5. **Monitoring**: Add APM tools (Sentry, DataDog, etc.)

### Railway/Render Deployment

The application is ready for deployment on Railway or Render with minimal configuration.

## 🧪 Testing

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest

# Run with coverage
pytest --cov=.
```

## 📝 Development Notes

- All database operations are async
- LLM calls are handled by Celery workers
- Redis is used for both caching and task queue
- Structured logging throughout the application
- Error handling with proper HTTP status codes

## 🤝 Frontend Integration

The backend is designed to work seamlessly with the existing React frontend. Update your frontend API calls to point to:

```
http://localhost:8000/api
```

Make sure to include Firebase JWT tokens in all requests.