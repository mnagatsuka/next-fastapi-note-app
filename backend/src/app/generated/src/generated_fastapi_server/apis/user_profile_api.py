# coding: utf-8

from typing import Dict, List  # noqa: F401
import importlib
import pkgutil

from generated_fastapi_server.apis.user_profile_api_base import BaseUserProfileApi
import generated_fastapi_server.impl

from fastapi import (  # noqa: F401
    APIRouter,
    Body,
    Cookie,
    Depends,
    Form,
    Header,
    HTTPException,
    Path,
    Query,
    Response,
    Security,
    status,
)

from generated_fastapi_server.models.extra_models import TokenModel  # noqa: F401
from generated_fastapi_server.models.error_response import ErrorResponse
from generated_fastapi_server.models.update_user_profile_request import UpdateUserProfileRequest
from generated_fastapi_server.models.user_profile_response import UserProfileResponse
from generated_fastapi_server.security_api import get_token_BearerAuth

router = APIRouter()

ns_pkg = generated_fastapi_server.impl
for _, name, _ in pkgutil.iter_modules(ns_pkg.__path__, ns_pkg.__name__ + "."):
    importlib.import_module(name)


@router.get(
    "/me",
    responses={
        200: {"model": UserProfileResponse, "description": "User profile"},
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
    },
    tags=["User Profile"],
    summary="Get user profile",
    response_model_by_alias=True,
)
async def get_user_profile(
    token_BearerAuth: TokenModel = Security(
        get_token_BearerAuth
    ),
) -> UserProfileResponse:
    if not BaseUserProfileApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseUserProfileApi.subclasses[0]().get_user_profile()


@router.patch(
    "/me",
    responses={
        200: {"model": UserProfileResponse, "description": "Updated profile"},
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
    tags=["User Profile"],
    summary="Update user profile",
    response_model_by_alias=True,
)
async def update_user_profile(
    update_user_profile_request: UpdateUserProfileRequest = Body(None, description=""),
    token_BearerAuth: TokenModel = Security(
        get_token_BearerAuth
    ),
) -> UserProfileResponse:
    if not BaseUserProfileApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseUserProfileApi.subclasses[0]().update_user_profile(update_user_profile_request)
