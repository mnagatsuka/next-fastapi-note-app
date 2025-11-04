# Getting Started

Quick setup guide for the Note Taking App (Next.js 15 + Firebase Auth).

## Prerequisites

- **Node.js** 20+ 
- **pnpm** package manager
- **Firebase project** with Authentication enabled

## Initial Setup

### 1. Install Dependencies

```bash
# Clone and navigate to project
git clone <repository-url>
cd next-fastapi-note-app/frontend

# Install dependencies
pnpm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env.development
```

Edit `.env.development` with your Firebase credentials (get from Firebase Console → Project Settings):

```bash
# Required Firebase config
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# Optional: Firebase emulator for local development
NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create project or select existing one
3. **Authentication** → **Sign-in method** → Enable **Anonymous** provider
4. **Project Settings** → **General** → Copy web app config values

## Docker Development (Recommended)

### Quick Start with Docker

```bash
# Start all services
docker compose up -d

# Or start specific services
docker compose up frontend backend
docker compose up localstack serverless
```

### Docker Services

The `docker-compose.yml` provides a complete development environment:

#### Infrastructure Services
- **LocalStack** (port 4566): DynamoDB emulation for local development
- **Serverless** (ports 3001, 3002): WebSocket API and HTTP broadcast endpoints

#### Application Services  
- **Frontend** (port 3000): Next.js development server with hot reload
- **Backend** (port 8000): FastAPI server with hot reload

### Service URLs

After running `docker-compose up`:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **WebSocket**: ws://localhost:3001
- **LocalStack**: http://localhost:4566

### Docker Commands

```bash
# Start all services
docker compose up

# Start in background
docker compose up -d

# Start specific services
docker compose up frontend backend

# Rebuild and start
docker compose up --build

# Stop all services
docker compose down

# View logs
docker compose logs -f frontend
docker compose logs -f backend
```

## Available Commands

```bash
# Development (frontend directory)
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm lint             # Run linter  
pnpm format           # Format code
pnpm typecheck        # Check TypeScript types
pnpm test             # Run tests

# From project root
pnpm api:fe           # Generate frontend code from OpenAPI
pnpm api:be           # Generate backend code from OpenAPI
pnpm fb:emu:auth      # Start Firebase auth emulator
```

## Optional: Firebase Emulator

For local testing without live Firebase:

```bash
# From project root
pnpm fb:emu:auth

# Update .env.development
NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
```

### 3. Test Endpoints

```bash
# Public notes
curl "http://localhost:8000/notes?page=1&limit=20"

# Private notes (requires Firebase auth token)
curl "http://localhost:8000/me/notes" -H "Authorization: Bearer <token>"
```

## Troubleshooting

### Docker Issues

```bash
# If containers fail to start
docker-compose down
docker-compose up --build

# Check service logs
docker-compose logs -f <service-name>

# Reset volumes
docker-compose down -v
docker-compose up
```

### Common Problems

- **Port conflicts**: Make sure ports 3000, 8000, 3001, 4566 are available
- **Environment files**: Ensure `.env.development` files exist in frontend/ and backend/
- **Firebase config**: Update Firebase credentials in environment files
