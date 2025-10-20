# coding: utf-8

from typing import Dict, List  # noqa: F401
import importlib
import pkgutil

from generated_fastapi_server.apis.authentication_api_base import BaseAuthenticationApi
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
from generated_fastapi_server.models.anonymous_promote_request import AnonymousPromoteRequest
from generated_fastapi_server.models.auth_result_response import AuthResultResponse
from generated_fastapi_server.models.error_response import ErrorResponse
from generated_fastapi_server.security_api import get_token_BearerAuth

router = APIRouter()

ns_pkg = generated_fastapi_server.impl
for _, name, _ in pkgutil.iter_modules(ns_pkg.__path__, ns_pkg.__name__ + "."):
    importlib.import_module(name)


@router.post(
    "/auth/anonymous-login",
    responses={
        200: {"model": AuthResultResponse, "description": "Anonymous session validated; user ensured in DB"},
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
    tags=["Authentication"],
    summary="Authenticate anonymous user (validate Firebase anonymous token)",
    response_model_by_alias=True,
)
async def authenticate_anonymous(
    token_BearerAuth: TokenModel = Security(
        get_token_BearerAuth
    ),
) -> AuthResultResponse:
    if not BaseAuthenticationApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseAuthenticationApi.subclasses[0]().authenticate_anonymous()


@router.get(
    "/auth/login",
    responses={
        200: {"model": AuthResultResponse, "description": "Regular user session validated (and created if first time)"},
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
    },
    tags=["Authentication"],
    summary="Authenticate regular user (validate Firebase token; may insert user)",
    response_model_by_alias=True,
)
async def login_regular_user(
    token_BearerAuth: TokenModel = Security(
        get_token_BearerAuth
    ),
) -> AuthResultResponse:
    if not BaseAuthenticationApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseAuthenticationApi.subclasses[0]().login_regular_user()


@router.post(
    "/auth/anonymous-promote",
    responses={
        200: {"model": AuthResultResponse, "description": "Anonymous account promoted to regular user"},
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
    tags=["Authentication"],
    summary="Promote anonymous user to regular account",
    response_model_by_alias=True,
)
async def promote_anonymous_user(
    anonymous_promote_request: AnonymousPromoteRequest = Body(None, description=""),
    token_BearerAuth: TokenModel = Security(
        get_token_BearerAuth
    ),
) -> AuthResultResponse:
    if not BaseAuthenticationApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseAuthenticationApi.subclasses[0]().promote_anonymous_user(anonymous_promote_request)
