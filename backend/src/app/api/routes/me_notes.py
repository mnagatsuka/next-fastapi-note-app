from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.application.services.notes_service import NotesApplicationService
from app.application.services.comment_service import CommentApplicationService
from app.shared.auth import get_authenticated_user, UserContext
from app.shared.dependencies import get_notes_application_service, get_comment_application_service
from app.shared.validators import validate_uuid

from app.generated.src.generated_fastapi_server.models.private_notes_list_response import PrivateNotesListResponse
from app.generated.src.generated_fastapi_server.models.private_note_response import PrivateNoteResponse
from app.generated.src.generated_fastapi_server.models.delete_note_response import DeleteNoteResponse
from app.generated.src.generated_fastapi_server.models.create_my_note_request import CreateMyNoteRequest
from app.generated.src.generated_fastapi_server.models.update_my_note_request import UpdateMyNoteRequest
from app.generated.src.generated_fastapi_server.models.comments_list_response import CommentsListResponse
from app.generated.src.generated_fastapi_server.models.comment_response import CommentResponse
from app.generated.src.generated_fastapi_server.models.create_public_note_comment_request import CreatePublicNoteCommentRequest


router = APIRouter(prefix="/me/notes", tags=["Personal Notebook"])


@router.get("", response_model=PrivateNotesListResponse)
async def list_my_notes(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    user: UserContext = Depends(get_authenticated_user),
    service: NotesApplicationService = Depends(get_notes_application_service),
):
    notes, pagination = await service.list_my_notes(user.uid, page, limit)
    
    # Build response as raw data - let the response model handle all conversions
    response_data = {
        "status": "success",
        "data": {
            "notes": notes,
            "pagination": pagination
        }
    }
    
    # Return proper response
    return PrivateNotesListResponse.from_dict(response_data)


@router.post("", response_model=PrivateNoteResponse, status_code=status.HTTP_201_CREATED)
async def create_my_note(
    payload: CreateMyNoteRequest,
    user: UserContext = Depends(get_authenticated_user),
    service: NotesApplicationService = Depends(get_notes_application_service),
):
    # Validate that content is provided (since it's optional in the model but required for creation)
    if not payload.content or payload.content.strip() == "":
        raise HTTPException(status_code=422, detail="content is required")
    
    note = await service.create_my_note(user.uid, payload.title, payload.content)
    
    # Build response as raw data
    response_data = {
        "status": "success",
        "data": note
    }
    return PrivateNoteResponse.from_dict(response_data)


@router.get("/{note_id}", response_model=PrivateNoteResponse)
async def get_my_note(
    note_id: str = Depends(validate_uuid),
    user: UserContext = Depends(get_authenticated_user),
    service: NotesApplicationService = Depends(get_notes_application_service),
):
    note = await service.get_my_note(user.uid, note_id)
    if note is None:
        raise HTTPException(status_code=404, detail="Not found")
    
    # Build response as raw data
    response_data = {
        "status": "success",
        "data": note
    }
    return PrivateNoteResponse.from_dict(response_data)


@router.patch("/{note_id}", response_model=PrivateNoteResponse)
async def update_my_note(
    payload: UpdateMyNoteRequest,
    note_id: str = Depends(validate_uuid),
    user: UserContext = Depends(get_authenticated_user),
    service: NotesApplicationService = Depends(get_notes_application_service),
):
    note = await service.update_my_note(user.uid, note_id, payload.title, payload.content)
    if note is None:
        raise HTTPException(status_code=404, detail="Not found")
    
    # Build response as raw data
    response_data = {
        "status": "success",
        "data": note
    }
    return PrivateNoteResponse.from_dict(response_data)


