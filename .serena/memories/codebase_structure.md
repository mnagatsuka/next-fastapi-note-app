# Codebase Structure

## Root Directory
```
├── backend/                  # FastAPI backend application
├── frontend/                 # Next.js frontend application
├── infrastructure/           # Infrastructure as Code
├── docs/                     # Documentation
├── scripts/                  # Development scripts
├── docker-compose.yml        # Docker development setup
├── package.json             # Root package management
└── pnpm-lock.yaml          # Package lockfile
```

## Backend Structure (`backend/src/app/`)
Following **Clean Architecture** principles:

```
├── api/                    # API/Interface Layer
│   ├── routes/            # FastAPI route handlers
│   │   ├── auth.py        # Authentication endpoints
│   │   ├── me.py          # User profile endpoints
│   │   ├── me_notes.py    # Private notes endpoints
│   │   └── notes.py       # Public notes endpoints
│   └── schemas/           # API schemas (uses generated models)
├── application/           # Application Layer
│   └── services/          # Business logic services
│       ├── unified_notes_service.py
│       └── user_service.py
├── domain/               # Domain Layer
│   ├── entities/         # Domain entities
│   │   ├── note.py
│   │   ├── private_note.py
│   │   ├── unified_note.py
│   │   └── user_profile.py
│   └── ports/            # Repository interfaces
├── infra/               # Infrastructure Layer
│   └── repositories/    # Repository implementations
│       ├── dynamodb_*.py    # DynamoDB implementations
│       └── in_memory_*.py   # In-memory implementations
├── shared/              # Shared utilities
│   ├── auth.py          # Firebase authentication
│   ├── config.py        # Environment configuration
│   └── dependencies.py  # Dependency injection
└── main.py              # FastAPI application entry point
```

## Frontend Structure (`frontend/src/`)
```
├── app/                     # Next.js App Router
│   ├── (private)/          # Protected routes
│   │   ├── me/            # User profile & private notes
│   │   └── account/       # Account management
│   └── (public)/          # Public routes
│       └── notes/         # Public notes
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── auth/             # Authentication modals
│   ├── layout/           # Layout components
│   ├── notes/            # Note-related components
│   └── profile/          # Profile components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and configuration
│   ├── api/             # API client
│   ├── config/          # Environment configuration
│   ├── firebase/        # Firebase setup
│   ├── providers/       # React context providers
│   └── stores/          # Zustand state stores
├── mocks/               # MSW API mocking
└── styles/              # Global styles
```