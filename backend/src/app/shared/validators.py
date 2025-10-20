from __future__ import annotations

import uuid

from fastapi import HTTPException, Path


def validate_uuid(note_id: str = Path(..., description="Note UUID")) -> str:
    """Validate that the note_id is a valid UUID format."""
    try:
        uuid.UUID(note_id)
        return note_id
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid UUID format")