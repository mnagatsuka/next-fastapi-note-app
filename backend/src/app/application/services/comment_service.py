from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any, Tuple, List

from app.domain.entities.comment import Comment
from app.domain.ports.comment_repository import CommentRepository
from app.domain.ports.notes_repository import NotesRepository
from app.application.services.websocket_service import WebSocketService


class CommentApplicationService:
    def __init__(
        self, 
        comment_repository: CommentRepository,
        notes_repository: NotesRepository,
        websocket_service: WebSocketService,
    ):
        self.comment_repository = comment_repository
        self.notes_repository = notes_repository
        self.websocket_service = websocket_service

    async def list_comments_for_public_note(self, note_id: str, page: int, limit: int) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """List comments for a public note with pagination."""
        # First verify the note exists and is public
        note = await self.notes_repository.get_public_note(note_id)
        if not note:
            raise ValueError(f"Public note {note_id} not found")
        
        return await self.comment_repository.list_comments_by_note(note_id, page, limit)
    
    async def list_comments_for_private_note(self, note_id: str, owner_uid: str, page: int, limit: int) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """List comments for a private note owned by the user with pagination."""
        # First verify the note exists and is owned by the user
        note = await self.notes_repository.get_note_by_owner(note_id, owner_uid)
        if not note:
            raise ValueError(f"Private note {note_id} not found for owner {owner_uid}")
        
        return await self.comment_repository.list_comments_by_note(note_id, page, limit)

    async def create_comment_on_public_note(
        self, 
        note_id: str, 
        content: str, 
        author_uid: str, 
        author_display_name: str, 
        author_avatar_url: Optional[str]
    ) -> Dict[str, Any]:
        """Create a comment on a public note and broadcast via WebSocket."""
        # First verify the note exists and is public
        note = await self.notes_repository.get_public_note(note_id)
        if not note:
            raise ValueError(f"Public note {note_id} not found")
        
        # Create comment
        now = datetime.now(timezone.utc)
        comment = Comment(
            id=str(uuid.uuid4()),
            content=content,
            note_id=note_id,
            author_uid=author_uid,
            author_display_name=author_display_name,
            author_avatar_url=author_avatar_url,
            created_at=now,
            updated_at=now,
        )
        
        # Save comment
        comment_dict = await self.comment_repository.create_comment(comment)
        
        # Broadcast via WebSocket (fire and forget - don't block on failure)
        try:
            await self.websocket_service.broadcast_comment_created(
                note_id=note_id,
                comment=comment_dict,
                is_private_note=False,
            )
        except Exception as e:
            # Log error but don't fail the request
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to broadcast comment creation: {e}")
        
        return comment_dict
    
    async def create_comment_on_private_note(
        self, 
        note_id: str, 
        owner_uid: str,
        content: str, 
        author_uid: str, 
        author_display_name: str, 
        author_avatar_url: Optional[str]
    ) -> Dict[str, Any]:
        """Create a comment on a private note owned by the user and broadcast via WebSocket."""
        # First verify the note exists and is owned by the user
        note = await self.notes_repository.get_note_by_owner(note_id, owner_uid)
        if not note:
            raise ValueError(f"Private note {note_id} not found for owner {owner_uid}")
        
        # Create comment
        now = datetime.now(timezone.utc)
        comment = Comment(
            id=str(uuid.uuid4()),
            content=content,
            note_id=note_id,
            author_uid=author_uid,
            author_display_name=author_display_name,
            author_avatar_url=author_avatar_url,
            created_at=now,
            updated_at=now,
        )
        
        # Save comment
        comment_dict = await self.comment_repository.create_comment(comment)
        
        # Broadcast via WebSocket (fire and forget - don't block on failure)
        try:
            await self.websocket_service.broadcast_comment_created(
                note_id=note_id,
                comment=comment_dict,
                is_private_note=True,
            )
        except Exception as e:
            # Log error but don't fail the request
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to broadcast comment creation: {e}")
        
        return comment_dict