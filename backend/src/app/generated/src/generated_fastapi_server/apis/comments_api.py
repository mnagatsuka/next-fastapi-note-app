# coding: utf-8

from typing import Dict, List  # noqa: F401
import importlib
import pkgutil

from generated_fastapi_server.apis.comments_api_base import BaseCommentsApi
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
from pydantic import Field, StrictStr
from typing_extensions import Annotated
from generated_fastapi_server.models.comment_response import CommentResponse
from generated_fastapi_server.models.comments_list_response import CommentsListResponse
from generated_fastapi_server.models.create_public_note_comment_request import CreatePublicNoteCommentRequest
from generated_fastapi_server.models.error_response import ErrorResponse
from generated_fastapi_server.security_api import get_token_BearerAuth

router = APIRouter()

ns_pkg = generated_fastapi_server.impl
for _, name, _ in pkgutil.iter_modules(ns_pkg.__path__, ns_pkg.__name__ + "."):
    importlib.import_module(name)


@router.post(
    "/me/notes/{id}/comments",
    responses={
        201: {"model": CommentResponse, "description": "Comment created successfully"},
        400: {"model": ErrorResponse, "description": "Validation error"},
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
        404: {"model": ErrorResponse, "description": "Not Found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
    tags=["Comments"],
    summary="Create a comment on my private note",
    response_model_by_alias=True,
)
async def create_private_note_comment(
    id: Annotated[StrictStr, Field(description="Note ID (UUIDv4)")] = Path(..., description="Note ID (UUIDv4)"),
    create_public_note_comment_request: CreatePublicNoteCommentRequest = Body(None, description=""),
    token_BearerAuth: TokenModel = Security(
        get_token_BearerAuth
    ),
) -> CommentResponse:
    """Creates a new comment on a private note owned by the authenticated user. Automatically broadcasts the new comment to all connected WebSocket clients. """
    if not BaseCommentsApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseCommentsApi.subclasses[0]().create_private_note_comment(id, create_public_note_comment_request)


@router.post(
    "/notes/{id}/comments",
    responses={
        201: {"model": CommentResponse, "description": "Comment created successfully"},
        400: {"model": ErrorResponse, "description": "Validation error"},
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        404: {"model": ErrorResponse, "description": "Not Found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
    tags=["Comments"],
    summary="Create a comment on a public note",
    response_model_by_alias=True,
)
async def create_public_note_comment(
    id: Annotated[StrictStr, Field(description="Note ID (UUIDv4)")] = Path(..., description="Note ID (UUIDv4)"),
    create_public_note_comment_request: CreatePublicNoteCommentRequest = Body(None, description=""),
    token_BearerAuth: TokenModel = Security(
        get_token_BearerAuth
    ),
) -> CommentResponse:
    """Creates a new comment on a public note. Requires authentication. Automatically broadcasts the new comment to all connected WebSocket clients. """
    if not BaseCommentsApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseCommentsApi.subclasses[0]().create_public_note_comment(id, create_public_note_comment_request)


@router.get(
    "/me/notes/{id}/comments",
    responses={
        200: {"model": CommentsListResponse, "description": "List of comments for the private note"},
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
        404: {"model": ErrorResponse, "description": "Not Found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
    tags=["Comments"],
    summary="Get comments for my private note",
    response_model_by_alias=True,
)
async def get_private_note_comments(
    id: Annotated[StrictStr, Field(description="Note ID (UUIDv4)")] = Path(..., description="Note ID (UUIDv4)"),
    token_BearerAuth: TokenModel = Security(
        get_token_BearerAuth
    ),
) -> CommentsListResponse:
    if not BaseCommentsApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseCommentsApi.subclasses[0]().get_private_note_comments(id)


@router.get(
    "/notes/{id}/comments",
    responses={
        200: {"model": CommentsListResponse, "description": "List of comments for the note"},
        404: {"model": ErrorResponse, "description": "Not Found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
    tags=["Comments"],
    summary="Get comments for a public note",
    response_model_by_alias=True,
)
async def get_public_note_comments(
    id: Annotated[StrictStr, Field(description="Note ID (UUIDv4)")] = Path(..., description="Note ID (UUIDv4)"),
) -> CommentsListResponse:
    if not BaseCommentsApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseCommentsApi.subclasses[0]().get_public_note_comments(id)
