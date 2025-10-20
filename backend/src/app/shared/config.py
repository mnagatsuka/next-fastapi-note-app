"""Application configuration (env-driven).

This keeps configuration simple and dependency-free while matching
docs guidance. Use `get_settings()` to access values.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache
from typing import List, Optional


def _get_bool(name: str, default: bool = False) -> bool:
    val = os.getenv(name)
    if val is None:
        return default
    return val.lower() in {"1", "true", "yes", "on"}


def _get_list(name: str, default: Optional[List[str]] = None) -> List[str]:
    raw = os.getenv(name)
    if raw is None:
        return default or []
    return [x.strip() for x in raw.split(",") if x.strip()]


@dataclass(frozen=True)
class Settings:
    # App/Environment
    env: str = os.getenv("APP_ENV", os.getenv("NODE_ENV", "development"))
    debug: bool = _get_bool("APP_DEBUG", default=True)

    # API
    api_host: str = os.getenv("API_HOST", "0.0.0.0")
    api_port: int = int(os.getenv("API_PORT", "8000"))
    cors_allowed_origins: List[str] = tuple(_get_list("CORS_ALLOWED_ORIGINS", ["http://localhost:3000"]))

    # Firebase (Admin) — used by auth middleware and services
    firebase_project_id: Optional[str] = os.getenv("FIREBASE_PROJECT_ID")
    firebase_client_email: Optional[str] = os.getenv("FIREBASE_CLIENT_EMAIL")
    firebase_private_key: Optional[str] = os.getenv("FIREBASE_PRIVATE_KEY")
    firebase_credentials_json: Optional[str] = os.getenv("FIREBASE_CREDENTIALS_JSON")
    firebase_auth_emulator_host: Optional[str] = os.getenv("FIREBASE_AUTH_EMULATOR_HOST")

    # Repository Configuration
    repository_provider: str = os.getenv("REPOSITORY_PROVIDER", "memory")
    environment: str = os.getenv("ENVIRONMENT", "development")
    
    # AWS Configuration
    aws_region: str = os.getenv("AWS_REGION", "ap-northeast-1")
    aws_access_key_id: Optional[str] = os.getenv("AWS_ACCESS_KEY_ID")
    aws_secret_access_key: Optional[str] = os.getenv("AWS_SECRET_ACCESS_KEY")
    aws_endpoint_url: Optional[str] = os.getenv("AWS_ENDPOINT_URL")
    
    # DynamoDB Configuration
    dynamodb_table_notes: str = os.getenv("DYNAMODB_TABLE_NOTES", "notes")
    dynamodb_table_users: str = os.getenv("DYNAMODB_TABLE_USERS", "users")
    
    # WebSocket Configuration
    app_serverless_websocket_endpoint: Optional[str] = os.getenv("APP_SERVERLESS_WEBSOCKET_ENDPOINT")

    
    # Misc
    log_level: str = os.getenv("LOG_LEVEL", "info")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
