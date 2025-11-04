# OpenAPI‑First Backend Workflow

This document describes how the backend uses the OpenAPI spec in `docs/api/` as the single source of truth to generate Pydantic models, implement FastAPI routes, and enforce consistent response envelopes and authentication behavior aligned with the product’s “public-first + anonymous-friendly” design.

## Overview

We follow a schema‑first workflow:

- Source of truth: `docs/api/openapi.yml` (see also `docs/api/README.md`)
- Code generation: `pnpm api:be` (uses `@openapitools/openapi-generator-cli`)
- Clean architecture layering (see `docs/architecture/overview.md`)
- Firebase Auth integration for public, anonymous, and regular users (see `docs/auth-security/authentication.md`)

### Key Benefits

- Type‑safe contracts via generated Pydantic models
- Consistent response envelope across endpoints
- Separation of concerns with API/Application/Domain/Infra layers
- Smooth auth: public browsing, automatic anonymous access, optional upgrade

## Backend Layout

```
backend/src/app/
├── generated/                        # 🚫 Auto-generated (don’t edit)
│   └── src/generated_fastapi_server/
│       ├── models/                   # Pydantic models from OpenAPI
│       │   ├── public_note.py
│       │   ├── public_note_response.py
│       │   ├── private_note.py
│       │   ├── private_notes_list_response.py
│       │   ├── user_profile.py
│       │   ├── comment.py
│       │   ├── comment_response.py
│       │   └── ...
│       └── apis/                     # Generated API interfaces (unused)
│
├── api/                              # Transport layer (FastAPI routers)
│   ├── routes/
│   │   ├── notes.py                  # /notes (public notes)
│   │   ├── me_notes.py               # /me/notes (private notes)
│   │   ├── me.py                     # /me (user profile)
│   │   ├── auth.py                   # /auth (authentication)
│   │   └── comments.py               # /comments (note comments)
│   └── router.py                     # Main APIRouter
│
├── application/                      # Use cases/services
│   └── services/
│       ├── notes_service.py
│       ├── user_service.py
│       ├── comment_service.py
│       └── websocket_service.py
│
├── domain/                           # Entities and domain logic
│   ├── entities/
│   │   ├── note.py
│   │   ├── user_profile.py
│   │   └── comment.py
│   └── ports/                        # Repository interfaces
│       ├── notes_repository.py
│       ├── user_repository.py
│       └── comment_repository.py
│
├── infra/                            # Adapters (DB, AWS, Firebase Admin, etc.)
│   └── repositories/
│       ├── in_memory_*.py            # In-memory implementations
│       └── dynamodb_*.py             # DynamoDB implementations
│
├── shared/                           # Cross-cutting concerns
│   ├── auth.py                       # Firebase token verification
│   ├── dependencies.py               # DI helpers for services
│   ├── config.py                     # Environment configuration
│   ├── generated_imports.py          # Generated code import setup
│   └── validators.py                 # Common validators
│
└── main.py                           # FastAPI app factory / entrypoint
```

## Response Envelope

All responses follow the spec’d envelope (see `docs/api/components/schemas/*-response.yml`):

```json
{
  "status": "success",
  "data": { /* object or collection */ }
}
```

Error responses use:

```json
{
  "status": "error",
  "error": { "code": "ERROR_CODE", "message": "..." }
}
```

## Authentication Modes

- Public (no token): e.g. `GET /notes`, `GET /notes/{id}`
- Authenticated (anonymous or regular): e.g. `GET /me/notes`, `POST /me/notes`
- Regular users only: e.g. `GET /me`, `PATCH /me`

Flows and middleware patterns are detailed in `docs/auth-security/authentication.md`.

## Workflow

### 1) Validate and bundle the spec

```bash
pnpm api:lint
pnpm api:bundle  # outputs docs/api/openapi.bundled.yml
```

### 2) Generate backend models

```bash
pnpm api:be
```

Generated models land under `backend/src/app/generated/src/generated_fastapi_server/models/`.

### 3) Implement routes using response_model

Use the generated envelope models as `response_model` and call `.from_dict()` to create the response. The implementation now includes proper import setup via `generated_imports.py`.

