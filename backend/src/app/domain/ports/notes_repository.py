from __future__ import annotations

from typing import Protocol, List, Tuple, Dict, Any, Optional
from app.domain.entities.note import Note


class NotesRepository(Protocol):
    async def list_public_notes(self, page: int, limit: int) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """Return list of public note dicts and pagination dict matching OpenAPI schema."""
        ...
    
    async def get_public_note(self, note_id: str) -> Optional[Dict[str, Any]]:
        """Return a single public note dict by id or None."""
        ...
    
    async def get_notes_by_owner(self, owner_uid: str, page: int, limit: int) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """Return list of user's note dicts and pagination dict."""
        ...
    
    async def get_note_by_owner(self, note_id: str, owner_uid: str) -> Optional[Dict[str, Any]]:
        """Return a single note dict by id and owner or None."""
        ...
    
    async def create_note(self, note: Note) -> None:
        """Create a new note."""
        ...
    
    async def update_note(self, note: Note) -> None:
        """Update an existing note."""
        ...
    
    async def delete_note(self, note_id: str, owner_uid: str) -> bool:
        """Delete a note by id and owner. Returns True if deleted, False if not found."""
        ...
    
    async def publish_note(self, note_id: str, owner_uid: str) -> bool:
        """Make a note public. Returns True if published, False if not found."""
        ...
    
    async def unpublish_note(self, note_id: str, owner_uid: str) -> bool:
        """Make a note private. Returns True if unpublished, False if not found."""
        ...
