from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Optional, Dict, Any


@dataclass(frozen=True)
class UserProfile:
    uid: str
    displayName: str
    isAnonymous: bool
    createdAt: datetime
    updatedAt: datetime
    email: Optional[str] = None
    avatarUrl: Optional[str] = None

    @staticmethod
    def _iso(dt: datetime) -> str:
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "uid": self.uid,
            "displayName": self.displayName,
            "email": self.email,
            "avatarUrl": self.avatarUrl,
            "isAnonymous": self.isAnonymous,
            "createdAt": self._iso(self.createdAt),
            "updatedAt": self._iso(self.updatedAt),
        }

