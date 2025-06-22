import logging
import uuid
from datetime import datetime, date
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from models.database import (
    get_db, User, Meeting, MeetingSummary, ActionItem,
    MeetingResponse, SummaryResponse, MeetingRead
)
from auth.firebase_jwt import get_current_user
from tasks.summary_worker import process_meeting_summary
from utils.file_parser import parse_uploaded_file

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/meetings/upload", response_model=MeetingRead)
async def upload_meeting(
    title: str = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    print("✅ upload_meeting called")
    print("📌 Title:", title)
    print("📌 File:", file.filename)
    print("👤 Current User:", current_user["user_id"])

    # Read file content
    content = await file.read()
    
    # Get file extension
    file_extension = file.filename.split('.')[-1].lower() if '.' in file.filename else ''
    
    # Parse the file content
    try:
        transcript = await parse_uploaded_file(content, file_extension)
    except Exception as e:
        logger.error(f"Error parsing file: {e}")
        raise HTTPException(status_code=400, detail=f"Error parsing file: {str(e)}")

    new_meeting = Meeting(
        meeting_id=str(uuid.uuid4()),
        user_id=current_user["user_id"],
        title=title,
        transcript=transcript,
        status="queued",
        created_at=datetime.utcnow(),
    )
    db.add(new_meeting)
    await db.commit()
    await db.refresh(new_meeting)

    # Start background task
    process_meeting_summary.delay(new_meeting.meeting_id)

    return new_meeting


@router.get("/meeting/{meeting_id}/summary", response_model=SummaryResponse)
async def get_meeting_summary(
    meeting_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        result = await db.execute(
            select(Meeting)
            .options(selectinload(Meeting.summary))
            .where(
                Meeting.meeting_id == meeting_id,
                Meeting.user_id == current_user["user_id"]
            )
        )
        meeting = result.scalar_one_or_none()
        
        if not meeting:
            raise HTTPException(status_code=404, detail="Meeting not found")
        
        if not meeting.summary:
            if meeting.status == "processing":
                raise HTTPException(status_code=202, detail="Meeting is still being processed. Please try again later.")
            elif meeting.status == "failed":
                raise HTTPException(status_code=500, detail="Meeting processing failed. Please try uploading again.")
            else:
                raise HTTPException(status_code=404, detail="Summary not found")
        
        return SummaryResponse(
            summary_id=str(meeting.summary.summary_id),
            summary=meeting.summary.summary,
            generated_at=meeting.summary.generated_at
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting meeting summary: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/meeting/{meeting_id}/action-items")
async def get_meeting_action_items(
    meeting_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        meeting_result = await db.execute(
            select(Meeting).where(
                Meeting.meeting_id == meeting_id,
                Meeting.user_id == current_user["user_id"]
            )
        )
        meeting = meeting_result.scalar_one_or_none()
        
        if not meeting:
            raise HTTPException(status_code=404, detail="Meeting not found")
        
        result = await db.execute(
            select(ActionItem).where(ActionItem.meeting_id == meeting_id)
        )
        action_items = result.scalars().all()
        
        return [
            {
                "action_id": str(item.action_id),
                "description": item.description,
                "owner": item.owner,
                "deadline": item.deadline.isoformat(),
                "status": item.status,
                "priority": item.priority,
                "notes": item.notes,
                "created_at": item.created_at.isoformat() if item.created_at else None,
                "updated_at": item.updated_at.isoformat() if item.updated_at else None,
            }
            for item in action_items
        ]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting action items: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/meeting/{meeting_id}/action-items")
async def create_meeting_action_item(
    meeting_id: str,
    data: dict = Body(...),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Manually create an action item for a meeting
    """
    try:
        # Check meeting ownership
        result = await db.execute(
            select(Meeting).where(
                Meeting.meeting_id == meeting_id,
                Meeting.user_id == current_user["user_id"]
            )
        )
        meeting = result.scalar_one_or_none()
        if not meeting:
            raise HTTPException(status_code=404, detail="Meeting not found or not authorized")

        # Validate required fields
        if not data.get("description") or not data.get("owner") or not data.get("deadline"):
            raise HTTPException(status_code=400, detail="Missing required fields")

        new_action = ActionItem(
            meeting_id=meeting_id,
            description=data["description"],
            owner=data["owner"],
            deadline=date.fromisoformat(data["deadline"]),
            status=data.get("status", "pending"),
            priority=data.get("priority", "medium"),
            notes=data.get("notes"),
        )
        db.add(new_action)
        await db.commit()
        await db.refresh(new_action)
        return {
            "action_id": str(new_action.action_id),
            "meeting_id": str(new_action.meeting_id),
            "description": new_action.description,
            "owner": new_action.owner,
            "deadline": new_action.deadline.isoformat(),
            "status": new_action.status,
            "priority": new_action.priority,
            "notes": new_action.notes,
            "created_at": new_action.created_at.isoformat() if new_action.created_at else None,
            "updated_at": new_action.updated_at.isoformat() if new_action.updated_at else None,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating action item: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/meetings", response_model=List[MeetingResponse])
async def get_user_meetings(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        result = await db.execute(
            select(Meeting)
            .where(Meeting.user_id == current_user["user_id"])
            .order_by(Meeting.created_at.desc())
        )
        meetings = result.scalars().all()

        return [
            MeetingResponse(
                meeting_id=str(meeting.meeting_id),
                title=meeting.title,
                status=meeting.status,
                created_at=meeting.created_at
            )
            for meeting in meetings
        ]
    except Exception as e:
        logger.error(f"Error getting user meetings: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
