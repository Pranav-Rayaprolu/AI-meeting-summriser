import json
import logging
import jwt
from typing import Optional
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from utils.config import settings
import os
import uuid

logger = logging.getLogger(__name__)

# Mock Firebase auth for development
class MockFirebaseAuth:
    def verify_id_token(self, token):
        # For development, return a mock user
        return {
            "uid": "dev-user-123",
            "email": "dev@example.com",
            "name": "Development User",
            "picture": None
        }

# Try to initialize Firebase Admin SDK, fallback to mock for development
try:
    import firebase_admin
    from firebase_admin import credentials, auth
    
    # Load the service account key from environment variable
    firebase_json = os.environ.get("FIREBASE_ADMIN_SDK_JSON")
    if not firebase_json:
        raise Exception("FIREBASE_ADMIN_SDK_JSON environment variable not set")
    service_account_info = json.loads(firebase_json)
    cred = credentials.Certificate(service_account_info)
    firebase_admin.initialize_app(cred)
    firebase_auth = auth
    logger.info("Firebase Admin SDK initialized successfully")
except Exception as e:
    logger.warning(f"Firebase Admin SDK not available, using mock auth: {e}")
    firebase_auth = MockFirebaseAuth()

security = HTTPBearer()

async def verify_firebase_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    Verify Firebase JWT token and return user information
    """
    try:
        token = credentials.credentials
        
        # In development mode, try to verify as a development JWT first
        if settings.DEVELOPMENT_MODE:
            try:
                decoded_token = jwt.decode(token, "dev-secret-key", algorithms=["HS256"])
                user_info = {
                    "user_id": decoded_token["user_id"],
                    "email": decoded_token["email"],
                    "name": decoded_token["name"],
                    "avatar_url": None
                }
                logger.info(f"Development token verified for user: {user_info['email']}")
                return user_info
            except jwt.InvalidTokenError:
                pass
        
        # Verify the token with Firebase
        decoded_token = firebase_auth.verify_id_token(token)
        # Convert Firebase uid to UUID
        user_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, decoded_token["uid"]))
        user_info = {
            "user_id": user_uuid,
            "email": decoded_token.get("email"),
            "name": decoded_token.get("name", decoded_token.get("email", "").split("@")[0]),
            "avatar_url": decoded_token.get("picture")
        }
        logger.info(f"Firebase token verified for user: {user_info['email']}")
        return user_info
        
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        # For development, return mock user
        if settings.DEVELOPMENT_MODE:
            return {
                "user_id": "dev-user-123",
                "email": "dev@example.com",
                "name": "Development User",
                "avatar_url": None
            }
        raise HTTPException(
            status_code=401,
            detail="Authentication failed"
        )

async def get_current_user(user_info: dict = Depends(verify_firebase_token)) -> dict:
    """
    Get current authenticated user
    """
    return user_info