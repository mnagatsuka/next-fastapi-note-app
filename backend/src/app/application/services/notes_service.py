from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any, Tuple, List, Literal

from app.domain.entities.note import Note, Author
from app.domain.ports.notes_repository import NotesRepository
from app.shared.auth import UserContext


class NotesApplicationService:
    def __init__(self, notes_repository: NotesRepository):
        self.notes_repository = notes_repository

    async def list_public_notes(self, page: int, limit: int, sort: Literal["latest"]) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """List public notes with pagination."""
        return await self.notes_repository.list_public_notes(page, limit)

    async def get_public_note(self, note_id: str) -> Optional[Dict[str, Any]]:
        """Get a single public note by ID."""
        return await self.notes_repository.get_public_note(note_id)

    async def list_my_notes(self, owner_uid: str, page: int, limit: int) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """List user's notes (both public and private) with pagination."""
        return await self.notes_repository.get_notes_by_owner(owner_uid, page, limit)

    async def get_my_note(self, owner_uid: str, note_id: str) -> Optional[Dict[str, Any]]:
        """Get a single note by ID and owner."""
        return await self.notes_repository.get_note_by_owner(note_id, owner_uid)

    async def create_my_note(self, owner_uid: str, title: str, content: str) -> Dict[str, Any]:
        """Create a new private note."""
        now = datetime.now(timezone.utc)
        note_id = str(uuid.uuid4())
        
        # For now, create a simple author from owner_uid
        # In a real implementation, you'd fetch user details
        author = Author(
            id=owner_uid,
            displayName=f"User {owner_uid[:8]}",  # Temporary display name
            avatarUrl=None
        )
        
        note = Note(
            id=note_id,
            title=title,
            content=content,
            author=author,
            createdAt=now,
            updatedAt=now,
            publishedAt=None,
            owner_uid=owner_uid,
            is_public=False,
        )
        
        await self.notes_repository.create_note(note)
        return note.to_private_dict()

    async def update_my_note(self, owner_uid: str, note_id: str, title: Optional[str], content: Optional[str]) -> Optional[Dict[str, Any]]:
        """Update an existing note."""
        # Get current note
        current_note_dict = await self.notes_repository.get_note_by_owner(note_id, owner_uid)
        if not current_note_dict:
            return None
        
        # Create updated note entity
        # First, we need to reconstruct the current note as an entity
        author = Author(
            id=owner_uid,
            displayName=f"User {owner_uid[:8]}",
            avatarUrl=None
        )
        
        now = datetime.now(timezone.utc)
        updated_note = Note(
            id=note_id,
            title=title if title is not None else current_note_dict["title"],
            content=content if content is not None else current_note_dict["content"],
            author=author,
            createdAt=datetime.fromisoformat(current_note_dict["createdAt"].replace("Z", "+00:00")),
            updatedAt=now,
            publishedAt=datetime.fromisoformat(current_note_dict["publishedAt"].replace("Z", "+00:00")) if current_note_dict.get("publishedAt") else None,
            owner_uid=owner_uid,
            is_public=current_note_dict.get("isPublic", False),
        )
        
        await self.notes_repository.update_note(updated_note)
        return updated_note.to_private_dict()

    async def delete_my_note(self, owner_uid: str, note_id: str) -> bool:
        """Delete a note."""
        return await self.notes_repository.delete_note(note_id, owner_uid)

    async def publish_note(self, note_id: str, owner_uid: str, user: UserContext) -> Optional[Dict[str, Any]]:
        """Make a note public."""
        success = await self.notes_repository.publish_note(note_id, owner_uid)
        if not success:
            return None
        
        # Return updated note
        return await self.notes_repository.get_note_by_owner(note_id, owner_uid)

    async def unpublish_note(self, note_id: str, owner_uid: str) -> Optional[Dict[str, Any]]:
        """Make a note private."""
        success = await self.notes_repository.unpublish_note(note_id, owner_uid)
        if not success:
            return None
        
        # Return updated note
        return await self.notes_repository.get_note_by_owner(note_id, owner_uid)