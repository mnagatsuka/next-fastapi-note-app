from __future__ import annotations

from fastapi import APIRouter, Depends

from app.application.services.user_service import UserApplicationService
from app.shared.auth import get_authenticated_user, require_regular_user, UserContext
from app.shared.dependencies import get_user_application_service
from app.shared.logger import get_logger

from app.generated.src.generated_fastapi_server.models.auth_result_response import AuthResultResponse
from app.generated.src.generated_fastapi_server.models.anonymous_promote_request import AnonymousPromoteRequest


router = APIRouter(prefix="/auth", tags=["Authentication"])
_log = get_logger("app.api.auth")


@router.get("/login", response_model=AuthResultResponse)
async def login_regular_user(
    user: UserContext = Depends(require_regular_user),
    users: UserApplicationService = Depends(get_user_application_service),
):
    # Ensure user exists or create
    profile = await users.get_profile(user.uid)
    created = False
    if not profile:
        # Create initial regular profile
        profile = await users.update_profile(user.uid, {
            "displayName": user.display_name or "User",
            "email": user.email,
            "isAnonymous": False,
        })
        created = True
    else:
        # Harden login: if profile exists but isAnonymous or email missing/outdated, patch it
        patch: dict = {}
        if profile.get("isAnonymous"):
            patch["isAnonymous"] = False
        if user.email and profile.get("email") != user.email:
            patch["email"] = user.email
        if patch:
            profile = await users.update_profile(user.uid, patch)
    response_data = {
        "status": "success",
        "data": {"user": profile, "isAnonymous": False, "created": created, "wasPromoted": False}
    }
    return AuthResultResponse.from_dict(response_data)


@router.post("/anonymous-login", response_model=AuthResultResponse)
async def authenticate_anonymous(
    user: UserContext = Depends(get_authenticated_user),
    users: UserApplicationService = Depends(get_user_application_service),
):
    # Treat any authenticated context as valid; if regular, still return isAnonymous accordingly
    _log.info("anonymous_login: start", extra={"uid": user.uid, "isAnonymous": user.is_anonymous})
    profile = await users.get_profile(user.uid)
    created = False
    if not profile:
        _log.info("anonymous_login: creating_profile", extra={"uid": user.uid})
        profile = await users.update_profile(user.uid, {
            "displayName": user.display_name or ("Guest" if user.is_anonymous else "User"),
            "email": user.email,
            "isAnonymous": user.is_anonymous,
        })
        created = True
    _log.info("anonymous_login: done", extra={"uid": user.uid, "wasCreated": created})
    response_data = {
        "status": "success",
        "data": {"user": profile, "isAnonymous": user.is_anonymous, "created": created, "wasPromoted": False}
    }
    return AuthResultResponse.from_dict(response_data)


@router.post("/anonymous-promote", response_model=AuthResultResponse)
async def promote_anonymous_user(
    payload: AnonymousPromoteRequest,
    user: UserContext = Depends(require_regular_user),
    users: UserApplicationService = Depends(get_user_application_service),
):
    # Validate the promotion request - the anonymous_firebase_uuid should match our records
    # In a real implementation, you might want to verify the anonymous user exists
    # and has the necessary permissions for promotion
    _log.info("promote_anonymous: start", extra={
        "uid": user.uid, 
        "anonymous_firebase_uuid": payload.anonymous_firebase_uuid
    })
    
    # For now, we'll proceed with the promotion logic
    # In production, you might want to validate that the anonymous_firebase_uuid
    # corresponds to a user that should be promoted
    
    profile = await users.get_profile(user.uid)
    was_promoted = False
    if not profile:
        profile = await users.update_profile(user.uid, {
            "displayName": user.display_name or "User",
            "email": user.email,
            "isAnonymous": False,
        })
        was_promoted = True
    elif profile.get("isAnonymous"):
        # On promotion, also persist verified email from auth context
        patch = {"isAnonymous": False}
        if user.email and profile.get("email") != user.email:
            patch["email"] = user.email
        profile = await users.update_profile(user.uid, patch)
        was_promoted = True
    
    _log.info("promote_anonymous: done", extra={
        "uid": user.uid, 
        "wasPromoted": was_promoted,
        "anonymous_firebase_uuid": payload.anonymous_firebase_uuid
    })
    response_data = {
        "status": "success",
        "data": {"user": profile, "isAnonymous": False, "created": False, "wasPromoted": was_promoted}
    }
    return AuthResultResponse.from_dict(response_data)
