from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Dict, Any

from app.application.services.comment_service import CommentApplicationService
from app.shared.dependencies import get_comment_application_service
from app.shared.validators import validate_uuid
from app.shared.auth import get_authenticated_user, UserContext
from app.generated.src.generated_fastapi_server.models.comments_list_response import CommentsListResponse
from app.generated.src.generated_fastapi_server.models.comment_response import CommentResponse
from app.generated.src.generated_fastapi_server.models.create_public_note_comment_request import CreatePublicNoteCommentRequest


router = APIRouter(prefix="/notes", tags=["Comments"])


@router.get("/{note_id}/comments", response_model=CommentsListResponse)
async def get_public_note_comments(
    note_id: str = Depends(validate_uuid),
    page: int = Query(1, ge=1, description="Page number for pagination"),
    limit: int = Query(20, ge=1, le=100, description="Number of items per page"),
    service: CommentApplicationService = Depends(get_comment_application_service),
):
    """Get comments for a public note."""
    try:
        comments, pagination = await service.list_comments_for_public_note(note_id, page, limit)
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
async def create_public_note_comment(
    note_id: str = Depends(validate_uuid),
    body: CreatePublicNoteCommentRequest = ...,
    user: UserContext = Depends(get_authenticated_user),
    service: CommentApplicationService = Depends(get_comment_application_service),
):
    """Create a comment on a public note. Broadcasts via WebSocket but returns empty response."""
    try:
        comment = await service.create_comment_on_public_note(
            note_id=note_id,
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