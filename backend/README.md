# Backend - FastAPI Note Application

This is the backend service for the Next.js FastAPI note-taking application, built with FastAPI and following Clean Architecture principles with Domain-Driven Design (DDD).

## Architecture

The application follows a **Clean Architecture** pattern with clear separation of concerns:

```
backend/src/app/
├── api/                    # API/Interface Layer
│   ├── routes/            # FastAPI route handlers
│   │   ├── auth.py        # Authentication endpoints
│   │   ├── me.py          # User profile endpoints
│   │   ├── me_notes.py    # Private notes endpoints
│   │   └── notes.py       # Public notes endpoints
│   └── schemas/           # API schemas (uses generated models)
├── application/           # Application Layer
│   └── services/          # Business logic services
│       ├── notes_service.py
│       └── user_service.py
├── domain/               # Domain Layer
│   ├── entities/         # Domain entities
│   │   ├── note.py       # Public note entity
│   │   ├── private_note.py
│   │   └── user_profile.py
│   └── ports/            # Repository interfaces
│       ├── notes_repository.py
│       ├── private_notes_repository.py
│       └── user_repository.py
├── infra/               # Infrastructure Layer
│   └── repositories/    # Repository implementations
│       ├── dynamodb_*.py      # DynamoDB implementations
│       └── in_memory_*.py     # In-memory implementations
├── generated/           # OpenAPI generated code
│   ├── src/generated_fastapi_server/  # Generated models & APIs
│   └── tests/           # Generated test files
├── shared/              # Shared utilities
│   ├── auth.py          # Firebase authentication
│   ├── config.py        # Environment-driven configuration
│   └── dependencies.py  # Dependency injection
└── main.py              # FastAPI application entry point
```

## Technology Stack

**Core Dependencies:**
- **FastAPI 0.115.0+** - Modern web framework
- **Uvicorn 0.24.0+** - ASGI server with uvloop  
- **Pydantic 2.0+** - Data validation and serialization
- **Python 3.11+** - Minimum Python version

**Database & Cloud Services:**
- **boto3/botocore 1.34.0+** - AWS SDK for DynamoDB
- **firebase-admin 6.2.0+** - Firebase authentication

**Development Tools:**
- **pytest 7.0+** with pytest-asyncio - Testing framework
- **ruff 0.1.0+** - Linting and formatting
- **mypy 1.5.0+** - Type checking
- **uv** - Fast package management

## Features

- **Environment-driven dependency injection** - Switch between in-memory and DynamoDB repositories
- **Clean Architecture** - Domain-driven design with proper layering
- **Firebase Authentication** - Secure user authentication with token verification
- **Public and Private Notes** - Support for both public and private note management
- **OpenAPI-first approach** - Code generation from OpenAPI specification
- **Modern Python tooling** - Uses uv for package management and ruff for linting/formatting
- **Flexible deployment** - Docker containers for Lambda and traditional deployment

## Prerequisites

- Python 3.11+
- [uv](https://docs.astral.sh/uv/) for package management
- AWS CLI configured (for DynamoDB in production)
- Firebase project setup (for authentication)

## Setup

1. **Install dependencies:**
   ```bash
   uv sync --extra dev
   ```

2. **Environment variables:**
   Create a `.env` file in the backend directory:
   ```bash
   # App Configuration
   APP_ENV=development
   API_HOST=0.0.0.0
   API_PORT=8000
   
   # Repository Configuration
   REPOSITORY_PROVIDER=memory  # or "dynamodb"
   ENVIRONMENT=development
   
   # AWS Configuration (for DynamoDB)
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_access_key  # for local development only
   AWS_SECRET_ACCESS_KEY=your_secret_key  # for local development only
   AWS_ENDPOINT_URL=http://localhost:8000  # for DynamoDB Local
   
   # DynamoDB Table Names
   DYNAMODB_TABLE_NOTES=notes
   DYNAMODB_TABLE_PRIVATE_NOTES=private_notes
   DYNAMODB_TABLE_USERS=users
   
   # Firebase Configuration
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_CLIENT_EMAIL=your_service_account_email
   FIREBASE_PRIVATE_KEY=your_private_key
   FIREBASE_AUTH_EMULATOR_HOST=localhost:9099  # for local development
   ```

## Development Commands

### Running the application:
```bash
# Development server with hot reload
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production server
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Code quality:
```bash
# Lint code
uv run ruff check src/

# Format code
uv run ruff format src/

# Type checking
uv run mypy src/

# Run all checks
uv run ruff check src/ && uv run ruff format --check src/ && uv run mypy src/

# Auto-fix issues
uv run ruff check --fix src/ && uv run ruff format src/
```

### Testing:
```bash
# Run tests
uv run pytest

# Run tests with coverage
uv run pytest --cov=src --cov-report=html
```

## Repository Providers

### In-Memory (Default)
- Uses in-memory storage with sample data
- Perfect for development and testing
- No external dependencies required

### DynamoDB
- Production-ready persistent storage
- Supports both local DynamoDB and AWS DynamoDB
- Set `REPOSITORY_PROVIDER=dynamodb` in environment

## API Endpoints

The API provides the following endpoint groups:

- **`/notes`** - Public notes (read-only access)
- **`/me/notes`** - Private notes (authenticated CRUD operations)
- **`/me`** - User profile management
- **`/auth`** - Authentication endpoints

## Authentication

**Firebase Integration:**
- Uses Firebase Admin SDK for token verification
- Development mode with simulated verification
- Token format: `"anon:<uid>"` for anonymous, `"user:<uid>"` for authenticated users
- User context includes uid, email, and display_name

## Deployment

### Docker Development
```bash
# Build and run development container
docker-compose up --build backend
```

### AWS Lambda
The application includes a Lambda-optimized Dockerfile for serverless deployment:

```bash
# Build Lambda container
docker build -f Dockerfile.lambda -t backend-lambda .
```

**AWS SAM Deployment:**
- Complete CloudFormation template in `infrastructure/aws-sam/`
- DynamoDB tables, API Gateway, and Lambda functions
- WebSocket support for real-time features

## API Documentation

Once running, visit:
- **Interactive API docs:** http://localhost:8000/docs
- **Alternative API docs:** http://localhost:8000/redoc

## Configuration

The application uses environment-driven configuration through `src/app/shared/config.py`:

- **Repository switching** via `REPOSITORY_PROVIDER`
- **Environment detection** via `ENVIRONMENT`  
- **AWS credential handling** for local vs production
- **Firebase authentication** configuration
- **CORS settings** and logging configuration

## Code Generation

The project uses an OpenAPI-first approach:
- API models and schemas are generated from OpenAPI specification
- Generated code is in the `generated/` directory
- Handwritten business logic integrates with generated models
- Generated tests provide comprehensive API coverage