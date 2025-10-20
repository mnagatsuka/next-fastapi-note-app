"""DynamoDB implementation of notes repository."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import List, Tuple, Dict, Any, Optional
import boto3
from boto3.dynamodb.conditions import Key, Attr
from botocore.exceptions import ClientError

from app.domain.entities.note import Note, Author
from app.domain.ports.notes_repository import NotesRepository


class DynamoDBNotesRepository(NotesRepository):
    """DynamoDB implementation of NotesRepository."""
    
    def __init__(
        self,
        table_name: str,
        endpoint_url: Optional[str] = None,
        region_name: str = "ap-northeast-1",
        aws_access_key_id: Optional[str] = None,
        aws_secret_access_key: Optional[str] = None,
    ):
        """Initialize DynamoDB notes repository."""
        self.table_name = table_name
        
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
    
    async def list_public_notes(self, page: int, limit: int) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """Return list of public note dicts and pagination dict matching OpenAPI schema."""
        try:
            # Query using PublicNotesIndex GSI
            response = self.table.query(
                IndexName="PublicNotesIndex",
                KeyConditionExpression=Key("is_public").eq("true"),
                ScanIndexForward=False,  # Sort by published_at descending
            )
            items = response.get("Items", [])
            
            # Convert to Note entities then to dicts
            notes = [self._item_to_note(item) for item in items if item.get("is_public") == "true"]
            
            # Apply pagination
            total = len(notes)
            start = (page - 1) * limit
            end = start + limit
            page_notes = notes[start:end]
            
            # Convert to dict format
            note_dicts = [n.to_public_dict() for n in page_notes]
            
            pagination = {
                "page": page,
                "limit": limit,
                "total": total,
                "hasNext": end < total,
                "hasPrev": start > 0,
            }
            
            return note_dicts, pagination
            
        except ClientError as e:
            raise RuntimeError(f"Failed to list public notes: {e}")
    
    async def get_public_note(self, note_id: str) -> Optional[Dict[str, Any]]:
        """Return a single public note dict by id or None."""
        try:
            response = self.table.get_item(Key={"id": note_id})
            item = response.get("Item")
            if not item or item.get("is_public") != "true":
                return None
            
            note = self._item_to_note(item)
            return note.to_public_dict()
            
        except ClientError as e:
            raise RuntimeError(f"Failed to get public note: {e}")
    
    def _item_to_note(self, item: dict) -> Note:
        """Convert DynamoDB item to Note entity."""
        author = Author(
            id=item["author_id"],
            displayName=item["author_name"],
            avatarUrl=item.get("author_avatar_url", "")
        )
        
        return Note(
            id=item["id"],
            title=item["title"],
            content=item["content"],
            author=author,
            createdAt=datetime.fromisoformat(item["created_at"]),
            updatedAt=datetime.fromisoformat(item["updated_at"]),
            publishedAt=datetime.fromisoformat(item["published_at"]) if item.get("published_at") else None,
            owner_uid=item["owner_uid"],
            is_public=item.get("is_public") == "true",
        )
    
    def _note_to_item(self, note: Note) -> dict:
        """Convert Note entity to DynamoDB item."""
        item = {
            "id": note.id,
            "title": note.title,
            "content": note.content,
            "author_id": note.author.id,
            "author_name": note.author.displayName,
            "author_avatar_url": note.author.avatarUrl or "",
            "created_at": note.createdAt.isoformat(),
            "updated_at": note.updatedAt.isoformat(),
            "owner_uid": note.owner_uid,
            "is_public": "true" if note.is_public else "false",
        }
        
        if note.publishedAt:
            item["published_at"] = note.publishedAt.isoformat()
        
        return item
    
    async def get_notes_by_owner(self, owner_uid: str, page: int, limit: int) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """Return list of user's note dicts and pagination dict."""
        try:
            # Query using OwnerIndex GSI
            response = self.table.query(
                IndexName="OwnerIndex",
                KeyConditionExpression=Key("owner_uid").eq(owner_uid),
                ScanIndexForward=False,  # Sort by created_at descending
            )
            items = response.get("Items", [])
            
            # Convert to Note entities then to dicts
            notes = [self._item_to_note(item) for item in items]
            
            # Apply pagination
            total = len(notes)
            start = (page - 1) * limit
            end = start + limit
            page_notes = notes[start:end]
            
            # Convert to dict format
            note_dicts = [n.to_private_dict() for n in page_notes]
            
            pagination = {
                "page": page,
                "limit": limit,
                "total": total,
                "hasNext": end < total,
                "hasPrev": start > 0,
            }
            
            return note_dicts, pagination
            
        except ClientError as e:
            raise RuntimeError(f"Failed to get notes by owner: {e}")
    
    async def get_note_by_owner(self, note_id: str, owner_uid: str) -> Optional[Dict[str, Any]]:
        """Return a single note dict by id and owner or None."""
        try:
            response = self.table.get_item(Key={"id": note_id})
            item = response.get("Item")
            if not item or item.get("owner_uid") != owner_uid:
                return None
            
            note = self._item_to_note(item)
            return note.to_private_dict()
            
        except ClientError as e:
            raise RuntimeError(f"Failed to get note by owner: {e}")
    
    async def create_note(self, note: Note) -> None:
        """Create a new note."""
        try:
            item = self._note_to_item(note)
            self.table.put_item(Item=item)
        except ClientError as e:
            raise RuntimeError(f"Failed to create note: {e}")
    
    async def update_note(self, note: Note) -> None:
        """Update an existing note."""
        try:
            item = self._note_to_item(note)
            self.table.put_item(Item=item)
        except ClientError as e:
            raise RuntimeError(f"Failed to update note: {e}")
    
    async def delete_note(self, note_id: str, owner_uid: str) -> bool:
        """Delete a note by id and owner. Returns True if deleted, False if not found."""
        try:
            # First check if note exists and belongs to owner
            response = self.table.get_item(Key={"id": note_id})
            item = response.get("Item")
            if not item or item.get("owner_uid") != owner_uid:
                return False
            
            # Delete the note
            self.table.delete_item(Key={"id": note_id})
            return True
            
        except ClientError as e:
            raise RuntimeError(f"Failed to delete note: {e}")
    
    async def publish_note(self, note_id: str, owner_uid: str) -> bool:
        """Make a note public. Returns True if published, False if not found."""
        try:
            # Get current note
            response = self.table.get_item(Key={"id": note_id})
            item = response.get("Item")
            if not item or item.get("owner_uid") != owner_uid:
                return False
            
            # Update to public
            now = datetime.now(timezone.utc)
            self.table.update_item(
                Key={"id": note_id},
                UpdateExpression="SET is_public = :public, published_at = :published_at",
                ExpressionAttributeValues={
                    ":public": "true",
                    ":published_at": now.isoformat(),
                }
            )
            return True
            
        except ClientError as e:
            raise RuntimeError(f"Failed to publish note: {e}")
    
    async def unpublish_note(self, note_id: str, owner_uid: str) -> bool:
        """Make a note private. Returns True if unpublished, False if not found."""
        try:
            # Get current note
            response = self.table.get_item(Key={"id": note_id})
            item = response.get("Item")
            if not item or item.get("owner_uid") != owner_uid:
                return False
            
            # Update to private
            self.table.update_item(
                Key={"id": note_id},
                UpdateExpression="SET is_public = :public REMOVE published_at",
                ExpressionAttributeValues={
                    ":public": "false",
                }
            )
            return True
            
        except ClientError as e:
            raise RuntimeError(f"Failed to unpublish note: {e}")
    
    async def save_note(self, note: Note) -> None:
        """Save a note to DynamoDB (helper method for management)."""
        try:
            item = self._note_to_item(note)
            self.table.put_item(Item=item)
        except ClientError as e:
            raise RuntimeError(f"Failed to save note: {e}")
