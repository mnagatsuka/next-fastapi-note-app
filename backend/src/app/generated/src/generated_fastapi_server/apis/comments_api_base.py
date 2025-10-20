# coding: utf-8

from typing import ClassVar, Dict, List, Tuple  # noqa: F401

from pydantic import Field, StrictStr
from typing_extensions import Annotated
from generated_fastapi_server.models.comment_response import CommentResponse
from generated_fastapi_server.models.comments_list_response import CommentsListResponse
from generated_fastapi_server.models.create_public_note_comment_request import CreatePublicNoteCommentRequest
from generated_fastapi_server.models.error_response import ErrorResponse
from generated_fastapi_server.security_api import get_token_BearerAuth

class BaseCommentsApi:
    subclasses: ClassVar[Tuple] = ()

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        BaseCommentsApi.subclasses = BaseCommentsApi.subclasses + (cls,)
    async def create_private_note_comment(
        self,
        id: Annotated[StrictStr, Field(description="Note ID (UUIDv4)")],
        create_public_note_comment_request: CreatePublicNoteCommentRequest,
    ) -> CommentResponse:
        """Creates a new comment on a private note owned by the authenticated user. Automatically broadcasts the new comment to all connected WebSocket clients. """
        ...


    async def create_public_note_comment(
        self,
        id: Annotated[StrictStr, Field(description="Note ID (UUIDv4)")],
        create_public_note_comment_request: CreatePublicNoteCommentRequest,
    ) -> CommentResponse:
        """Creates a new comment on a public note. Requires authentication. Automatically broadcasts the new comment to all connected WebSocket clients. """
        ...


    async def get_private_note_comments(
        self,
        id: Annotated[StrictStr, Field(description="Note ID (UUIDv4)")],
    ) -> CommentsListResponse:
        ...


    async def get_public_note_comments(
        self,
        id: Annotated[StrictStr, Field(description="Note ID (UUIDv4)")],
    ) -> CommentsListResponse:
        ...
