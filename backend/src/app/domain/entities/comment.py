from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Dict, Any, Optional


@dataclass(frozen=True)
class Comment:
    id: str
    content: str
    note_id: str
    author_uid: str
    author_display_name: str
    author_avatar_url: Optional[str]
    created_at: datetime
    updated_at: datetime

    @staticmethod
    def _iso(dt: datetime) -> str:
        """Convert datetime to ISO 8601 string with Z timezone marker."""
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")

    def to_dict(self) -> Dict[str, Any]:
        """Convert comment to dictionary for API responses."""
        return {
            "id": self.id,
            "content": self.content,
            "noteId": self.note_id,
            "author": {
                "id": self.author_uid,
                "displayName": self.author_display_name,
                "avatarUrl": self.author_avatar_url,
            },
            "createdAt": self._iso(self.created_at),
            "updatedAt": self._iso(self.updated_at),
        }

    def to_websocket_dict(self) -> Dict[str, Any]:
        """Convert comment to dictionary for WebSocket broadcasting."""
        return self.to_dict()