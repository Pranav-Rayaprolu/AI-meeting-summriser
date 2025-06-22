import logging
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from models.database import get_db, ActionItem, Meeting, ActionItemUpdate
from auth.firebase_jwt import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter()

@router.put("/action-items/{action_id}")
async def update_action_item(
    action_id: str,
    update_data: ActionItemUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update an action item
    """
    try:
        # Get action item with meeting to verify ownership
        result = await db.execute(
            select(ActionItem, Meeting)
            .join(Meeting, ActionItem.meeting_id == Meeting.meeting_id)
            .where(
                ActionItem.action_id == action_id,
                Meeting.user_id == current_user["user_id"]
            )
        )
        action_item_data = result.first()
        
        if not action_item_data:
            raise HTTPException(status_code=404, detail="Action item not found")
        
        action_item, meeting = action_item_data
        
        # Update fields
        update_dict = update_data.dict(exclude_unset=True)
        
        for field, value in update_dict.items():
            if hasattr(action_item, field):
                setattr(action_item, field, value)
        
        # Update timestamp
        action_item.updated_at = datetime.utcnow()
        
        # If status changed to completed, record completion time
        if update_data.status == "completed" and action_item.status != "completed":
            action_item.completion_time = datetime.utcnow() - action_item.created_at
        
        await db.commit()
        await db.refresh(action_item)
        
        return {
            "action_id": str(action_item.action_id),
            "description": action_item.description,
            "owner": action_item.owner,
            "deadline": action_item.deadline.isoformat(),
            "status": action_item.status,
            "priority": action_item.priority,
            "notes": action_item.notes,
            "created_at": action_item.created_at.isoformat(),
            "updated_at": action_item.updated_at.isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating action item: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/action-items")
async def get_user_action_items(
    status: str = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all action items for the current user, optionally filtered by status
    """
    try:
        query = (
            select(ActionItem, Meeting)
            .join(Meeting, ActionItem.meeting_id == Meeting.meeting_id)
            .where(Meeting.user_id == current_user["user_id"])
        )
        
        if status:
            query = query.where(ActionItem.status == status)
        
        query = query.order_by(ActionItem.deadline.asc())
        
        result = await db.execute(query)
        action_items_data = result.all()
        
        return [
            {
                "action_id": str(action_item.action_id),
                "meeting_id": str(action_item.meeting_id),
                "meeting_title": meeting.title,
                "description": action_item.description,
                "owner": action_item.owner,
                "deadline": action_item.deadline.isoformat(),
                "status": action_item.status,
                "priority": action_item.priority,
                "notes": action_item.notes,
                "created_at": action_item.created_at.isoformat(),
                "updated_at": action_item.updated_at.isoformat()
            }
            for action_item, meeting in action_items_data
        ]
        
    except Exception as e:
        logger.error(f"Error getting user action items: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/action-items/{action_id}")
async def delete_action_item(
    action_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete an action item if the current user owns the parent meeting
    """
    try:
        # Get action item with meeting to verify ownership
        result = await db.execute(
            select(ActionItem, Meeting)
            .join(Meeting, ActionItem.meeting_id == Meeting.meeting_id)
            .where(
                ActionItem.action_id == action_id,
                Meeting.user_id == current_user["user_id"]
            )
        )
        action_item_data = result.first()
        
        if not action_item_data:
            raise HTTPException(status_code=404, detail="Action item not found or not authorized")
        
        action_item, meeting = action_item_data
        await db.delete(action_item)
        await db.commit()
        return {"detail": "Action item deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting action item: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")