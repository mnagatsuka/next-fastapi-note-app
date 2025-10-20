# coding: utf-8

from fastapi.testclient import TestClient


from app.generated.src.generated_fastapi_server.models.auth_result_response import AuthResultResponse  # noqa: F401
from app.generated.src.generated_fastapi_server.models.error_response import ErrorResponse  # noqa: F401


def test_authenticate_anonymous(client: TestClient):
    """Test case for authenticate_anonymous

    Authenticate anonymous user (validate Firebase anonymous token)
    """

    headers = {
        "Authorization": "Bearer special-key",
    }
    # uncomment below to make a request
    #response = client.request(
    #    "POST",
    #    "/auth/anonymous-login",
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_login_regular_user(client: TestClient):
    """Test case for login_regular_user

    Authenticate regular user (validate Firebase token; may insert user)
    """

    headers = {
        "Authorization": "Bearer special-key",
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/auth/login",
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_promote_anonymous_user(client: TestClient):
    """Test case for promote_anonymous_user

    Promote anonymous user to regular account
    """

    headers = {
        "Authorization": "Bearer special-key",
    }
    # uncomment below to make a request
    #response = client.request(
    #    "POST",
    #    "/auth/anonymous-promote",
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200

