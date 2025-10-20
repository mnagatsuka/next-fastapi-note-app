from __future__ import annotations

from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import uuid

from app.domain.entities.comment import Comment
from app.domain.ports.comment_repository import CommentRepository


class InMemoryCommentRepository(CommentRepository):
    def __init__(self) -> None:
        self._comments: List[Comment] = []

    async def list_comments_by_note(self, note_id: str, page: int, limit: int) -> tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """Return list of comment dicts for a note and pagination dict."""
        # Filter comments by note_id
        note_comments = [c for c in self._comments if c.note_id == note_id]
        # Sort by created_at ascending (oldest first)
        note_comments.sort(key=lambda c: c.created_at)
        
        total = len(note_comments)
        start = (page - 1) * limit
        end = start + limit
        items = note_comments[start:end]
        comments = [c.to_dict() for c in items]
        
        pagination = {
            "page": page,
            "limit": limit,
            "total": total,
            "hasNext": end < total,
            "hasPrev": start > 0,
        }
        return comments, pagination
    
    async def create_comment(self, comment: Comment) -> Dict[str, Any]:
        """Create a new comment and return the comment dict."""
        self._comments.append(comment)
        return comment.to_dict()
    
    async def get_comment(self, comment_id: str) -> Optional[Dict[str, Any]]:
        """Return a single comment dict by id or None."""
        for comment in self._comments:
            if comment.id == comment_id:
                return comment.to_dict()
        return None