import logging
import asyncio
import uuid
from datetime import datetime, date, timedelta
from typing import Dict
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from models.database import Meeting, MeetingSummary, ActionItem, MeetingKeyword
from services.langchain_llm import llm_service
from utils.config import settings

logger = logging.getLogger(__name__)

# For development, we'll use a simple async function instead of Celery
async def process_meeting_summary_async(meeting_id: str) -> Dict:
    """
    Process meeting transcript and generate summary + action items
    """
    try:
        logger.info(f"Starting processing for meeting {meeting_id}")
        
        # Create async database session
        engine = create_async_engine(settings.DATABASE_URL, echo=True)
        async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        
        async with async_session() as session:
            # Get meeting from database
            result = await session.execute(
                select(Meeting).where(Meeting.meeting_id == meeting_id)
            )
            meeting = result.scalar_one_or_none()
            
            if not meeting:
                raise ValueError(f"Meeting {meeting_id} not found")
            
            # Update status to processing
            meeting.status = "processing"
            await session.commit()
            
            # Process transcript with LLM
            llm_result = await llm_service.process_transcript(meeting.transcript)
            
            # Save summary
            summary = MeetingSummary(
                meeting_id=meeting_id,
                summary=llm_result["summary"],
                generated_at=datetime.utcnow()
            )
            session.add(summary)
            
            # Save action items
            for item_data in llm_result["action_items"]:
                try:
                    deadline_date = datetime.strptime(item_data["deadline"], "%Y-%m-%d").date()
                except:
                    # Fallback to 7 days from now if date parsing fails
                    deadline_date = (datetime.now() + timedelta(days=7)).date()
                
                action_item = ActionItem(
                    meeting_id=meeting_id,
                    description=item_data["description"],
                    owner=item_data["owner"],
                    deadline=deadline_date,
                    priority=item_data.get("priority", "medium"),
                    status="pending"
                )
                session.add(action_item)
            
            # Extract and save keywords
            await _extract_keywords(session, meeting_id, meeting.transcript)
            
            # Update meeting status to completed
            meeting.status = "completed"
            
            await session.commit()
            
            logger.info(f"Successfully processed meeting {meeting_id}")
            
            return {
                "meeting_id": meeting_id,
                "status": "completed",
                "summary_generated": True,
                "action_items_count": len(llm_result["action_items"])
            }
            
    except Exception as e:
        logger.error(f"Error processing meeting {meeting_id}: {e}")
        
        # Update meeting status to failed
        try:
            async with async_session() as session:
                result = await session.execute(
                    select(Meeting).where(Meeting.meeting_id == meeting_id)
                )
                meeting = result.scalar_one_or_none()
                
                if meeting:
                    meeting.status = "failed"
                    await session.commit()
        except:
            pass
        
        raise e

async def _extract_keywords(session: AsyncSession, meeting_id: str, transcript: str):
    """Extract keywords from transcript"""
    try:
        # Simple keyword extraction (can be enhanced with NLP)
        words = transcript.lower().split()
        
        # Common meeting keywords
        important_keywords = [
            "planning", "development", "testing", "deployment", "review",
            "budget", "timeline", "deadline", "milestone", "feature",
            "bug", "issue", "requirement", "specification", "design"
        ]
        
        keyword_counts = {}
        for word in words:
            clean_word = word.strip(".,!?;:")
            if clean_word in important_keywords:
                keyword_counts[clean_word] = keyword_counts.get(clean_word, 0) + 1
        
        # Save top keywords
        for keyword, frequency in sorted(keyword_counts.items(), key=lambda x: x[1], reverse=True)[:10]:
            if frequency > 1:  # Only save keywords that appear more than once
                keyword_obj = MeetingKeyword(
                    meeting_id=meeting_id,
                    keyword=keyword,
                    frequency=frequency
                )
                session.add(keyword_obj)
                
    except Exception as e:
        logger.error(f"Failed to extract keywords: {e}")

# Mock Celery task for development
class MockTask:
    def __init__(self, func):
        self.func = func
        self.id = str(uuid.uuid4())
    
    def delay(self, *args, **kwargs):
        # In development, schedule the task to run in the background
        import asyncio
        try:
            # Get the current event loop
            loop = asyncio.get_running_loop()
            # Create a task that will run in the background
            task = loop.create_task(self.func(*args, **kwargs))
            return MockTaskResult(task)
        except RuntimeError:
            # If no event loop is running, create a new one
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                result = loop.run_until_complete(self.func(*args, **kwargs))
                return MockTaskResult(result)
            finally:
                loop.close()

class MockTaskResult:
    def __init__(self, result_or_task):
        self.result_or_task = result_or_task
        self.id = str(uuid.uuid4())
    
    @property
    def result(self):
        if hasattr(self.result_or_task, 'result'):
            return self.result_or_task.result
        return self.result_or_task

# Create mock task
process_meeting_summary = MockTask(process_meeting_summary_async)