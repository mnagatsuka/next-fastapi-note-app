from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Optional, Dict, Any


@dataclass(frozen=True)
class Author:
    id: str
    displayName: str
    avatarUrl: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "displayName": self.displayName,
            "avatarUrl": self.avatarUrl,
        }


@dataclass(frozen=True)
class Note:
    id: str
    title: str
    content: str
    author: Author
    createdAt: datetime
    updatedAt: datetime
    publishedAt: Optional[datetime]
    owner_uid: str
    is_public: bool

    @staticmethod
    def _iso(dt: datetime) -> str:
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")

    def to_public_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "author": self.author.to_dict(),
            "createdAt": self._iso(self.createdAt),
            "updatedAt": self._iso(self.updatedAt),
            "publishedAt": self._iso(self.publishedAt) if self.publishedAt else None,
        }
    
    def to_private_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "createdAt": self._iso(self.createdAt),
            "updatedAt": self._iso(self.updatedAt),
            "publishedAt": self._iso(self.publishedAt) if self.publishedAt else None,
            "isPublic": self.is_public,
        }

