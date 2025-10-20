# coding: utf-8

from typing import ClassVar, Dict, List, Tuple  # noqa: F401

from generated_fastapi_server.models.anonymous_promote_request import AnonymousPromoteRequest
from generated_fastapi_server.models.auth_result_response import AuthResultResponse
from generated_fastapi_server.models.error_response import ErrorResponse
from generated_fastapi_server.security_api import get_token_BearerAuth

class BaseAuthenticationApi:
    subclasses: ClassVar[Tuple] = ()

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        BaseAuthenticationApi.subclasses = BaseAuthenticationApi.subclasses + (cls,)
    async def authenticate_anonymous(
        self,
    ) -> AuthResultResponse:
        ...


    async def login_regular_user(
        self,
    ) -> AuthResultResponse:
        ...


    async def promote_anonymous_user(
        self,
        anonymous_promote_request: AnonymousPromoteRequest,
    ) -> AuthResultResponse:
        ...
