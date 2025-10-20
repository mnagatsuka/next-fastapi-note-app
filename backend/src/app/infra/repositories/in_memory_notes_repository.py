from __future__ import annotations

from datetime import datetime, timezone
from typing import List, Tuple, Dict, Any, Optional

from app.domain.entities.note import Note, Author
from app.domain.ports.notes_repository import NotesRepository


class InMemoryNotesRepository(NotesRepository):
    def __init__(self) -> None:
        self._notes: List[Note] = [
            Note(
                id="550e8400-e29b-41d4-a716-446655440000",
                title="Hello World",
                content="This is a simple public note in plain text.",
                author=Author(id="user_ABC123", displayName="Alice", avatarUrl="https://example.com/avatars/alice.png"),
                createdAt=datetime(2025, 1, 1, 12, 0, 0, tzinfo=timezone.utc),
                updatedAt=datetime(2025, 1, 2, 8, 30, 0, tzinfo=timezone.utc),
                publishedAt=datetime(2025, 1, 2, 8, 30, 0, tzinfo=timezone.utc),
                owner_uid="user_ABC123",
                is_public=True,
            ),
            Note(
                id="550e8400-e29b-41d4-a716-446655440001",
                title="Second Note",
                content="Another public note for demonstration.",
                author=Author(id="user_DEF456", displayName="Bob", avatarUrl="https://example.com/avatars/bob.png"),
                createdAt=datetime(2025, 1, 3, 10, 0, 0, tzinfo=timezone.utc),
                updatedAt=datetime(2025, 1, 3, 10, 0, 0, tzinfo=timezone.utc),
                publishedAt=datetime(2025, 1, 3, 10, 0, 0, tzinfo=timezone.utc),
                owner_uid="user_DEF456",
                is_public=True,
            ),
            Note(
                id="550e8400-e29b-41d4-a716-446655440002",
                title="Third Note",
                content="Yet another example public note.",
                author=Author(id="user_GHI789", displayName="Carol", avatarUrl="https://example.com/avatars/carol.png"),
                createdAt=datetime(2025, 1, 5, 9, 15, 0, tzinfo=timezone.utc),
                updatedAt=datetime(2025, 1, 5, 9, 15, 0, tzinfo=timezone.utc),
                publishedAt=datetime(2025, 1, 5, 9, 15, 0, tzinfo=timezone.utc),
                owner_uid="user_GHI789",
                is_public=True,
            ),
        ]

    async def list_public_notes(self, page: int, limit: int) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        # Filter only public notes
        public_notes = [n for n in self._notes if n.is_public]
        
        total = len(public_notes)
        start = (page - 1) * limit
        end = start + limit
        items = public_notes[start:end]
        notes = [n.to_public_dict() for n in items]
        pagination = {
            "page": page,
            "limit": limit,
            "total": total,
            "hasNext": end < total,
            "hasPrev": start > 0,
        }
        return notes, pagination

    async def get_public_note(self, note_id: str) -> Optional[Dict[str, Any]]:
        for n in self._notes:
            if n.id == note_id and n.is_public:
                return n.to_public_dict()
        return None
    
    async def get_notes_by_owner(self, owner_uid: str, page: int, limit: int) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        # Filter notes by owner
        owner_notes = [n for n in self._notes if n.owner_uid == owner_uid]
        # Sort by created_at descending
        owner_notes.sort(key=lambda n: n.createdAt, reverse=True)
        
        total = len(owner_notes)
        start = (page - 1) * limit
        end = start + limit
        items = owner_notes[start:end]
        notes = [n.to_private_dict() for n in items]
        pagination = {
            "page": page,
            "limit": limit,
            "total": total,
            "hasNext": end < total,
            "hasPrev": start > 0,
        }
        return notes, pagination
    
    async def get_note_by_owner(self, note_id: str, owner_uid: str) -> Optional[Dict[str, Any]]:
        for n in self._notes:
            if n.id == note_id and n.owner_uid == owner_uid:
                return n.to_private_dict()
        return None
    
    async def create_note(self, note: Note) -> None:
        self._notes.append(note)
    
    async def update_note(self, note: Note) -> None:
        for i, n in enumerate(self._notes):
            if n.id == note.id and n.owner_uid == note.owner_uid:
                self._notes[i] = note
                return
        raise ValueError(f"Note {note.id} not found for owner {note.owner_uid}")
    
    async def delete_note(self, note_id: str, owner_uid: str) -> bool:
        for i, n in enumerate(self._notes):
            if n.id == note_id and n.owner_uid == owner_uid:
                del self._notes[i]
                return True
        return False
    
    async def publish_note(self, note_id: str, owner_uid: str) -> bool:
        for i, n in enumerate(self._notes):
            if n.id == note_id and n.owner_uid == owner_uid:
                # Create updated note with public status
                updated_note = Note(
                    id=n.id,
                    title=n.title,
                    content=n.content,
                    author=n.author,
                    createdAt=n.createdAt,
                    updatedAt=datetime.now(timezone.utc),
                    publishedAt=datetime.now(timezone.utc),
                    owner_uid=n.owner_uid,
                    is_public=True,
                )
                self._notes[i] = updated_note
                return True
        return False
    
    async def unpublish_note(self, note_id: str, owner_uid: str) -> bool:
        for i, n in enumerate(self._notes):
            if n.id == note_id and n.owner_uid == owner_uid:
                # Create updated note with private status
                updated_note = Note(
                    id=n.id,
                    title=n.title,
                    content=n.content,
                    author=n.author,
                    createdAt=n.createdAt,
                    updatedAt=datetime.now(timezone.utc),
                    publishedAt=None,
                    owner_uid=n.owner_uid,
                    is_public=False,
                )
                self._notes[i] = updated_note
                return True
        return False
