# Suggested Development Commands

## Project Setup

### Initial Setup
```bash
# Install root dependencies
pnpm install

# Install backend dependencies
cd backend && uv sync --extra dev

# Install frontend dependencies  
cd frontend && pnpm install
```

## Development

### Running the Application
```bash
# Full stack with Docker
docker-compose up --build

# Backend only (from backend/)
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend only (from frontend/)
pnpm dev
```

### API Development
```bash
# Lint OpenAPI spec
pnpm api:lint

# Generate backend code from OpenAPI
pnpm api:be

# Generate frontend API client
pnpm api:fe

# Build API documentation
pnpm doc:api

# Preview API docs
pnpm doc:pj
```

## Code Quality

### Backend (from backend/)
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

### Frontend (from frontend/)
```bash
# Lint code
pnpm lint

# Format code
pnpm format

# Type checking
pnpm typecheck
```

## Testing

### Backend (from backend/)
```bash
# Run tests
uv run pytest

# Run tests with coverage
uv run pytest --cov=src --cov-report=html
```

### Frontend (from frontend/)
```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run tests with UI
pnpm test:ui
```

## Firebase Emulation
```bash
# Start all emulators
pnpm fb:emu

# Start auth emulator only
pnpm fb:emu:auth

# Start auth emulator with clean state
pnpm fb:emu:auth:clean
```

## Infrastructure

### Docker
```bash
# Build and run all services
docker-compose up --build

# Run specific service
docker-compose up backend
docker-compose up frontend

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### LocalStack (AWS Emulation)
```bash
# LocalStack runs automatically with docker-compose
# DynamoDB available at http://localhost:4566
```

## Useful System Commands (macOS)

### File Operations
```bash
# List files with details
ls -la

# Find files
find . -name "*.py" -type f

# Search in files (use rg if available)
rg "pattern" --type py
grep -r "pattern" . --include="*.py"
```

### Git Operations
```bash
# Status and diff
git status
git diff

# Branch operations
git branch
git checkout -b feature/new-feature
git merge main

# Commit operations
git add .
git commit -m "message"
git push origin branch-name
```

## Task Completion Checklist

When completing a task, ensure:
1. **Code Quality**: Run linting and formatting
2. **Type Safety**: Run type checking
3. **Tests**: Run and update tests
4. **API Sync**: Update API client if backend changes
5. **Documentation**: Update relevant documentation
6. **Git**: Commit changes with clear messages