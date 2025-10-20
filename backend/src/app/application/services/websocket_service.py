"""WebSocket service for broadcasting messages through API Gateway WebSocket."""

from __future__ import annotations

import json
import logging
from typing import Any

import httpx

from app.shared.config import get_settings

logger = logging.getLogger(__name__)


class WebSocketService:
    """Service for sending messages through WebSocket API Gateway."""

    def __init__(self) -> None:
        self.settings = get_settings()
        self.client = httpx.AsyncClient(timeout=30.0)

    async def close(self) -> None:
        """Close the HTTP client."""
        await self.client.aclose()

    async def broadcast_comment_created(
        self,
        note_id: str,
        comment: dict[str, Any],
        is_private_note: bool = False,
    ) -> bool:
        """Broadcast new comment creation to all connected WebSocket clients.
        
        Args:
            note_id: The ID of the note the comment was created on
            comment: Comment data to broadcast
            is_private_note: Whether this is a private note comment
            
        Returns:
            True if broadcast was successful, False otherwise
        """
        message_data = {
            "type": "comment.created",
            "data": {
                "noteId": note_id,
                "comment": comment,
                "isPrivateNote": is_private_note,
            },
            "timestamp": comment.get("created_at"),
        }

        return await self._send_broadcast(message_data)

    async def _send_broadcast(self, message_data: dict[str, Any]) -> bool:
        """Send broadcast message to WebSocket API Gateway.
        
        Args:
            message_data: The message data to broadcast
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Get the WebSocket broadcast endpoint from settings
            endpoint_url = self.settings.app_serverless_websocket_endpoint
            if not endpoint_url:
                logger.warning("WebSocket endpoint not configured, skipping broadcast")
                return False

            # For development with serverless offline, use the HTTP broadcast endpoint
            if endpoint_url.startswith("http://localhost") or endpoint_url.startswith("http://serverless"):
                broadcast_url = f"{endpoint_url}/development/broadcast/comments"
            else:
                # Production AWS API Gateway endpoint
                broadcast_url = f"{endpoint_url}/broadcast/comments"

            logger.debug(f"Broadcasting message to: {broadcast_url}")
            logger.debug(f"Message data: {json.dumps(message_data, indent=2)}")

            response = await self.client.post(
                broadcast_url,
                json=message_data,
                headers={"Content-Type": "application/json"},
            )

            if response.status_code == 200:
                logger.info(f"Successfully broadcasted comment message for note {message_data.get('data', {}).get('noteId')}")
                return True
            else:
                logger.error(f"Failed to broadcast message. Status: {response.status_code}, Response: {response.text}")
                return False

        except httpx.TimeoutException:
            logger.error("WebSocket broadcast request timed out")
            return False
        except Exception as e:
            logger.error(f"Failed to broadcast WebSocket message: {e}")
            return False