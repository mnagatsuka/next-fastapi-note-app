# coding: utf-8

from typing import ClassVar, Dict, List, Tuple  # noqa: F401

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

class BasePersonalNotebookApi:
    subclasses: ClassVar[Tuple] = ()

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        BasePersonalNotebookApi.subclasses = BasePersonalNotebookApi.subclasses + (cls,)
    async def create_my_note(
        self,
        create_my_note_request: CreateMyNoteRequest,
    ) -> PrivateNoteResponse:
        ...


    async def delete_my_note(
        self,
        id: Annotated[StrictStr, Field(description="Note ID (UUIDv4)")],
    ) -> DeleteNoteResponse:
        ...


    async def get_my_note_by_id(
        self,
        id: Annotated[StrictStr, Field(description="Note ID (UUIDv4)")],
    ) -> PrivateNoteResponse:
        ...


    async def get_my_notes(
        self,
        page: Annotated[Optional[Annotated[int, Field(strict=True, ge=1)]], Field(description="Page number for pagination")],
        limit: Annotated[Optional[Annotated[int, Field(le=100, strict=True, ge=1)]], Field(description="Number of items per page")],
    ) -> PrivateNotesListResponse:
        ...


    async def publish_note(
        self,
        id: Annotated[StrictStr, Field(description="Note ID (UUIDv4)")],
    ) -> PrivateNoteResponse:
        ...


    async def unpublish_note(
        self,
        id: Annotated[StrictStr, Field(description="Note ID (UUIDv4)")],
    ) -> PrivateNoteResponse:
        ...


    async def update_my_note(
        self,
        id: Annotated[StrictStr, Field(description="Note ID (UUIDv4)")],
        update_my_note_request: UpdateMyNoteRequest,
    ) -> PrivateNoteResponse:
        ...
