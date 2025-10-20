"""FastAPI dependency injection configuration following DDD principles.

Adds environment-driven DI switching between in-memory and DynamoDB repositories.
"""

from functools import lru_cache
from fastapi import Depends

from app.shared.config import get_settings
from app.infra.repositories.in_memory_notes_repository import InMemoryNotesRepository
from app.infra.repositories.dynamodb_notes_repository import DynamoDBNotesRepository
from app.infra.repositories.in_memory_user_repository import InMemoryUserRepository
from app.infra.repositories.dynamodb_user_repository import DynamoDBUserRepository
from app.infra.repositories.in_memory_comment_repository import InMemoryCommentRepository
from app.application.services.notes_service import NotesApplicationService
from app.application.services.user_service import UserApplicationService
from app.application.services.comment_service import CommentApplicationService
from app.application.services.websocket_service import WebSocketService


# Repository layer dependencies
@lru_cache()
def get_notes_repository():
    """Get singleton notes repository instance (in-memory or DynamoDB)."""
    settings = get_settings()
    provider = (settings.repository_provider or "memory").lower()
    if provider == "dynamodb":
        env = (settings.environment or "development").lower()
        is_dev = env == "development"
        
        # Use local DynamoDB with explicit credentials only in development
        if is_dev and settings.aws_endpoint_url and settings.aws_endpoint_url.strip():
            # Local development with DynamoDB Local
            return DynamoDBNotesRepository(
                table_name=settings.dynamodb_table_notes,
                endpoint_url=settings.aws_endpoint_url,
                region_name=settings.aws_region,
                aws_access_key_id=settings.aws_access_key_id,
                aws_secret_access_key=settings.aws_secret_access_key,
            )
        else:
            # AWS Lambda/Staging/Production - use IAM role
            return DynamoDBNotesRepository(
                table_name=settings.dynamodb_table_notes,
                endpoint_url=None,
                region_name=settings.aws_region,
                aws_access_key_id=None,
                aws_secret_access_key=None,
            )
    return InMemoryNotesRepository()


@lru_cache()
def get_user_repository():
    """Get singleton user repository instance."""
    settings = get_settings()
    provider = (settings.repository_provider or "memory").lower()
    if provider == "dynamodb":
        env = (settings.environment or "development").lower()
        is_dev = env == "development"
        
        # Use local DynamoDB with explicit credentials only in development
        if is_dev and settings.aws_endpoint_url and settings.aws_endpoint_url.strip():
            # Local development with DynamoDB Local
            return DynamoDBUserRepository(
                table_name=settings.dynamodb_table_users,
                endpoint_url=settings.aws_endpoint_url,
                region_name=settings.aws_region,
                aws_access_key_id=settings.aws_access_key_id,
                aws_secret_access_key=settings.aws_secret_access_key,
            )
        else:
            # AWS Lambda/Staging/Production - use IAM role
            return DynamoDBUserRepository(
                table_name=settings.dynamodb_table_users,
                endpoint_url=None,
                region_name=settings.aws_region,
                aws_access_key_id=None,
                aws_secret_access_key=None,
            )
    return InMemoryUserRepository()


# Application layer dependencies
def get_notes_application_service(
    notes_repository=Depends(get_notes_repository),
) -> NotesApplicationService:
    """FastAPI dependency for notes application service."""
    return NotesApplicationService(notes_repository)


def get_user_application_service(
    user_repository=Depends(get_user_repository)
) -> UserApplicationService:
    """FastAPI dependency for user application service."""
    return UserApplicationService(user_repository)


# Comment repository dependencies
@lru_cache()
def get_comment_repository():
    """Get singleton comment repository instance (in-memory only for now)."""
    # For now, only support in-memory comments
    # TODO: Add DynamoDB comment repository when needed
    return InMemoryCommentRepository()


# WebSocket service dependency
@lru_cache()
def get_websocket_service() -> WebSocketService:
    """Get singleton WebSocket service instance."""
    return WebSocketService()


def get_comment_application_service(
    comment_repository=Depends(get_comment_repository),
    notes_repository=Depends(get_notes_repository),
    websocket_service=Depends(get_websocket_service),
) -> CommentApplicationService:
    """FastAPI dependency for comment application service."""
    return CommentApplicationService(comment_repository, notes_repository, websocket_service)


# Legacy dependency names for backward compatibility
def get_unified_notes_application_service(
    notes_repository=Depends(get_notes_repository),
) -> NotesApplicationService:
    """Backward compatibility alias for notes application service."""
    return NotesApplicationService(notes_repository)