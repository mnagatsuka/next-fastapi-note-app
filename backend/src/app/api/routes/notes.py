from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Literal

from app.application.services.notes_service import NotesApplicationService
from app.shared.dependencies import get_notes_application_service
from app.shared.validators import validate_uuid
from app.generated.src.generated_fastapi_server.models.public_notes_list_response import PublicNotesListResponse
from app.generated.src.generated_fastapi_server.models.public_note_response import PublicNoteResponse


router = APIRouter(prefix="/notes", tags=["Public Notes"])


@router.get("", response_model=PublicNotesListResponse)
async def list_latest_public_notes(
    page: int = Query(1, ge=1, description="Page number for pagination"),
    limit: int = Query(20, ge=1, le=100, description="Number of items per page"),
    sort: Literal["latest"] = Query("latest", description="Sort order (latest only)"),
    service: NotesApplicationService = Depends(get_notes_application_service),
):
    notes, pagination = await service.list_public_notes(page, limit, sort)
        
    response_data = {
        "status": "success",
        "data": {"notes": notes, "pagination": pagination}
    }
    return PublicNotesListResponse.from_dict(response_data)


@router.get("/{note_id}", response_model=PublicNoteResponse)
async def get_public_note(
    note_id: str = Depends(validate_uuid),
    service: NotesApplicationService = Depends(get_notes_application_service),
):
    note = await service.get_public_note(note_id)
        
    if note is None:
        raise HTTPException(status_code=404, detail="Not found")
        
    response_data = {
        "status": "success",
        "data": note
    }
    return PublicNoteResponse.from_dict(response_data)
