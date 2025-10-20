# coding: utf-8

from typing import Dict, List  # noqa: F401
import importlib
import pkgutil

from generated_fastapi_server.apis.web_socket_api_base import BaseWebSocketApi
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

router = APIRouter()

ns_pkg = generated_fastapi_server.impl
for _, name, _ in pkgutil.iter_modules(ns_pkg.__path__, ns_pkg.__name__ + "."):
    importlib.import_module(name)


@router.get(
    "/websocket/connections",
    responses={
        200: {"model": GetWebSocketConnections200Response, "description": "Connection count retrieved successfully"},
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        500: {"description": "Failed to retrieve connection count"},
    },
    tags=["WebSocket"],
    summary="Get WebSocket connection count",
    response_model_by_alias=True,
)
async def get_web_socket_connections(
    token_BearerAuth: TokenModel = Security(
        get_token_BearerAuth
    ),
) -> GetWebSocketConnections200Response:
    """Health check endpoint that returns the current number of active WebSocket connections. Used for monitoring and debugging. """
    if not BaseWebSocketApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseWebSocketApi.subclasses[0]().get_web_socket_connections()


@router.post(
    "/websocket/connect",
    responses={
        200: {"model": WebsocketConnect200Response, "description": "Connection established successfully"},
        400: {"model": WebsocketConnect400Response, "description": "Bad request - invalid connection data"},
        500: {"model": WebsocketConnect500Response, "description": "Connection failed"},
    },
    tags=["WebSocket"],
    summary="WebSocket connection handler",
    response_model_by_alias=True,
)
async def websocket_connect(
    websocket_connect_request: WebsocketConnectRequest = Body(None, description=""),
) -> WebsocketConnect200Response:
    """Internal endpoint for handling WebSocket connection events. This endpoint is triggered automatically by the WebSocket infrastructure when clients establish connections. """
    if not BaseWebSocketApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseWebSocketApi.subclasses[0]().websocket_connect(websocket_connect_request)


@router.post(
    "/websocket/disconnect",
    responses={
        200: {"model": WebsocketDisconnect200Response, "description": "Disconnection handled successfully"},
        400: {"model": WebsocketConnect400Response, "description": "Bad request - invalid disconnection data"},
        500: {"model": WebsocketConnect500Response, "description": "Disconnection handling failed"},
    },
    tags=["WebSocket"],
    summary="WebSocket disconnection handler",
    response_model_by_alias=True,
)
async def websocket_disconnect(
    websocket_disconnect_request: WebsocketDisconnectRequest = Body(None, description=""),
) -> WebsocketDisconnect200Response:
    """Internal endpoint for handling WebSocket disconnection events. This endpoint is triggered automatically by the WebSocket infrastructure when clients disconnect. """
    if not BaseWebSocketApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseWebSocketApi.subclasses[0]().websocket_disconnect(websocket_disconnect_request)
