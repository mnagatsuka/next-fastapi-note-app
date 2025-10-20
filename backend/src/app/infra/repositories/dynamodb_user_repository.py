"""DynamoDB implementation of user repository."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Dict, Any, Optional
import boto3
from boto3.dynamodb.conditions import Key, Attr
from botocore.exceptions import ClientError

from app.domain.ports.user_repository import UserRepository
from app.shared.logger import get_logger


class DynamoDBUserRepository(UserRepository):
    """DynamoDB implementation of UserRepository."""
    
    def __init__(
        self,
        table_name: str,
        endpoint_url: Optional[str] = None,
        region_name: str = "ap-northeast-1",
        aws_access_key_id: Optional[str] = None,
        aws_secret_access_key: Optional[str] = None,
    ):
        """Initialize DynamoDB user repository."""
        self.table_name = table_name
        self._log = get_logger("app.repo.users.dynamodb")
        
        # Configure boto3 session
        session_kwargs = {"region_name": region_name}
        if aws_access_key_id and aws_secret_access_key:
            session_kwargs.update({
                "aws_access_key_id": aws_access_key_id,
                "aws_secret_access_key": aws_secret_access_key,
            })
        
        session = boto3.Session(**session_kwargs)
        
        # Configure DynamoDB resource
        dynamodb_kwargs = {}
        if endpoint_url:
            dynamodb_kwargs["endpoint_url"] = endpoint_url
            
        self.dynamodb = session.resource("dynamodb", **dynamodb_kwargs)
        self.table = self.dynamodb.Table(table_name)
    
    async def get(self, uid: str) -> Optional[Dict[str, Any]]:
        """Get user profile by UID."""
        try:
            self._log.info("repo.get", extra={"uid": uid, "table": self.table_name})
            response = self.table.get_item(Key={"uid": uid})
            item = response.get("Item")
            found = item is not None
            self._log.info("repo.get.result", extra={"uid": uid, "found": found})
            return item if item else None
            
        except ClientError as e:
            raise RuntimeError(f"Failed to get user profile: {e}")
    
    async def upsert(self, profile: Dict[str, Any]) -> Dict[str, Any]:
        """Insert or update user profile."""
        try:
            # Add timestamps
            now = datetime.now(timezone.utc).isoformat()
            profile = profile.copy()
            # Add createdAt if new user, always update updatedAt
            is_new = "createdAt" not in profile
            if is_new:
                profile["createdAt"] = now
            profile["updatedAt"] = now
            self._log.info(
                "repo.upsert",
                extra={"uid": profile.get("uid"), "new": is_new, "table": self.table_name},
            )
            self.table.put_item(Item=profile)
            return profile
            
        except ClientError as e:
            raise RuntimeError(f"Failed to upsert user profile: {e}")
    
    async def update(self, uid: str, patch: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update user profile with partial data."""
        try:
            # First, get existing profile
            self._log.info("repo.update: fetch", extra={"uid": uid, "table": self.table_name})
            response = self.table.get_item(Key={"uid": uid})
            item = response.get("Item")
            
            if not item:
                self._log.info("repo.update: not_found", extra={"uid": uid})
                return None
            
            # Merge patch with existing data
            now = datetime.now(timezone.utc).isoformat()
            updated_profile = {**item, **patch, "updatedAt": now}
            
            # Save updated profile
            self._log.info("repo.update: put", extra={"uid": uid})
            self.table.put_item(Item=updated_profile)
            return updated_profile
            
        except ClientError as e:
            raise RuntimeError(f"Failed to update user profile: {e}")
