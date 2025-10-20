# coding: utf-8

from typing import Dict, List  # noqa: F401
import importlib
import pkgutil

from generated_fastapi_server.apis.personal_notebook_api_base import BasePersonalNotebookApi
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
from typing import Optional
from typing_extensions import Annotated
from generated_fastapi_server.models.create_my_note_request import CreateMyNoteRequest
from generated_fastapi_server.models.delete_note_response import DeleteNoteResponse
from generated_fastapi_server.models.error_response import ErrorResponse
from generated_fastapi_server.models.private_note_response import PrivateNoteResponse
from generated_fastapi_server.models.private_notes_list_response import PrivateNotesListResponse
from generated_fastapi_server.models.update_my_note_request import UpdateMyNoteRequest
from generated_fastapi_server.security_api import get_token_BearerAuth

router = APIRouter()

ns_pkg = generated_fastapi_server.impl
for _, name, _ in pkgutil.iter_modules(ns_pkg.__path__, ns_pkg.__name__ + "."):
    importlib.import_module(name)


@router.post(
    "/me/notes",
    responses={
        201: {"model": PrivateNoteResponse, "description": "Note created"},
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
    tags=["Personal Notebook"],
    summary="Create a new private note",
    response_model_by_alias=True,
)
async def create_my_note(
    create_my_note_request: CreateMyNoteRequest = Body(None, description=""),
    token_BearerAuth: TokenModel = Security(
        get_token_BearerAuth
    ),
) -> PrivateNoteResponse:
    if not BasePersonalNotebookApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BasePersonalNotebookApi.subclasses[0]().create_my_note(create_my_note_request)


@router.delete(
    "/me/notes/{id}",
    responses={
        200: {"model": DeleteNoteResponse, "description": "Note deleted"},
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
        404: {"model": ErrorResponse, "description": "Not Found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
    tags=["Personal Notebook"],
    summary="Delete my private note",
    response_model_by_alias=True,
)
async def delete_my_note(
    id: Annotated[StrictStr, Field(description="Note ID (UUIDv4)")] = Path(..., description="Note ID (UUIDv4)"),
    token_BearerAuth: TokenModel = Security(
        get_token_BearerAuth
    ),
) -> DeleteNoteResponse:
    if not BasePersonalNotebookApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BasePersonalNotebookApi.subclasses[0]().delete_my_note(id)


@router.get(
    "/me/notes/{id}",
    responses={
        200: {"model": PrivateNoteResponse, "description": "Private note"},
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
        404: {"model": ErrorResponse, "description": "Not Found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
    tags=["Personal Notebook"],
    summary="Get my private note by ID",
    response_model_by_alias=True,
)
async def get_my_note_by_id(
    id: Annotated[StrictStr, Field(description="Note ID (UUIDv4)")] = Path(..., description="Note ID (UUIDv4)"),
    token_BearerAuth: TokenModel = Security(
        get_token_BearerAuth
    ),
) -> PrivateNoteResponse:
    if not BasePersonalNotebookApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BasePersonalNotebookApi.subclasses[0]().get_my_note_by_id(id)


@router.get(
    "/me/notes",
    responses={
        200: {"model": PrivateNotesListResponse, "description": "Paginated list of user&#39;s private notes"},
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
    tags=["Personal Notebook"],
    summary="List my private notes",
    response_model_by_alias=True,
)
async def get_my_notes(
    page: Annotated[Optional[Annotated[int, Field(strict=True, ge=1)]], Field(description="Page number for pagination")] = Query(1, description="Page number for pagination", alias="page", ge=1),
    limit: Annotated[Optional[Annotated[int, Field(le=100, strict=True, ge=1)]], Field(description="Number of items per page")] = Query(20, description="Number of items per page", alias="limit", ge=1, le=100),
    token_BearerAuth: TokenModel = Security(
        get_token_BearerAuth
    ),
) -> PrivateNotesListResponse:
    if not BasePersonalNotebookApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BasePersonalNotebookApi.subclasses[0]().get_my_notes(page, limit)


@router.post(
    "/me/notes/{id}/publish",
    responses={
        200: {"model": PrivateNoteResponse, "description": "Note published successfully"},
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
        404: {"model": ErrorResponse, "description": "Not Found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
    tags=["Personal Notebook"],
    summary="Make note public (publish)",
    response_model_by_alias=True,
)
async def publish_note(
    id: Annotated[StrictStr, Field(description="Note ID (UUIDv4)")] = Path(..., description="Note ID (UUIDv4)"),
    token_BearerAuth: TokenModel = Security(
        get_token_BearerAuth
    ),
) -> PrivateNoteResponse:
    if not BasePersonalNotebookApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BasePersonalNotebookApi.subclasses[0]().publish_note(id)


@router.post(
    "/me/notes/{id}/unpublish",
    responses={
        200: {"model": PrivateNoteResponse, "description": "Note unpublished successfully"},
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
        404: {"model": ErrorResponse, "description": "Not Found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
    tags=["Personal Notebook"],
    summary="Make note private (unpublish)",
    response_model_by_alias=True,
)
async def unpublish_note(
    id: Annotated[StrictStr, Field(description="Note ID (UUIDv4)")] = Path(..., description="Note ID (UUIDv4)"),
    token_BearerAuth: TokenModel = Security(
        get_token_BearerAuth
    ),
) -> PrivateNoteResponse:
    if not BasePersonalNotebookApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BasePersonalNotebookApi.subclasses[0]().unpublish_note(id)


@router.patch(
    "/me/notes/{id}",
    responses={
        200: {"model": PrivateNoteResponse, "description": "Updated note"},
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
        404: {"model": ErrorResponse, "description": "Not Found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
    tags=["Personal Notebook"],
    summary="Update my private note",
    response_model_by_alias=True,
)
async def update_my_note(
    id: Annotated[StrictStr, Field(description="Note ID (UUIDv4)")] = Path(..., description="Note ID (UUIDv4)"),
    update_my_note_request: UpdateMyNoteRequest = Body(None, description=""),
    token_BearerAuth: TokenModel = Security(
        get_token_BearerAuth
    ),
) -> PrivateNoteResponse:
    if not BasePersonalNotebookApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BasePersonalNotebookApi.subclasses[0]().update_my_note(id, update_my_note_request)
