from __future__ import annotations

from typing import Protocol, Optional, Dict, Any


class UserRepository(Protocol):
    async def get(self, uid: str) -> Optional[Dict[str, Any]]:
        ...

    async def upsert(self, profile: Dict[str, Any]) -> Dict[str, Any]:
        ...

    async def update(self, uid: str, patch: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        ...

