# coding: utf-8

from typing import ClassVar, Dict, List, Tuple  # noqa: F401

from pydantic import Field, StrictStr, field_validator
from typing import Optional
from typing_extensions import Annotated
from generated_fastapi_server.models.error_response import ErrorResponse
from generated_fastapi_server.models.public_note_response import PublicNoteResponse
from generated_fastapi_server.models.public_notes_list_response import PublicNotesListResponse


class BasePublicNotesApi:
    subclasses: ClassVar[Tuple] = ()

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        BasePublicNotesApi.subclasses = BasePublicNotesApi.subclasses + (cls,)
    async def get_note_by_id(
        self,
        id: Annotated[StrictStr, Field(description="Note ID (UUIDv4)")],
    ) -> PublicNoteResponse:
        ...


    async def get_notes(
        self,
        page: Annotated[Optional[Annotated[int, Field(strict=True, ge=1)]], Field(description="Page number for pagination")],
        limit: Annotated[Optional[Annotated[int, Field(le=100, strict=True, ge=1)]], Field(description="Number of items per page")],
        sort: Annotated[Optional[StrictStr], Field(description="Sort order (latest only)")],
    ) -> PublicNotesListResponse:
        ...
