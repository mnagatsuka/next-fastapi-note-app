# coding: utf-8

from typing import Dict, List  # noqa: F401
import importlib
import pkgutil

from generated_fastapi_server.apis.public_notes_api_base import BasePublicNotesApi
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
from pydantic import Field, StrictStr, field_validator
from typing import Optional
from typing_extensions import Annotated
from generated_fastapi_server.models.error_response import ErrorResponse
from generated_fastapi_server.models.public_note_response import PublicNoteResponse
from generated_fastapi_server.models.public_notes_list_response import PublicNotesListResponse


router = APIRouter()

ns_pkg = generated_fastapi_server.impl
for _, name, _ in pkgutil.iter_modules(ns_pkg.__path__, ns_pkg.__name__ + "."):
    importlib.import_module(name)


@router.get(
    "/notes/{id}",
    responses={
        200: {"model": PublicNoteResponse, "description": "Public note"},
        404: {"model": ErrorResponse, "description": "Not Found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
    tags=["Public Notes"],
    summary="Get public note by ID",
    response_model_by_alias=True,
)
async def get_note_by_id(
    id: Annotated[StrictStr, Field(description="Note ID (UUIDv4)")] = Path(..., description="Note ID (UUIDv4)"),
) -> PublicNoteResponse:
    if not BasePublicNotesApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BasePublicNotesApi.subclasses[0]().get_note_by_id(id)


@router.get(
    "/notes",
    responses={
        200: {"model": PublicNotesListResponse, "description": "Paginated list of latest public notes"},
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
    tags=["Public Notes"],
    summary="List latest public notes",
    response_model_by_alias=True,
)
async def get_notes(
    page: Annotated[Optional[Annotated[int, Field(strict=True, ge=1)]], Field(description="Page number for pagination")] = Query(1, description="Page number for pagination", alias="page", ge=1),
    limit: Annotated[Optional[Annotated[int, Field(le=100, strict=True, ge=1)]], Field(description="Number of items per page")] = Query(20, description="Number of items per page", alias="limit", ge=1, le=100),
    sort: Annotated[Optional[StrictStr], Field(description="Sort order (latest only)")] = Query(latest, description="Sort order (latest only)", alias="sort"),
) -> PublicNotesListResponse:
    if not BasePublicNotesApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BasePublicNotesApi.subclasses[0]().get_notes(page, limit, sort)
