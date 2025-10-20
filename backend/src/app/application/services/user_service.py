from __future__ import annotations

from typing import Optional, Dict, Any

from app.domain.ports.user_repository import UserRepository
from app.shared.logger import get_logger


class UserApplicationService:
    def __init__(self, users: UserRepository) -> None:
        self._users = users
        self._log = get_logger("app.user_service")

    async def get_profile(self, uid: str) -> Optional[Dict[str, Any]]:
        self._log.info("get_profile: fetch", extra={"uid": uid})
        profile = await self._users.get(uid)
        self._log.info("get_profile: result", extra={"uid": uid, "found": bool(profile)})
        return profile

    async def update_profile(self, uid: str, patch: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update an existing profile, or create it if missing.

        Allows updating displayName, email, avatarUrl, and isAnonymous.
        If the profile does not exist yet, performs an upsert to create it.
        """
        self._log.info("update_profile: requested", extra={"uid": uid, "patch": patch})
        allowed = {k: v for k, v in patch.items() if k in {"displayName", "email", "avatarUrl", "isAnonymous"}}
        if not allowed:
            self._log.info("update_profile: no allowed fields", extra={"uid": uid})
            return await self._users.get(uid)

        self._log.info("update_profile: try update", extra={"uid": uid, "allowed": allowed})
        updated = await self._users.update(uid, allowed)
        if updated is not None:
            self._log.info("update_profile: updated existing", extra={"uid": uid})
            return updated

        # Create new profile via upsert when no existing record
        profile = {"uid": uid, **allowed}
        self._log.info("update_profile: upsert create", extra={"uid": uid, "profile": profile})
        created = await self._users.upsert(profile)
        self._log.info("update_profile: created", extra={"uid": uid})
        return created
