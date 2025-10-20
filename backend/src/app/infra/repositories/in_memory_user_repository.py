from __future__ import annotations

from datetime import datetime, timezone
from typing import Dict, Any, Optional

from app.domain.entities.user_profile import UserProfile
from app.domain.ports.user_repository import UserRepository


class InMemoryUserRepository(UserRepository):
    def __init__(self) -> None:
        # uid -> UserProfile
        self._store: Dict[str, UserProfile] = {}

    async def get(self, uid: str) -> Optional[Dict[str, Any]]:
        profile = self._store.get(uid)
        return profile.to_dict() if profile else None

    async def upsert(self, profile: Dict[str, Any]) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        current = self._store.get(profile["uid"])  # type: ignore[index]
        created_at = current.createdAt if current else now
        updated = UserProfile(
            uid=profile["uid"],
            displayName=profile.get("displayName") or (f"User {profile['uid'][-4:]}"),
            email=profile.get("email"),
            avatarUrl=profile.get("avatarUrl"),
            isAnonymous=bool(profile.get("isAnonymous", False)),
            createdAt=created_at,
            updatedAt=now,
        )
        self._store[updated.uid] = updated
        return updated.to_dict()

    async def update(self, uid: str, patch: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        current = self._store.get(uid)
        if not current:
            return None
        updated = UserProfile(
            uid=current.uid,
            displayName=patch.get("displayName", current.displayName),
            email=patch.get("email", current.email),
            avatarUrl=patch.get("avatarUrl", current.avatarUrl),
            isAnonymous=patch.get("isAnonymous", current.isAnonymous),
            createdAt=current.createdAt,
            updatedAt=datetime.now(timezone.utc),
        )
        self._store[uid] = updated
        return updated.to_dict()