@router.delete("/{note_id}", response_model=DeleteNoteResponse)
async def delete_my_note(
    note_id: str = Depends(validate_uuid),
    user: UserContext = Depends(get_authenticated_user),
    service: NotesApplicationService = Depends(get_notes_application_service),
):
    ok = await service.delete_my_note(user.uid, note_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Not found")
    
    # Build response as raw data
    response_data = {
        "status": "success",
        "data": {"id": note_id}
    }
    return DeleteNoteResponse.from_dict(response_data)


# Visibility toggle endpoints using unified table
@router.post("/{note_id}/publish", response_model=PrivateNoteResponse)
async def publish_note(
    note_id: str = Depends(validate_uuid),
    user: UserContext = Depends(get_authenticated_user),
    service: NotesApplicationService = Depends(get_notes_application_service),
):
    """Make note public using unified table"""
    updated_note_data = await service.publish_note(note_id, user.uid, user)
    if not updated_note_data:
        raise HTTPException(status_code=404, detail="Note not found")
    
    response_data = {
        "status": "success",
        "data": updated_note_data
    }
    return PrivateNoteResponse.from_dict(response_data)


@router.post("/{note_id}/unpublish", response_model=PrivateNoteResponse)
async def unpublish_note(
    note_id: str = Depends(validate_uuid),
    user: UserContext = Depends(get_authenticated_user),
    service: NotesApplicationService = Depends(get_notes_application_service),
):
    """Make note private using unified table"""
    updated_note_data = await service.unpublish_note(note_id, user.uid)
    if not updated_note_data:
        raise HTTPException(status_code=404, detail="Note not found")
    
    response_data = {
        "status": "success",
        "data": updated_note_data
    }
    return PrivateNoteResponse.from_dict(response_data)


# Comment endpoints for private notes

@router.get("/{note_id}/comments", response_model=CommentsListResponse)
async def get_private_note_comments(
    note_id: str = Depends(validate_uuid),
    page: int = Query(1, ge=1, description="Page number for pagination"),
    limit: int = Query(20, ge=1, le=100, description="Number of items per page"),
    user: UserContext = Depends(get_authenticated_user),
    service: CommentApplicationService = Depends(get_comment_application_service),
):
    """Get comments for my private note."""
    try:
        comments, pagination = await service.list_comments_for_private_note(note_id, user.uid, page, limit)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    
    # Transform comments to match the expected Comment model structure
    transformed_comments = []
    for comment in comments:
        transformed_comment = {
            "id": comment["id"],
            "content": comment["content"],
            "username": comment["author"]["displayName"],
            "createdAt": comment["createdAt"],
            "updatedAt": comment["updatedAt"],
            "postId": comment["noteId"]
        }
        transformed_comments.append(transformed_comment)
        
    response_data = {
        "success": True,
        "data": {
            "comments": transformed_comments, 
            "count": pagination.get("total", 0), 
            "postId": note_id
        }
    }
    return CommentsListResponse.from_dict(response_data)


@router.post("/{note_id}/comments", status_code=status.HTTP_201_CREATED, response_model=CommentResponse)
async def create_private_note_comment(
    note_id: str = Depends(validate_uuid),
    body: CreatePublicNoteCommentRequest = ...,
    user: UserContext = Depends(get_authenticated_user),
    service: CommentApplicationService = Depends(get_comment_application_service),
):
    """Create a comment on my private note. Broadcasts via WebSocket but returns empty response."""
    try:
        comment = await service.create_comment_on_private_note(
            note_id=note_id,
            owner_uid=user.uid,
            content=body.content,
            author_uid=user.uid,
            author_display_name=user.display_name or f"User {user.uid[:8]}",
            author_avatar_url=getattr(user, 'avatar_url', None),
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    
    # Transform comment to match the expected Comment model structure
    transformed_comment = {
        "id": comment["id"],
        "content": comment["content"],
        "username": comment["author"]["displayName"],
        "createdAt": comment["createdAt"],
        "updatedAt": comment["updatedAt"],
        "postId": comment["noteId"]
    }
    
    response_data = {
        "success": True,
        "data": transformed_comment
    }
    return CommentResponse.from_dict(response_data)

