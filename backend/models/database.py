import uuid
from datetime import datetime, date
from typing import Optional, List
from sqlalchemy.orm import sessionmaker
from sqlalchemy import Column, String, Text, DateTime, Date, Integer, ForeignKey, Interval
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.dialects.sqlite import CHAR
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from pydantic import BaseModel
from utils.config import settings

Base = declarative_base()

# Create async engine
engine = create_async_engine(settings.DATABASE_URL, echo=True)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

# Use appropriate UUID type based on database
def get_uuid_column():
    if "sqlite" in settings.DATABASE_URL:
        return Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    else:
        return Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

def get_uuid_fk(table_column):
    if "sqlite" in settings.DATABASE_URL:
        return Column(CHAR(36), ForeignKey(table_column), nullable=False)
    else:
        return Column(UUID(as_uuid=True), ForeignKey(table_column), nullable=False)

# SQLAlchemy Models
class User(Base):
    __tablename__ = "users"
    
    user_id = get_uuid_column()
    email = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    meetings = relationship("Meeting", back_populates="user")

class Meeting(Base):
    __tablename__ = "meetings"
    
    meeting_id = get_uuid_column()
    user_id = get_uuid_fk("users.user_id")
    title = Column(String, nullable=False)
    transcript = Column(Text, nullable=False)
    status = Column(String, default="processing")  # processing, completed, failed
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="meetings")
    summary = relationship("MeetingSummary", back_populates="meeting", uselist=False)
    action_items = relationship("ActionItem", back_populates="meeting")
    keywords = relationship("MeetingKeyword", back_populates="meeting")

class MeetingSummary(Base):
    __tablename__ = "meeting_summaries"
    
    summary_id = get_uuid_column()
    meeting_id = get_uuid_fk("meetings.meeting_id")
    summary = Column(Text, nullable=False)
    generated_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    meeting = relationship("Meeting", back_populates="summary")

class ActionItem(Base):
    __tablename__ = "action_items"
    
    action_id = get_uuid_column()
    meeting_id = get_uuid_fk("meetings.meeting_id")
    description = Column(Text, nullable=False)
    owner = Column(String, nullable=False)
    deadline = Column(Date, nullable=False)
    status = Column(String, default="pending")  # pending, in-progress, completed
    priority = Column(String, default="medium")  # low, medium, high
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completion_time = Column(Interval, nullable=True)
    
    # Relationships
    meeting = relationship("Meeting", back_populates="action_items")

class MeetingKeyword(Base):
    __tablename__ = "meeting_keywords"
    
    keyword_id = get_uuid_column()
    meeting_id = get_uuid_fk("meetings.meeting_id")
    keyword = Column(String, nullable=False)
    frequency = Column(Integer, default=1)
    
    # Relationships
    meeting = relationship("Meeting", back_populates="keywords")

# Pydantic Models for API
class UserCreate(BaseModel):
    email: str
    name: str
    avatar_url: Optional[str] = None

class UserResponse(BaseModel):
    user_id: str
    email: str
    name: str
    avatar_url: Optional[str]
    created_at: datetime

class MeetingCreate(BaseModel):
    title: str
    transcript: str

class MeetingResponse(BaseModel):
    meeting_id: str
    title: str
    status: str
    created_at: datetime

class MeetingRead(BaseModel):
    meeting_id: str
    user_id: str
    title: str
    transcript: str
    status: str
    created_at: datetime

class SummaryResponse(BaseModel):
    summary_id: str
    summary: str
    generated_at: datetime

class ActionItemCreate(BaseModel):
    description: str
    owner: str
    deadline: date
    priority: str = "medium"

class ActionItemUpdate(BaseModel):
    status: Optional[str] = None
    deadline: Optional[date] = None
    owner: Optional[str] = None
    notes: Optional[str] = None
    priority: Optional[str] = None

class ActionItemResponse(BaseModel):
    action_id: str
    description: str
    owner: str
    deadline: date
    status: str
    priority: str
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

class AnalyticsResponse(BaseModel):
    total_meetings: int
    completed_tasks: int
    pending_tasks: int
    overdue_tasks: int
    recurring_keywords: List[dict]

# Database dependency
async def get_db() -> AsyncSession:
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()