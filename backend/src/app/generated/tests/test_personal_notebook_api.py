# coding: utf-8

from fastapi.testclient import TestClient


from pydantic import Field, StrictStr  # noqa: F401
from typing import Optional  # noqa: F401
from typing_extensions import Annotated  # noqa: F401
from app.generated.src.generated_fastapi_server.models.create_my_note_request import CreateMyNoteRequest  # noqa: F401
from app.generated.src.generated_fastapi_server.models.delete_note_response import DeleteNoteResponse  # noqa: F401
from app.generated.src.generated_fastapi_server.models.error_response import ErrorResponse  # noqa: F401
from app.generated.src.generated_fastapi_server.models.private_note_response import PrivateNoteResponse  # noqa: F401
from app.generated.src.generated_fastapi_server.models.private_notes_list_response import PrivateNotesListResponse  # noqa: F401
from app.generated.src.generated_fastapi_server.models.update_my_note_request import UpdateMyNoteRequest  # noqa: F401


def test_create_my_note(client: TestClient):
    """Test case for create_my_note

    Create a new private note
    """
    create_my_note_request = generated_fastapi_server.CreateMyNoteRequest()

    headers = {
        "Authorization": "Bearer special-key",
    }
    # uncomment below to make a request
    #response = client.request(
    #    "POST",
    #    "/me/notes",
    #    headers=headers,
    #    json=create_my_note_request,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_delete_my_note(client: TestClient):
    """Test case for delete_my_note

    Delete my private note
    """

    headers = {
        "Authorization": "Bearer special-key",
    }
    # uncomment below to make a request
    #response = client.request(
    #    "DELETE",
    #    "/me/notes/{id}".format(id='id_example'),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_get_my_note_by_id(client: TestClient):
    """Test case for get_my_note_by_id

    Get my private note by ID
    """

    headers = {
        "Authorization": "Bearer special-key",
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/me/notes/{id}".format(id='id_example'),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_get_my_notes(client: TestClient):
    """Test case for get_my_notes

    List my private notes
    """
    params = [("page", 1),     ("limit", 20)]
    headers = {
        "Authorization": "Bearer special-key",
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/me/notes",
    #    headers=headers,
    #    params=params,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_update_my_note(client: TestClient):
    """Test case for update_my_note

    Update my private note
    """
    update_my_note_request = generated_fastapi_server.UpdateMyNoteRequest()

    headers = {
        "Authorization": "Bearer special-key",
    }
    # uncomment below to make a request
    #response = client.request(
    #    "PATCH",
    #    "/me/notes/{id}".format(id='id_example'),
    #    headers=headers,
    #    json=update_my_note_request,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200

