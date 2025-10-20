from __future__ import annotations

from fastapi import APIRouter, Depends

from app.application.services.user_service import UserApplicationService
from app.shared.auth import require_regular_user, UserContext
from app.shared.dependencies import get_user_application_service

from app.generated.src.generated_fastapi_server.models.user_profile_response import UserProfileResponse
from app.generated.src.generated_fastapi_server.models.update_user_profile_request import UpdateUserProfileRequest


router = APIRouter(prefix="/me", tags=["User Profile"])


@router.get("", response_model=UserProfileResponse)
async def get_user_profile(
    user: UserContext = Depends(require_regular_user),
    service: UserApplicationService = Depends(get_user_application_service),
):
    profile = await service.get_profile(user.uid)
    if not profile:
        # Create default regular profile if missing (first-time login)
        # Rely on service's repository via update() semantics
        profile = await service.update_profile(user.uid, {"displayName": user.display_name or "User", "isAnonymous": False})
    response_data = {
        "status": "success",
        "data": profile
    }
    return UserProfileResponse.from_dict(response_data)


@router.patch("", response_model=UserProfileResponse)
async def update_user_profile(
    payload: UpdateUserProfileRequest,
    user: UserContext = Depends(require_regular_user),
    service: UserApplicationService = Depends(get_user_application_service),
):
    # Convert Pydantic model to dict, excluding None values
    update_data = payload.model_dump(by_alias=True, exclude_none=True)
    updated = await service.update_profile(user.uid, update_data)
    response_data = {
        "status": "success",
        "data": updated
    }
    return UserProfileResponse.from_dict(response_data)
