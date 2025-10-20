# coding: utf-8

from typing import ClassVar, Dict, List, Tuple  # noqa: F401

from typing import Any
from generated_fastapi_server.models.error_response import ErrorResponse
from generated_fastapi_server.models.get_web_socket_connections200_response import GetWebSocketConnections200Response
from generated_fastapi_server.models.websocket_connect200_response import WebsocketConnect200Response
from generated_fastapi_server.models.websocket_connect400_response import WebsocketConnect400Response
from generated_fastapi_server.models.websocket_connect500_response import WebsocketConnect500Response
from generated_fastapi_server.models.websocket_connect_request import WebsocketConnectRequest
from generated_fastapi_server.models.websocket_disconnect200_response import WebsocketDisconnect200Response
from generated_fastapi_server.models.websocket_disconnect_request import WebsocketDisconnectRequest
from generated_fastapi_server.security_api import get_token_BearerAuth

class BaseWebSocketApi:
    subclasses: ClassVar[Tuple] = ()

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        BaseWebSocketApi.subclasses = BaseWebSocketApi.subclasses + (cls,)
    async def get_web_socket_connections(
        self,
    ) -> GetWebSocketConnections200Response:
        """Health check endpoint that returns the current number of active WebSocket connections. Used for monitoring and debugging. """
        ...


    async def websocket_connect(
        self,
        websocket_connect_request: WebsocketConnectRequest,
    ) -> WebsocketConnect200Response:
        """Internal endpoint for handling WebSocket connection events. This endpoint is triggered automatically by the WebSocket infrastructure when clients establish connections. """
        ...


    async def websocket_disconnect(
        self,
        websocket_disconnect_request: WebsocketDisconnectRequest,
    ) -> WebsocketDisconnect200Response:
        """Internal endpoint for handling WebSocket disconnection events. This endpoint is triggered automatically by the WebSocket infrastructure when clients disconnect. """
        ...
