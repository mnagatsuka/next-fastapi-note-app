# coding: utf-8

from fastapi.testclient import TestClient


from pydantic import Field, StrictStr, field_validator  # noqa: F401
from typing import Optional  # noqa: F401
from typing_extensions import Annotated  # noqa: F401
from app.generated.src.generated_fastapi_server.models.error_response import ErrorResponse  # noqa: F401
from app.generated.src.generated_fastapi_server.models.public_note_response import PublicNoteResponse  # noqa: F401
from app.generated.src.generated_fastapi_server.models.public_notes_list_response import PublicNotesListResponse  # noqa: F401


def test_get_note_by_id(client: TestClient):
    """Test case for get_note_by_id

    Get public note by ID
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/notes/{id}".format(id='id_example'),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_get_notes(client: TestClient):
    """Test case for get_notes

    List latest public notes
    """
    params = [("page", 1),     ("limit", 20),     ("sort", latest)]
    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/notes",
    #    headers=headers,
    #    params=params,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200