#### Public Note Detail (no auth)

```python
from fastapi import APIRouter, HTTPException, Depends
from app.application.services.notes_service import NotesApplicationService
from app.shared.dependencies import get_notes_application_service
from app.shared.validators import validate_uuid
from app.generated.src.generated_fastapi_server.models.public_note_response import PublicNoteResponse

router = APIRouter(prefix="/notes", tags=["Public Notes"])

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
```

#### Private Notes (anonymous or regular)

```python
from fastapi import APIRouter, Depends, Query
from app.application.services.notes_service import NotesApplicationService
from app.shared.dependencies import get_notes_application_service
from app.shared.auth import get_authenticated_user, UserContext
from app.generated.src.generated_fastapi_server.models.private_notes_list_response import PrivateNotesListResponse

router = APIRouter(prefix="/me/notes", tags=["Personal Notebook"])

@router.get("", response_model=PrivateNotesListResponse)
async def list_my_notes(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    user: UserContext = Depends(get_authenticated_user),
    service: NotesApplicationService = Depends(get_notes_application_service),
):
    notes, pagination = await service.list_my_notes(user.uid, page, limit)
    
    response_data = {
        "status": "success",
        "data": {
            "notes": notes,
            "pagination": pagination
        }
    }
    return PrivateNotesListResponse.from_dict(response_data)
```

#### User Profile (regular only)

```python
from fastapi import APIRouter, Depends
from app.application.services.user_service import UserApplicationService
from app.shared.dependencies import get_user_application_service
from app.shared.auth import require_regular_user, UserContext
from app.generated.src.generated_fastapi_server.models.user_profile_response import UserProfileResponse

router = APIRouter(prefix="/me", tags=["User Profile"])

@router.get("", response_model=UserProfileResponse)
async def get_user_profile(
    user: UserContext = Depends(require_regular_user),
    service: UserApplicationService = Depends(get_user_application_service),
):
    profile = await service.get_profile(user.uid)
    if not profile:
        # Create default regular profile if missing (first-time login)
        profile = await service.update_profile(
            user.uid, 
            {"displayName": user.display_name or "User", "isAnonymous": False}
        )
    
    response_data = {
        "status": "success",
        "data": profile
    }
    return UserProfileResponse.from_dict(response_data)
```

### 4) Application services

Application services orchestrate domain/infra and return plain Python dicts that match the inner `data` shape from the spec. Envelope wrapping happens in the API layer (as shown above).

```python
class NotesApplicationService:
    async def get_public_note(self, note_id: str) -> dict | None:
        # Fetch from repo → map to dict matching PublicNote schema
        ...

    async def list_my_notes(self, user_id: str, page: int, limit: int) -> tuple[list[dict], dict]:
        # Return (notes, pagination) where notes/pagination match OpenAPI schemas
        ...
```

## Optional: Light data normalization with Pydantic validators

If your domain returns Python `datetime` objects, Pydantic can handle ISO8601 serialization. When you need extra normalization (e.g., ensure timezone awareness) you can extend the generated models with Pydantic v2 `field_validator` and reference the custom model in `response_model`.

```python
from pydantic import field_validator
from datetime import datetime, timezone
from app.generated.src.generated_fastapi_server.models.public_note import PublicNote as GeneratedPublicNote

class PublicNoteModel(GeneratedPublicNote):
    @field_validator("created_at", "updated_at", mode="before")
    @classmethod
    def ensure_tz(cls, v: str | datetime) -> datetime:
        if isinstance(v, str):
            return datetime.fromisoformat(v.replace("Z", "+00:00"))
        if v.tzinfo is None:
            return v.replace(tzinfo=timezone.utc)
        return v
```

Note: Only add such custom models where they provide clear value. Default generated models are sufficient for most cases.

## Notes

- Spec organization and naming (schemas, paths, casing) are defined in `docs/api/README.md`.
- Public/Private/Profile endpoints and flows align with `docs/ui/navigation.md` and `docs/ui/pages/*`.
- Authentication request patterns and middleware sketches are in `docs/auth-security/authentication.md`.
