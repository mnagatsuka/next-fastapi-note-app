# coding: utf-8

from fastapi.testclient import TestClient


from typing import Any  # noqa: F401
from generated_fastapi_server.models.error_response import ErrorResponse  # noqa: F401
from generated_fastapi_server.models.get_web_socket_connections200_response import GetWebSocketConnections200Response  # noqa: F401
from generated_fastapi_server.models.websocket_connect200_response import WebsocketConnect200Response  # noqa: F401
from generated_fastapi_server.models.websocket_connect400_response import WebsocketConnect400Response  # noqa: F401
from generated_fastapi_server.models.websocket_connect500_response import WebsocketConnect500Response  # noqa: F401
from generated_fastapi_server.models.websocket_connect_request import WebsocketConnectRequest  # noqa: F401
from generated_fastapi_server.models.websocket_disconnect200_response import WebsocketDisconnect200Response  # noqa: F401
from generated_fastapi_server.models.websocket_disconnect_request import WebsocketDisconnectRequest  # noqa: F401


def test_get_web_socket_connections(client: TestClient):
    """Test case for get_web_socket_connections

    Get WebSocket connection count
    """

    headers = {
        "Authorization": "Bearer special-key",
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/websocket/connections",
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_websocket_connect(client: TestClient):
    """Test case for websocket_connect

    WebSocket connection handler
    """
    websocket_connect_request = generated_fastapi_server.WebsocketConnectRequest()

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "POST",
    #    "/websocket/connect",
    #    headers=headers,
    #    json=websocket_connect_request,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_websocket_disconnect(client: TestClient):
    """Test case for websocket_disconnect

    WebSocket disconnection handler
    """
    websocket_disconnect_request = generated_fastapi_server.WebsocketDisconnectRequest()

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "POST",
    #    "/websocket/disconnect",
    #    headers=headers,
    #    json=websocket_disconnect_request,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200

