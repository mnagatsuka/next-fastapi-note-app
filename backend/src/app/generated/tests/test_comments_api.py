# coding: utf-8

from fastapi.testclient import TestClient


from pydantic import Field, StrictStr  # noqa: F401
from typing_extensions import Annotated  # noqa: F401
from generated_fastapi_server.models.comment_response import CommentResponse  # noqa: F401
from generated_fastapi_server.models.comments_list_response import CommentsListResponse  # noqa: F401
from generated_fastapi_server.models.create_public_note_comment_request import CreatePublicNoteCommentRequest  # noqa: F401
from generated_fastapi_server.models.error_response import ErrorResponse  # noqa: F401


def test_create_private_note_comment(client: TestClient):
    """Test case for create_private_note_comment

    Create a comment on my private note
    """
    create_public_note_comment_request = generated_fastapi_server.CreatePublicNoteCommentRequest()

    headers = {
        "Authorization": "Bearer special-key",
    }
    # uncomment below to make a request
    #response = client.request(
    #    "POST",
    #    "/me/notes/{id}/comments".format(id='id_example'),
    #    headers=headers,
    #    json=create_public_note_comment_request,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_create_public_note_comment(client: TestClient):
    """Test case for create_public_note_comment

    Create a comment on a public note
    """
    create_public_note_comment_request = generated_fastapi_server.CreatePublicNoteCommentRequest()

    headers = {
        "Authorization": "Bearer special-key",
    }
    # uncomment below to make a request
    #response = client.request(
    #    "POST",
    #    "/notes/{id}/comments".format(id='id_example'),
    #    headers=headers,
    #    json=create_public_note_comment_request,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_get_private_note_comments(client: TestClient):
    """Test case for get_private_note_comments

    Get comments for my private note
    """

    headers = {
        "Authorization": "Bearer special-key",
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/me/notes/{id}/comments".format(id='id_example'),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_get_public_note_comments(client: TestClient):
    """Test case for get_public_note_comments

    Get comments for a public note
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/notes/{id}/comments".format(id='id_example'),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200

