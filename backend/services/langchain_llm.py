import logging
import json
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel, Field
import httpx
from utils.config import settings

logger = logging.getLogger(__name__)

# Output schema for LLM response
class ActionItemSchema(BaseModel):
    description: str = Field(description="Description of the action item")
    owner: str = Field(description="Person responsible for the action item")
    deadline: str = Field(description="Deadline in YYYY-MM-DD format")
    priority: str = Field(description="Priority level: low, medium, or high", default="medium")

class MeetingSummarySchema(BaseModel):
    summary: str = Field(description="5-bullet point summary of the meeting")
    action_items: List[ActionItemSchema] = Field(description="List of action items extracted from the meeting")

class LangChainLLMService:
    def __init__(self):
        self.groq_available = bool(settings.GROQ_API_KEY and settings.GROQ_API_KEY != "your-groq-key")
        self.google_available = bool(settings.GOOGLE_API_KEY and settings.GOOGLE_API_KEY != "your-google-key")
        
        logger.info(f"LLM Service initialized - Groq: {self.groq_available}, Google: {self.google_available}")

    async def process_transcript(self, transcript: str) -> Dict:
        """
        Process meeting transcript using LLM APIs with fallback to mock data
        """
        if not transcript or len(transcript.strip()) < 50:
            raise ValueError("Transcript is too short or empty")

        # Try Groq first
        if self.groq_available:
            try:
                logger.info("Attempting to process transcript with Groq LLM")
                result = await self._call_groq_api(transcript)
                if result:
                    logger.info("Successfully processed transcript with Groq LLM")
                    return result
            except Exception as e:
                logger.error(f"Groq LLM failed: {e}")

        # Fallback to Google
        if self.google_available:
            try:
                logger.info("Attempting to process transcript with Google LLM")
                result = await self._call_google_api(transcript)
                if result:
                    logger.info("Successfully processed transcript with Google LLM")
                    return result
            except Exception as e:
                logger.error(f"Google LLM failed: {e}")

        # If both fail or not available, return mock data for development
        logger.warning("LLM APIs not available or failed, returning mock data")
        return self._generate_mock_response(transcript)

    async def _call_groq_api(self, transcript: str) -> Optional[Dict]:
        """Call Groq API directly"""
        try:
            prompt = self._create_prompt(transcript)
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "llama3-8b-8192",
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": 0.1,
                        "max_tokens": 2048
                    },
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    content = result["choices"][0]["message"]["content"]
                    return self._parse_llm_response(content)
                else:
                    logger.error(f"Groq API error: {response.status_code} - {response.text}")
                    return None
                    
        except Exception as e:
            logger.error(f"Groq API call failed: {e}")
            return None

    async def _call_google_api(self, transcript: str) -> Optional[Dict]:
        """Call Google AI Studio API directly"""
        try:
            prompt = self._create_prompt(transcript)
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key={settings.GOOGLE_API_KEY}",
                    headers={"Content-Type": "application/json"},
                    json={
                        "contents": [{"parts": [{"text": prompt}]}],
                        "generationConfig": {
                            "temperature": 0.1,
                            "maxOutputTokens": 2048
                        }
                    },
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    content = result["candidates"][0]["content"]["parts"][0]["text"]
                    return self._parse_llm_response(content)
                else:
                    logger.error(f"Google API error: {response.status_code} - {response.text}")
                    return None
                    
        except Exception as e:
            logger.error(f"Google API call failed: {e}")
            return None

    def _create_prompt(self, transcript: str) -> str:
        """Create structured prompt for LLM"""
        today = datetime.now().strftime("%Y-%m-%d")
        
        return f"""
You are an AI meeting assistant. Analyze the following meeting transcript and provide:

1. A concise 5-bullet point summary of the key discussion points
2. Extract all action items with clear owners and realistic deadlines

Please format your response as JSON with the following structure:
{{
  "summary": "• Point 1\\n• Point 2\\n• Point 3\\n• Point 4\\n• Point 5",
  "action_items": [
    {{
      "description": "Action item description",
      "owner": "Person or team responsible",
      "deadline": "YYYY-MM-DD",
      "priority": "low|medium|high"
    }}
  ]
}}

Meeting Transcript:
{transcript[:4000]}

Important guidelines:
- Make summaries clear and actionable
- Assign realistic deadlines (1-30 days from today: {today})
- If no specific owner is mentioned, use "Team" or infer from context
- Prioritize action items as low, medium, or high based on urgency
- Ensure all dates are in YYYY-MM-DD format

Response:
"""

    def _parse_llm_response(self, content: str) -> Dict:
        """Parse LLM response and extract structured data"""
        try:
            # Try to extract JSON from the response
            start_idx = content.find('{')
            end_idx = content.rfind('}') + 1
            
            if start_idx != -1 and end_idx != -1:
                json_str = content[start_idx:end_idx]
                parsed = json.loads(json_str)
                
                # Validate structure
                if "summary" in parsed and "action_items" in parsed:
                    return parsed
            
            # If JSON parsing fails, try to extract manually
            return self._extract_manually(content)
            
        except Exception as e:
            logger.error(f"Failed to parse LLM response: {e}")
            return None

    def _extract_manually(self, content: str) -> Dict:
        """Manually extract summary and action items from text"""
        lines = content.split('\n')
        summary_lines = []
        action_items = []
        
        current_section = None
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            if 'summary' in line.lower():
                current_section = 'summary'
                continue
            elif 'action' in line.lower():
                current_section = 'action_items'
                continue
            
            if current_section == 'summary' and line.startswith('•'):
                summary_lines.append(line)
            elif current_section == 'action_items' and line.startswith('•'):
                # Simple action item extraction
                action_items.append({
                    "description": line.replace('•', '').strip(),
                    "owner": "Team",
                    "deadline": (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d"),
                    "priority": "medium"
                })
        
        return {
            "summary": '\n'.join(summary_lines) if summary_lines else "Summary not available",
            "action_items": action_items
        }

    def _generate_mock_response(self, transcript: str) -> Dict:
        """Generate mock response for development/fallback"""
        # Extract some keywords for realistic mock data
        words = transcript.lower().split()
        common_topics = ["planning", "development", "testing", "review", "deployment", "meeting", "project"]
        found_topics = [topic for topic in common_topics if topic in words]
        
        if not found_topics:
            found_topics = ["planning", "development"]

        # Generate realistic deadlines
        base_date = datetime.now()
        deadlines = [
            (base_date + timedelta(days=3)).strftime("%Y-%m-%d"),
            (base_date + timedelta(days=7)).strftime("%Y-%m-%d"),
            (base_date + timedelta(days=14)).strftime("%Y-%m-%d")
        ]

        return {
            "summary": f"""• Discussion focused on {found_topics[0]} and project coordination
• Team reviewed current progress and identified key blockers
• Resource allocation and timeline adjustments were discussed
• Next steps and deliverables were clearly defined
• Follow-up meetings scheduled to track progress""",
            "action_items": [
                {
                    "description": f"Complete {found_topics[0]} documentation and review",
                    "owner": "Development Team",
                    "deadline": deadlines[0],
                    "priority": "high"
                },
                {
                    "description": "Schedule follow-up meeting with stakeholders",
                    "owner": "Project Manager",
                    "deadline": deadlines[1],
                    "priority": "medium"
                },
                {
                    "description": f"Prepare {found_topics[-1]} status report",
                    "owner": "Team Lead",
                    "deadline": deadlines[2],
                    "priority": "medium"
                }
            ]
        }

# Create singleton instance
llm_service = LangChainLLMService()