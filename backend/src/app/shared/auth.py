from __future__ import annotations

from dataclasses import dataclass
import os
import json
from typing import Optional

from fastapi import Depends, HTTPException, Request, status
from .config import get_settings

try:  # Optional: only used when Firebase Admin is configured
    import firebase_admin
    from firebase_admin import auth as admin_auth
    from firebase_admin import credentials as admin_credentials
except Exception:  # pragma: no cover - optional dependency at runtime
    firebase_admin = None
    admin_auth = None
    admin_credentials = None


@dataclass(frozen=True)
class UserContext:
    uid: str
    is_anonymous: bool
    email: Optional[str] = None
    display_name: Optional[str] = None
    provider: Optional[str] = None


def _parse_bearer_token(request: Request) -> str:
    auth = request.headers.get("Authorization")
    if not auth or not auth.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid Authorization header")
    return auth.split(" ", 1)[1].strip()


def _verify_firebase_token_simulated(id_token: str) -> UserContext:
    """
    Simulated verification:
    - Format: "anon:<uid>" → anonymous user
    - Format: "user:<uid>" → regular user
    Raise 401 for anything else.
    """
    if id_token.startswith("anon:"):
        uid = id_token.split(":", 1)[1]
        return UserContext(uid=uid, is_anonymous=True, display_name="Guest")
    if id_token.startswith("user:"):
        uid = id_token.split(":", 1)[1]
        return UserContext(uid=uid, is_anonymous=False, display_name=f"User {uid[-4:]}")
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

_firebase_initialized = False


def _ensure_firebase_initialized() -> bool:
    """Initialize Firebase Admin if possible. Returns True if ready to verify tokens."""
    global _firebase_initialized
    if _firebase_initialized:
        return True

    if firebase_admin is None or admin_auth is None:
        return False

    settings = get_settings()

    # Initialize app if not already initialized
    try:
        if not firebase_admin._apps:  # type: ignore[attr-defined]
            # Prefer emulator if configured (local dev)
            if settings.firebase_auth_emulator_host:
                os.environ["FIREBASE_AUTH_EMULATOR_HOST"] = settings.firebase_auth_emulator_host
                options = {}
                if settings.firebase_project_id:
                    options["projectId"] = settings.firebase_project_id
                firebase_admin.initialize_app(options=options or None)  # type: ignore[arg-type]
            # Otherwise initialize with service account JSON if provided
            elif settings.firebase_credentials_json and admin_credentials is not None:
                creds_obj = json.loads(settings.firebase_credentials_json)
                creds = admin_credentials.Certificate(creds_obj)  # type: ignore[arg-type]
                options = {"projectId": settings.firebase_project_id} if settings.firebase_project_id else None
                firebase_admin.initialize_app(credential=creds, options=options)  # type: ignore[arg-type]
            else:
                # No emulator and no credentials → cannot initialize
                return False
        _firebase_initialized = True
        return True
    except Exception:
        # Fallback to simulated mode if initialization fails
        return False


def _verify_firebase_token_admin(id_token: str) -> Optional[UserContext]:
    """Verify a Firebase ID token using Admin SDK if available.
    Returns UserContext on success, or None if verification cannot be performed.
    """
    if not _ensure_firebase_initialized():
        return None
    try:
        decoded = admin_auth.verify_id_token(id_token)  # type: ignore[union-attr]
        uid = decoded.get("uid") or decoded.get("user_id")
        firebase_claims = decoded.get("firebase", {}) or {}
        provider = firebase_claims.get("sign_in_provider")
        is_anon = provider == "anonymous" or bool(decoded.get("is_anonymous"))
        return UserContext(
            uid=str(uid),
            is_anonymous=is_anon,
            email=decoded.get("email"),
            display_name=decoded.get("name"),
            provider=provider,
        )
    except Exception:
        # If verification fails, return None so caller can fallback
        return None


def get_authenticated_user(request: Request) -> UserContext:
    token = _parse_bearer_token(request)
    # Try real Firebase verification first if token looks like a JWT
    if "." in token:
        user = _verify_firebase_token_admin(token)
        if user is not None:
            return user
    # Development fallback: simulated tokens like "anon:<uid>" or "user:<uid>"
    return _verify_firebase_token_simulated(token)


def require_regular_user(user: UserContext = Depends(get_authenticated_user)) -> UserContext:
    if user.is_anonymous:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Regular account required")
    return user
