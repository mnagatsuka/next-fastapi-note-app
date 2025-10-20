# Getting Started - Frontend Development

This guide will help you set up and run the frontend application for the Note Taking App built with Next.js 15, Firebase Auth, and TypeScript.

## Prerequisites

Before starting, make sure you have:

- **Node.js** 20+ installed
- **pnpm** package manager
- **Firebase project** with Authentication enabled
- **Git** for version control

## Initial Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd next-fastapi-note-app

# Navigate to frontend directory
cd frontend

# Install dependencies
pnpm install
```

### 2. Environment Configuration

Copy the example environment file and configure it:

```bash
# Copy environment template
cp .env.example .env.development
```

Edit `.env.development` with your Firebase credentials:

```bash
# Client-side environment variables (accessible in browser)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_API_MOCKING=false
# NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
# NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
# NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Server-side environment variables (Node.js only)
NODE_ENV=development
APP_ENV=development
API_BASE_URL=http://backend:8000
API_TIMEOUT=30000
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_SERVICE_ACCOUNT_JSON=path/to/service-account-key.json
FIREBASE_API_KEY=your_server_firebase_api_key
FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
```

### 3. Get Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Go to **Project Settings** > **General**
4. In "Your apps" section, find your web app and copy the config values
5. Go to **Project Settings** > **Service accounts**
6. Click **Generate new private key** and download the JSON file
7. Extract the required values from the JSON file

### 4. Enable Firebase Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Email/password** provider
3. Enable **Anonymous** provider

### 5. Generate API Client Code

If the OpenAPI specification has been updated, generate the frontend client code:

```bash
# From project root
pnpm api:fe
```

This generates:
- TypeScript interfaces in `src/lib/api/generated/schemas/`
- TanStack Query hooks in `src/lib/api/generated/client.ts`
- MSW mock handlers in `src/lib/api/generated/client.msw.ts`

### 6. Start Development Server

```bash
# Start the development server
pnpm dev
```

The application will be available at **http://localhost:3000**

### 7. Verify Setup

1. Open http://localhost:3000 in your browser
2. You should see the home page with public notes (may be empty initially)
3. Try accessing private features (like "My Notebook") - this should trigger anonymous authentication
4. Check browser console for any errors

## Optional: Firebase Emulator for Local Development

For local testing without connecting to live Firebase:

```bash
# Install Firebase CLI
pnpm add -D firebase-tools

# Login to Firebase (one-time setup)
npx firebase login

# Initialize emulators
npx firebase init emulators
# Select: Authentication Emulator
# Use default port (9099)

# Update .env.development
NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST=localhost:9099

# Start emulator
npx firebase emulators:start --only auth
```

## Essential Commands

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm typecheck        # Check TypeScript types

# Code generation
pnpm api:fe           # Generate frontend code from OpenAPI

# Code quality
pnpm lint             # Run linter
pnpm format           # Format code
```

## Verification Checklist

- [ ] Dependencies installed successfully
- [ ] Environment variables configured
- [ ] Firebase project created and configured
- [ ] Authentication providers enabled
- [ ] Development server starts without errors
- [ ] Application loads at http://localhost:3000
- [ ] Anonymous authentication works (try accessing private pages)
- [ ] No console errors in browser DevTools

You're now ready to start developing! The frontend uses schema-first development with automatic code generation, so most API integration code is generated automatically from the OpenAPI specification.

## Backend Startup (Quick Start)

Use this when you want a working API locally alongside the frontend. This follows the OpenAPI‑first backend workflow and Firebase auth model.

### 1) Generate backend models from OpenAPI

From project root (uses `docs/api/openapi.yml`):

```bash
pnpm api:lint
pnpm api:bundle
pnpm api:be   # generates Pydantic models under backend/src/app/generated/
```

### 2) Start the FastAPI server (manual)

In one terminal:

```bash
cd backend

# Option A: FastAPI CLI (if available)
uv run fastapi dev src/app/main.py

# Option B: Uvicorn
# (runs main:app inside src/app)
uvicorn main:app --reload --host 0.0.0.0 --port 8000 --app-dir src/app
```

API base URL: `http://localhost:8000`

### 3) Verify endpoints

- Public (no auth):
```bash
curl "http://localhost:8000/notes?page=1&limit=20" -H "Accept: application/json"
```

- Authenticated (anonymous or regular): obtain a Firebase ID token, then:
```bash
# Private notes
curl "http://localhost:8000/me/notes" \
  -H "Authorization: Bearer <firebase-id-token>" \
  -H "Accept: application/json"

# Anonymous login handshake (if you need to trigger user creation)
curl -X POST "http://localhost:8000/auth/anonymous-login" \
  -H "Authorization: Bearer <firebase-id-token>"
```

Notes:
- The backend enforces the response envelope `{ status: 'success', data: ... }` as defined in `docs/api/components/schemas/*-response.yml`.
- Authentication flows and token validation patterns are described in `docs/auth-security/authentication.md`.
- Architectural context (layers and OpenAPI‑first approach) is in `docs/architecture/overview.md`.
