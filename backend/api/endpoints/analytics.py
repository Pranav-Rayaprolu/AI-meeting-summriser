import logging
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from models.database import get_db, Meeting, ActionItem, MeetingKeyword
from auth.firebase_jwt import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/analytics")
async def get_user_analytics(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get analytics for a user
    """
    try:
        user_id = current_user["user_id"]
        # Get total meetings
        meetings_result = await db.execute(
            select(func.count(Meeting.meeting_id))
            .where(Meeting.user_id == user_id)
        )
        total_meetings = meetings_result.scalar() or 0
        
        # Get action item statistics
        action_items_result = await db.execute(
            select(ActionItem.status, func.count(ActionItem.action_id))
            .join(Meeting, ActionItem.meeting_id == Meeting.meeting_id)
            .where(Meeting.user_id == user_id)
            .group_by(ActionItem.status)
        )
        action_stats = {status: count for status, count in action_items_result.all()}
        
        completed_tasks = action_stats.get("completed", 0)
        pending_tasks = action_stats.get("pending", 0)
        in_progress_tasks = action_stats.get("in-progress", 0)
        
        # Get overdue tasks
        today = datetime.now().date()
        overdue_result = await db.execute(
            select(func.count(ActionItem.action_id))
            .join(Meeting, ActionItem.meeting_id == Meeting.meeting_id)
            .where(
                and_(
                    Meeting.user_id == user_id,
                    ActionItem.deadline < today,
                    ActionItem.status != "completed"
                )
            )
        )
        overdue_tasks = overdue_result.scalar() or 0
        
        # Get recurring keywords
        keywords_result = await db.execute(
            select(MeetingKeyword.keyword, func.sum(MeetingKeyword.frequency))
            .join(Meeting, MeetingKeyword.meeting_id == Meeting.meeting_id)
            .where(Meeting.user_id == user_id)
            .group_by(MeetingKeyword.keyword)
            .order_by(func.sum(MeetingKeyword.frequency).desc())
            .limit(10)
        )
        recurring_keywords = [
            {"keyword": keyword, "frequency": frequency}
            for keyword, frequency in keywords_result.all()
        ]
        
        # Get meeting trends (last 30 days)
        thirty_days_ago = datetime.now() - timedelta(days=30)
        trends_result = await db.execute(
            select(
                func.date(Meeting.created_at).label("date"),
                func.count(Meeting.meeting_id).label("meetings")
            )
            .where(
                and_(
                    Meeting.user_id == user_id,
                    Meeting.created_at >= thirty_days_ago
                )
            )
            .group_by(func.date(Meeting.created_at))
            .order_by(func.date(Meeting.created_at))
        )
        meeting_trends = [
            {"date": str(date), "meetings": count}
            for date, count in trends_result.all()
        ]
        
        # Calculate task completion rate
        total_tasks = completed_tasks + pending_tasks + in_progress_tasks
        completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
        
        # Calculate average tasks per meeting
        avg_tasks_per_meeting = total_tasks / total_meetings if total_meetings > 0 else 0
        
        return {
            "total_meetings": total_meetings,
            "completed_tasks": completed_tasks,
            "pending_tasks": pending_tasks,
            "in_progress_tasks": in_progress_tasks,
            "overdue_tasks": overdue_tasks,
            "task_completion_rate": round(completion_rate, 2),
            "avg_tasks_per_meeting": round(avg_tasks_per_meeting, 2),
            "recurring_keywords": recurring_keywords,
            "meeting_trends": meeting_trends
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user analytics: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/analytics/dashboard")
async def get_dashboard_analytics(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get dashboard analytics for the current user
    """
    try:
        user_id = current_user["user_id"]
        
        # Get recent meetings (last 7 days)
        seven_days_ago = datetime.now() - timedelta(days=7)
        recent_meetings_result = await db.execute(
            select(func.count(Meeting.meeting_id))
            .where(
                and_(
                    Meeting.user_id == user_id,
                    Meeting.created_at >= seven_days_ago
                )
            )
        )
        recent_meetings = recent_meetings_result.scalar() or 0
        
        # Get upcoming deadlines (next 7 days)
        next_week = datetime.now().date() + timedelta(days=7)
        upcoming_deadlines_result = await db.execute(
            select(func.count(ActionItem.action_id))
            .join(Meeting, ActionItem.meeting_id == Meeting.meeting_id)
            .where(
                and_(
                    Meeting.user_id == user_id,
                    ActionItem.deadline <= next_week,
                    ActionItem.status != "completed"
                )
            )
        )
        upcoming_deadlines = upcoming_deadlines_result.scalar() or 0
        
        # Get productivity score (completion rate for last 30 days)
        thirty_days_ago = datetime.now() - timedelta(days=30)
        recent_action_items_result = await db.execute(
            select(ActionItem.status, func.count(ActionItem.action_id))
            .join(Meeting, ActionItem.meeting_id == Meeting.meeting_id)
            .where(
                and_(
                    Meeting.user_id == user_id,
                    ActionItem.created_at >= thirty_days_ago
                )
            )
            .group_by(ActionItem.status)
        )
        recent_stats = {status: count for status, count in recent_action_items_result.all()}
        
        recent_completed = recent_stats.get("completed", 0)
        recent_total = sum(recent_stats.values())
        productivity_score = (recent_completed / recent_total * 100) if recent_total > 0 else 0
        
        return {
            "recent_meetings": recent_meetings,
            "upcoming_deadlines": upcoming_deadlines,
            "productivity_score": round(productivity_score, 1),
            "period": "last_7_days"
        }
        
    except Exception as e:
        logger.error(f"Error getting dashboard analytics: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")