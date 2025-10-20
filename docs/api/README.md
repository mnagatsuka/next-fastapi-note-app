# Simple Note Application API Documentation

## 1. Overview

The Simple Note Application API provides a basic note-taking platform where anyone can browse latest public notes, while authenticated users can manage private plain text notes in their personal notebooks.

- **Current version**: v1.0.0
- **Base URLs**: 
  - Production: `https://api.example.com`
  - Staging: `https://staging-api.example.com`
  - Local: `http://localhost:8000`

### Key Features
- **Public-first**: No authentication required for browsing latest public notes
- **Anonymous-friendly**: Automatic anonymous user creation for notebook access
- **Progressive enhancement**: Regular users unlock basic profile management
- **Firebase Auth integration**: Bearer token authentication with anonymous account linking

## 2. Quick Start

### Authentication
The API supports two authentication modes:
- **No auth**: Public note browsing
- **Bearer token**: Firebase ID token in `Authorization: Bearer <token>` header

### User Registration Flow
The API automatically handles user registration:
- **Anonymous users**: Auto-registered in database when accessing private endpoints
- **Account linking**: Anonymous users can upgrade to regular accounts via client-side Firebase authentication
- **Data preservation**: All notes and data are preserved during account linking using Firebase `linkWithCredential`

### Basic Example: Get Latest Public Notes
```bash
curl "https://api.example.com/notes?page=1&limit=20" \
  -H "Accept: application/json"
```

### Basic Example: Get Private Notes
```bash
curl "https://api.example.com/me/notes" \
  -H "Authorization: Bearer your-firebase-id-token" \
  -H "Accept: application/json"
```

### Common Headers
- `Content-Type: application/json` for POST/PATCH requests
- `Authorization: Bearer <firebase-id-token>` for authenticated requests

## 3. OpenAPI Specification

- **Main spec**: [`openapi.yml`](./openapi.yml) - Complete API specification
- **Bundled spec**: [`openapi.bundled.yml`](./openapi.bundled.yml) - Resolved references for tooling
- **Interactive docs**: Available via ReDoc or Swagger UI

### Viewing the API Documentation
```bash
# Validate the spec
pnpm api:lint

# Bundle the spec
pnpm api:bundle

# View interactive docs
pnpm api:docs:api
```

## 4. Directory Structure

```
docs/api/
├── openapi.yml                    # Main OpenAPI specification
├── openapi.bundled.yml           # Bundled version (generated)
├── paths/                         # Path definitions organized by feature
│   ├── public-notes.yml           # Public latest notes endpoints
│   ├── personal-notebook.yml     # Private plain text notebook management
│   ├── user-profile.yml          # Basic user profile management
│   └── authentication.yml        # Auth flows and user registration
├── components/
│   ├── schemas/                   # Data models and request/response schemas
│   │   ├── public-note.yml        # Public note entity
│   │   ├── private-note.yml       # Private note entity
│   │   ├── user-profile.yml       # User profile entity
│   │   ├── *-response.yml         # Response wrappers
│   │   ├── *-request.yml          # Request payloads
│   │   └── *.yml                  # Common components (pagination, errors)
│   ├── examples/                  # Example data
│   │   ├── public-note.yml
│   │   ├── private-note.yml
│   │   └── user-profile.yml
│   ├── parameters/                # Reusable parameters
│   │   ├── page-param.yml
│   │   └── limit-param.yml
│   └── responses/                 # Common response definitions
│       ├── unauthorized.yml
│       ├── forbidden.yml
│       └── not-found.yml
└── README.md                     # This file
```

### File Naming Conventions
- **Schema files**: kebab-case (e.g., `public-note.yml`, `user-profile.yml`)
- **Schema references**: PascalCase (e.g., `PublicNote`, `UserProfile`)
- **Path files**: kebab-case (e.g., `public-notes.yml`, `user-profile.yml`)
- **Properties**: camelCase (e.g., `createdAt`, `displayName`)
- **Generated models**: snake_case in Python, camelCase in TypeScript

### Path Organization
The API endpoints are organized into feature-based path files:

- **`paths/public-notes.yml`** - Public latest notes browsing (no auth required)
- **`paths/personal-notebook.yml`** - Private plain text note management (anonymous & regular users)
- **`paths/user-profile.yml`** - Basic profile management (regular users only)
- **`paths/authentication.yml`** - Authentication flows and user registration

Each path file contains complete endpoint definitions and references back to the main specification for shared components.

## 5. Development

### Generating API Client Code

#### Frontend TypeScript (via Orval)
```bash
# Generate TypeScript types and React Query hooks
pnpm api:fe

# Generated files location:
frontend/src/lib/api/generated/
├── schemas/           # TypeScript interfaces
├── client.ts         # API client with React Query hooks
└── client.msw.ts     # MSW mock handlers
```

#### Backend FastAPI Models
```bash
# Generate Python Pydantic models
cd backend
uv run fastapi-code-generator

# Generated files location:
backend/src/app/generated/
└── src/generated_fastapi_server/models/  # Pydantic models
```

### Custom Configuration

#### Frontend Custom Fetch
The generated client uses `customFetch.ts` for:
- Automatic Firebase token refresh
- Bearer token header management
- Error handling and retries
- Request/response interceptors

#### Backend Authentication
The generated models integrate with:
- Firebase Admin SDK for ID token verification
- Bearer token validation middleware
- Anonymous user detection
- Custom claims processing

### API Endpoints Overview

#### Public Endpoints (No Auth)
- `GET /notes` - List latest public notes with pagination
- `GET /notes/{id}` - Get public note by UUID

#### Personal Notebook (Anonymous & Regular Users)
- `GET /me/notes` - List user's private plain text notes (auto-registers anonymous users)
- `POST /me/notes` - Create new private plain text note
- `GET /me/notes/{id}` - Get private note by UUID
- `PATCH /me/notes/{id}` - Update private note
- `DELETE /me/notes/{id}` - Delete private note

#### User Profile (Regular Users Only)
- `GET /me` - Get user profile
- `PATCH /me` - Update user profile

#### Authentication & User Registration
- `POST /auth/anonymous-login` - Validate Firebase anonymous token (auto-registers anonymous users)
- `GET /auth/login` - Validate Firebase regular user token
- `POST /auth/anonymous-promote` - Promote anonymous user to regular account
  
Note: Logout is handled entirely on the client via Firebase `signOut()`; no backend endpoint is required.

### Response Format

All API responses follow a consistent wrapper format:

```json
{
  "status": "success",
  "data": { ... }
}
```

Error responses use:

```json
{
  "status": "error",
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "field": "fieldName"
  }
}
```

### WebSocket Messages

Real-time comment notifications follow this format:

```json
{
  "type": "comment.created",
  "data": {
    "postId": "note-uuid",
    "comment": {
      "id": "comment-uuid",
      "content": "Comment text",
      "username": "user@example.com",
      "createdAt": "2024-01-15T12:00:00Z",
      "updatedAt": "2024-01-15T12:00:00Z",
      "postId": "note-uuid"
    }
  },
  "timestamp": "2024-01-15T12:00:00Z"
}
```

### Pagination

List endpoints include pagination metadata:

```json
{
  "status": "success",
  "data": {
    "notes": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 157,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```
