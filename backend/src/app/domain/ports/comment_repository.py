from __future__ import annotations

from typing import Protocol, List, Dict, Any, Optional
from app.domain.entities.comment import Comment


class CommentRepository(Protocol):
    async def list_comments_by_note(self, note_id: str, page: int, limit: int) -> tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """Return list of comment dicts for a note and pagination dict matching OpenAPI schema."""
        ...
    
    async def create_comment(self, comment: Comment) -> Dict[str, Any]:
        """Create a new comment and return the comment dict."""
        ...
    
    async def get_comment(self, comment_id: str) -> Optional[Dict[str, Any]]:
        """Return a single comment dict by id or None."""
        ...