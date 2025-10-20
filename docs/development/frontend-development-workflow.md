# Development Workflow: Next.js Firebase Note App

This document outlines the development workflow for our note-taking application built with Next.js 15 App Router, Firebase Auth, and a schema-driven API approach. The application supports public note browsing, anonymous user notebooks, and account management.

## 🎯 Overview

Our development workflow combines **schema-first API design** with **Firebase authentication** and **progressive enhancement UX patterns**. All TypeScript types, TanStack Query hooks, and MSW mocks are automatically generated from the OpenAPI specification in `docs/api/openapi.yml`, while Firebase Auth handles user sessions with anonymous-to-regular account progression.

### Key Benefits

- ✅ **End-to-end Type Safety**: From API response to React component props
- ✅ **Zero Manual Typing**: All types generated from OpenAPI schemas
- ✅ **Firebase Auth Integration**: Anonymous-first authentication with account progression
- ✅ **Automated Mocks**: MSW handlers with realistic data from OpenAPI examples
- ✅ **TanStack Query Integration**: Type-safe hooks for data fetching and mutations
- ✅ **Progressive Enhancement**: Public-first, authentication enhances experience
- ✅ **IntelliSense Support**: Full autocompletion and validation in IDE

## 📁 Frontend Architecture

```
frontend/src/
├── app/                              # Next.js App Router pages
│   ├── api/auth/                     # Authentication API routes
│   ├── (public)/                     # Public pages (SSR)
│   │   ├── page.tsx                  # Home - latest notes
│   │   └── notes/[id]/page.tsx       # Public note detail
│   ├── (private)/                    # Private pages (CSR)
│   │   ├── me/page.tsx               # My Notebook
│   │   └── account/page.tsx          # Account Profile
│   └── not-found.tsx                 # 404 error page
│
├── components/
│   ├── auth/                         # Authentication components
│   │   ├── LoginModal.tsx            # Uses AuthRequest types
│   │   └── SignUpModal.tsx           # Uses UserRegistration types
│   ├── notes/
│   │   ├── NoteCard.tsx              # Uses PublicNote/PrivateNote types
│   │   ├── NoteEditor.tsx            # Uses CreateMyNoteRequest type
│   │   └── NoteList.tsx              # Uses PublicNotesListResponse/PrivateNotesListResponse
│   ├── layout/
│   │   ├── Header.tsx                # Navigation with auth state
│   │   └── Footer.tsx                # Static footer
│   └── ui/                           # shadcn/ui components
│
├── lib/
│   ├── api/
│   │   ├── generated/                # 🚫 Auto-generated (don't edit)
│   │   │   ├── client.ts             # TanStack Query hooks
│   │   │   ├── client.msw.ts         # MSW mock handlers
│   │   │   └── schemas/              # TypeScript interfaces
│   │   │       ├── public-note.ts    # PublicNote interface
│   │   │       ├── private-note.ts   # PrivateNote interface
│   │   │       └── user-profile.ts   # UserProfile interface
│   │   └── customFetch.ts            # Custom fetch with Firebase auth
│   ├── auth/                         # Firebase auth utilities
│   ├── firebase/                     # Firebase client setup
│   ├── providers/                    # React context providers
│   └── utils/                        # General utilities
│
├── stores/                           # Zustand stores
│   ├── authStore.ts                  # Authentication state
│   └── modalStore.ts                 # Modal visibility state
│
├── mocks/
│   ├── handlers/index.ts             # MSW handler setup
│   ├── browser.ts                    # Browser MSW setup
│   └── server.ts                     # Node MSW setup (testing)
│
└── types/                            # Custom frontend-only types
```

## 🔄 Development Workflow

### 1. Schema-to-Code Generation

When OpenAPI schemas change, regenerate frontend code:

```bash
# From project root
pnpm api:fe
```

This runs:
1. `pnpm api:bundle` - Bundles OpenAPI spec to `docs/api/openapi.bundled.yml`
2. `pnpm orval:gen` - Generates TypeScript code and MSW mocks

### 2. Authentication-First Development

Our app follows an **anonymous-first** authentication pattern:

1. **Public Pages** (SSR): Home, note detail, 404 - no auth required
2. **Private Pages** (CSR): My Notebook, Account - auto-creates anonymous users
3. **Account Progression**: Anonymous → Regular via Firebase `linkWithCredential`

Bridge calls to backend (per docs/api):
- After `signInAnonymously()`: call `POST /auth/anonymous-login` with Bearer token to ensure DB user
- After regular login/signup (`signInWithEmailAndPassword`/provider): call `GET /auth/login`
- After anonymous promotion (`linkWithCredential`): call `POST /auth/anonymous-promote`
- Logout: client-only via Firebase `signOut()`; no backend endpoint

### 3. Generated TypeScript Types

**OpenAPI Schemas** (`docs/api/components/schemas/`):
```yaml
# public-note.yml
type: object
properties:
  id: { type: string, format: uuid }
  title: { type: string, maxLength: 120 }
  content: { type: string }
  author: { $ref: './author.yml' }
  createdAt: { type: string, format: date-time }
  updatedAt: { type: string, format: date-time }
  publishedAt: { type: string, format: date-time }
required: [id, title, content, author, createdAt, updatedAt, publishedAt]

# private-note.yml
type: object
properties:
  id: { type: string, format: uuid }
  title: { type: string, maxLength: 120, nullable: true }
  content: { type: string }
  createdAt: { type: string, format: date-time }
  updatedAt: { type: string, format: date-time }
required: [id, content, createdAt, updatedAt]
```

**Generated TypeScript** (representative):
```typescript
export interface PublicNote {
  id: string;
  title: string;
  content: string;
  author: { id: string; displayName: string; avatarUrl?: string | null };
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface PrivateNote {
  id: string;
  title?: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
}
```

### 4. Generated TanStack Query Hooks

**Generated Hooks** (`frontend/src/lib/api/generated/client.ts`):
```typescript
// GET /notes (public) hook
export const useGetNotes = (
  params?: GetNotesParams,
  options?: UseQueryOptions<PublicNotesListResponse>
) => {
  return useQuery({
    queryKey: ['notes', 'public', params],
    queryFn: () => getNotes(params),
    ...options
  });
};

// GET /me/notes (private) hook  
export const useGetMyNotes = (
  options?: UseQueryOptions<PrivateNotesListResponse>
) => {
  return useQuery({
    queryKey: ['notes', 'private'],
    queryFn: () => getMyNotes(),
    ...options
  });
};

// POST /me/notes mutation
export const useCreateNote = (
  options?: UseMutationOptions<PrivateNoteResponse, Error, CreateMyNoteRequest>
) => {
  return useMutation({
    mutationFn: (data: CreateMyNoteRequest) => createMyNote(data),
    ...options
  });
};
```

### 5. Component Implementation

Use generated types for complete type safety:

**Example**: `frontend/src/components/notes/NoteCard.tsx`
```typescript
import type { PublicNote } from '@/lib/api/generated/schemas'

interface NoteCardProps {
  note: PublicNote  // ✅ Generated from OpenAPI
  onEdit?: (noteId: string) => void
  onDelete?: (noteId: string) => void
}

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{note.title}</CardTitle>  {/* ✅ Type-safe */}
        {/* Public badge optional; public notes are implied on this page */}
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3">{note.content}</p>
        <p className="text-sm text-muted-foreground">
          {formatDate(note.updatedAt)}
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={() => onEdit?.(note.id)}>
          Edit
        </Button>
        <Button variant="destructive" onClick={() => onDelete?.(note.id)}>
          Delete
        </Button>
      </CardFooter>
    </Card>
  )
}
```

### 6. Data Fetching Patterns

#### Public Pages (SSR) - Home Page

**Example**: `frontend/src/app/page.tsx`
```typescript
import { getNotes } from '@/lib/api/generated/client'
import { NoteCard } from '@/components/notes/NoteCard'

// Server Component - no hooks needed
export default async function HomePage() {
  const res = await getNotes({ limit: 10 })

  if (!res?.data?.notes?.length) {
    return <div>No public notes available</div>
  }

  return (
    <main className="container mx-auto py-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {res.data.notes.map(note => (
          <NoteCard key={note.id} note={note} />  {/* ✅ Type-safe */}
        ))}
      </div>
    </main>
  )
}
```

#### Private Pages (CSR) - My Notebook

**Example**: `frontend/src/app/me/page.tsx`
```typescript
'use client'

import { useGetMyNotes } from '@/lib/api/generated/client'
import { NoteEditor } from '@/components/notes/NoteEditor'
import { NoteCard } from '@/components/notes/NoteCard'

export default function MyNotebookPage() {
  const { data: notes, isLoading, error } = useGetMyNotes()

  if (isLoading) return <div>Loading your notes...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <main className="container mx-auto py-6">
      <NoteEditor />  {/* Create new notes */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {notes?.data?.map(note => (
          <NoteCard key={note.id} note={note} />  {/* ✅ Type-safe */}
        ))}
      </div>
    </main>
  )
}
```

### 7. Form Handling with Authentication

Create forms using generated request types and Firebase auth:

**Example**: `frontend/src/components/notes/NoteEditor.tsx`
```typescript
'use client'

import type { CreateMyNoteRequest } from '@/lib/api/generated/schemas'
import { useCreateNote } from '@/lib/api/generated/client'
import { useAuthStore } from '@/stores/authStore'

export function NoteEditor() {
  const { user } = useAuthStore()
  
  const createMutation = useCreateNote({
    onSuccess: (response) => {
      // response is typed as PrivateNoteResponse
      console.log('Created note:', response.data.id)
      // Invalidate queries to refresh note list
    }
  })
  
  const handleSubmit = (formData: CreateMyNoteRequest) => {
    if (!user) {
      // Trigger anonymous authentication if needed
      return
    }
    
    createMutation.mutate(formData)  // ✅ Type-safe API call
  }

  // Form implementation with Zod validation based on OpenAPI schema
}
```

### 8. Authentication Integration

**Firebase Auth + API Bridge Pattern**:

```typescript
// lib/auth/authService.ts
export async function ensureAuthenticated() {
  const currentUser = auth.currentUser
  
  if (!currentUser) {
    // Auto-create anonymous user for notebook access
    await signInAnonymously(auth)
    // Ensure DB user exists for anonymous users
    const token = await auth.currentUser?.getIdToken()
    if (token) {
      await fetch(`${API_BASE_URL}/auth/anonymous-login`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
    }
  }
  
  return auth.currentUser
}

// Custom fetch with automatic auth headers
export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const user = await ensureAuthenticated()
  const token = await user?.getIdToken()
  
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` })
    }
  })
}
```

## 🧪 Testing Integration

### Generated MSW Mocks

MSW handlers are automatically generated from OpenAPI examples:

**Generated** (`frontend/src/lib/api/generated/client.msw.ts`):
```typescript
export const getNotesResponseMock = (): PublicNotesListResponse => ({
  status: 'success',
  data: {
    notes: [{
      id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Sample Public Note',
      content: 'This is a sample note content for testing...',
      author: { id: 'user_123', displayName: 'Alice', avatarUrl: null },
      createdAt: '2025-01-01T10:30:00Z',
      updatedAt: '2025-01-01T10:30:00Z',
      publishedAt: '2025-01-01T10:30:00Z'
    }],
    pagination: { page: 1, limit: 12, total: 1, hasNext: false, hasPrev: false }
  }
})

export const getNotesAPIMock = () => [
  http.get('/notes', () => {
    return HttpResponse.json(getPublicNotesResponseMock())
  }),
  http.get('/me/notes', () => {
    return HttpResponse.json(getMyNotesResponseMock())
  }),
  http.post('/me/notes', () => {
    return HttpResponse.json(createMyNoteResponseMock())
  }),
  // ... authentication endpoints
  http.post('/auth/anonymous', () => {
    return HttpResponse.json({ success: true })
  }),
  // ... other handlers
]
```

### Test Setup with Auth Mocking

**File**: `frontend/src/mocks/handlers/index.ts`
```typescript
import { getNotesAPIMock } from '@/lib/api/generated/client.msw'
import { setupFirebaseAuthMocks } from './authMocks'

// Use generated handlers as base
const apiHandlers = getNotesAPIMock()

// Add authentication-specific handlers
const authHandlers = [
  http.post('/auth/anonymous-login', () => {
    return HttpResponse.json({ 
      status: 'success',
      data: { user: { uid: 'anonymous-user-123', isAnonymous: true } }
    })
  }),
  http.get('/auth/login', () => {
    return HttpResponse.json({ 
      status: 'success',
      data: { user: { uid: 'regular-user-456', isAnonymous: false } }
    })
  })
]

// Add custom error handlers for testing edge cases
const errorHandlers = [
  http.get('/notes/error-500', () => {
    return HttpResponse.json({
      status: 'error',
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong' }
    }, { status: 500 })
  }),
  http.get('/me/notes/unauthorized', () => {
    return HttpResponse.json({
      status: 'error',
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
    }, { status: 401 })
  })
]

export const handlers = [
  ...apiHandlers,
  ...authHandlers,
  ...errorHandlers
]
```

### Component Testing with Auth Context

Test components with type-safe mock data and auth context:

```typescript
import { render, screen } from '@testing-library/react'
import { NoteCard } from './NoteCard'
import { AuthProvider } from '@/lib/providers/AuthProvider'
import type { PrivateNote } from '@/lib/api/generated/schemas'

const mockNote: PrivateNote = {
  id: "550e8400-e29b-41d4-a716-446655440001",
  title: "Test Note",
  content: "Test note content for testing",
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-15T10:30:00Z"
}  // ✅ Type-safe test data

test('renders note card correctly', () => {
  render(
    <AuthProvider>
      <NoteCard note={mockNote} />
    </AuthProvider>
  )
  expect(screen.getByText('Test Note')).toBeInTheDocument()
  expect(screen.getByText('Test note content for testing')).toBeInTheDocument()
})
```

## ⚙️ Configuration

### Orval Configuration with Firebase Auth

**File**: `orval.config.ts` (project root)
```typescript
import { defineConfig } from "orval";

export default defineConfig({
  api: {
    input: {
      target: "docs/api/openapi.bundled.yml",  // Bundled OpenAPI spec
    },
    output: {
      target: "frontend/src/lib/api/generated/client.ts",
      schemas: "frontend/src/lib/api/generated/schemas",
      client: "@tanstack/react-query",      // TanStack Query v5
      httpClient: "fetch",
      mode: "split",                        // Separate files for schemas
      clean: true,                          // Clean output directory
      mock: {
        type: "msw",
        useExamples: true,                  // Use OpenAPI examples
        generateEachHttpStatus: false,      // Avoid faker dependency
      },
      override: {
        query: {
          useQuery: true,
          useMutation: true,
          useInfiniteQuery: false,          // Not needed for this app
        },
        mutator: {
          path: "frontend/src/lib/api/customFetch.ts",
          name: "authenticatedFetch",       // Custom fetch with Firebase auth
        },
      },
    },
  },
});
```

### Custom Fetch with Firebase Auth

**File**: `frontend/src/lib/api/customFetch.ts`
```typescript
import { auth } from '@/lib/firebase/config'
import { signInAnonymously } from 'firebase/auth'

export const authenticatedFetch = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  // Ensure user is authenticated (anonymous or regular)
  let currentUser = auth.currentUser
  
  if (!currentUser && isPrivateEndpoint(url)) {
    // Auto-create anonymous user for private endpoints
    await signInAnonymously(auth)
    currentUser = auth.currentUser
    
    // Ensure DB user exists for anonymous users
    if (currentUser?.isAnonymous) {
      await fetch(`${API_BASE_URL}/auth/anonymous-login`, { 
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${await currentUser.getIdToken()}` 
        }
      })
    }
  }
  
  // Get fresh token
  const token = currentUser ? await currentUser.getIdToken() : null
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  })

  if (!response.ok) {
    if (response.status === 401) {
      // Handle auth errors - redirect to login or retry anonymous
      throw new Error('Authentication required')
    }
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

function isPrivateEndpoint(url: string): boolean {
  return url.includes('/me/') || url.includes('/auth/')
}
```

## 📋 Best Practices

### 1. Type Usage

```typescript
// ✅ Good: Import specific types
import type { PrivateNote, CreateMyNoteRequest, UserProfile } from '@/lib/api/generated/schemas'

// ✅ Good: Use generated types for props
interface NoteCardProps {
  note: PrivateNote
  user?: UserProfile  // Optional for public notes
}

// ✅ Good: Extend generated types when needed
interface NoteWithActions extends PrivateNote {
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

// ❌ Bad: Manual type definitions that duplicate OpenAPI
interface ManualNoteType {
  id: string
  title: string
  content: string
  // ...
}
```

### 2. Authentication-Aware Hook Usage

```typescript
// ✅ Good: Public data fetching (no auth required)
const { data: publicNotes, isLoading, error } = useGetNotes({ limit: 10 })

// ✅ Good: Private data fetching with auth state
const { user, isAuthenticated } = useAuthStore()
const { data: myNotes, isLoading, error } = useGetMyNotes({
  enabled: isAuthenticated  // Only fetch when authenticated
})

// ✅ Good: Mutations with auth validation and callbacks
const createNoteMutation = useCreateNote({
  onSuccess: (response) => {
    // response.data is properly typed as PrivateNote
    toast.success('Note created successfully!')
    // Invalidate cache to refresh note list
    queryClient.invalidateQueries({ queryKey: ['notes', 'private'] })
  },
  onError: (error) => {
    if (error.message.includes('Authentication required')) {
      // Trigger auth flow
      openLoginModal()
    } else {
      toast.error('Failed to create note')
    }
  }
})

// ✅ Good: Check auth state before mutations
const handleCreateNote = (noteData: CreateMyNoteRequest) => {
  if (!user) {
    openLoginModal()
    return
  }
  createNoteMutation.mutate(noteData)
}
```

### 3. Authentication-Aware Mock Usage

```typescript
// ✅ Good: Extend generated mocks for auth scenarios
const authTestHandlers = [
  ...getNotesAPIMock(),
  
  // Mock anonymous authentication
  http.post('/auth/anonymous-login', () => {
    return HttpResponse.json({
      status: 'success',
      data: { user: { uid: 'anonymous-123', isAnonymous: true } }
    })
  }),
  
  // Mock private endpoints with auth validation
  http.get('/me/notes', ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return HttpResponse.json(getMyNotesResponseMock())
  }),
  
  // Mock account upgrade flow
  http.post('/api/auth/promote', () => {
    return HttpResponse.json({
      success: true,
      user: { uid: 'anonymous-123', isAnonymous: false }
    })
  })
]
```

## 🚀 Development Commands

### Daily Workflow

```bash
# 1. When OpenAPI schemas change, regenerate frontend code
pnpm api:fe

# 2. Start development server (with MSW mocking + Firebase emulator)
cd frontend && pnpm dev

# 3. Type check across the project
cd frontend && pnpm typecheck

# 4. Run tests with generated mocks and auth context
cd frontend && pnpm test

# 5. E2E tests with full auth flow
cd frontend && pnpm test:e2e

# 6. Lint and format code (using Biome)
cd frontend && pnpm lint && pnpm format
```

### Authentication-Specific Development

```bash
# Start Firebase emulator for local auth testing
firebase emulators:start --only auth

# Test anonymous auth flow
cd frontend && pnpm test src/components/auth/

# Test auth state persistence
cd frontend && pnpm test src/stores/authStore.test.ts
```

### Validation

```bash
# Ensure generated code compiles without errors
cd frontend && pnpm typecheck

# Verify MSW handlers work correctly with auth
cd frontend && pnpm test src/components/notes/
cd frontend && pnpm test src/components/auth/

# Test auth integration
cd frontend && pnpm test src/lib/auth/

# Validate security headers in development
cd frontend && pnpm dev:security-check
```

## 🔍 Troubleshooting

### Common Issues

1. **Types Not Updating After Schema Changes**
   ```bash
   # Solution: Regenerate types
   pnpm api:fe
   cd frontend && pnpm typecheck
   ```

2. **MSW Mocks Not Working**
   - Check: MSW is properly set up in `src/mocks/browser.ts`
   - Verify: Mock handlers are imported in `src/mocks/handlers/index.ts`
   - Update: Run `pnpm orval:gen` to regenerate mocks

3. **Authentication Flow Issues**
   - **Anonymous auth not triggering**: Check if `ensureAuthenticated()` is called before private API requests
   - **Anonymous login not registered**: Verify `/auth/anonymous-login` endpoint is reachable and receives a Bearer token
   - **Firebase auth not initialized**: Ensure Firebase config is loaded before auth operations
   - **Token refresh errors**: Check if `getIdToken(true)` is used for fresh tokens

4. **Private Route Access Issues**
   - **401 Unauthorized**: Check if auth token is properly attached to requests
   - **Anonymous vs Regular access**: Verify route protection logic in middleware
   - **Cross-domain auth**: Ensure Firebase Auth domain is configured correctly

5. **Type Errors in Components**
   - Import: Use generated types from `@/lib/api/generated/schemas`
   - Verify: Component props match generated interface exactly
   - Auth types: Ensure Firebase `User` type is properly integrated with generated types

6. **Development Environment Issues**
   - **CORS errors**: Check if API base URL matches development server
   - **Firebase emulator connection**: Verify emulator is running for local auth testing
   - **Environment variables**: Ensure Firebase config is loaded from `.env.local`

## 📚 Related Files

### API & Schema Files
- **OpenAPI Specification**: `docs/api/openapi.yml`
- **Schema Guidelines**: `openapi/openapi-schema-guideline.md`
- **Generated Types**: `frontend/src/lib/api/generated/schemas/`
- **Generated Hooks**: `frontend/src/lib/api/generated/client.ts`
- **Generated Mocks**: `frontend/src/lib/api/generated/client.msw.ts`

### Documentation Files
- **UI Navigation Flow**: `docs/ui/navigation.md`
- **Page Specifications**: `docs/ui/pages/`
- **Authentication Implementation**: `docs/auth-security/note-library-auth-implementation.md`
- **Security Headers**: `docs/auth-security/security-header.md`
- **Coding Standards**: `docs/development/coding-standards.md`
- **Frontend README**: `frontend/README.md`

### Configuration Files
- **Orval Config**: `orval.config.ts`
- **Next.js Config**: `frontend/next.config.ts`
- **Firebase Config**: `frontend/src/lib/firebase/config.ts`
- **Auth Store**: `frontend/src/stores/authStore.ts`

## ✅ Success Checklist

A properly implemented schema-driven frontend with Firebase auth should have:

### Code Generation & Type Safety
- [ ] **Zero manual type definitions** for API data structures
- [ ] **IntelliSense support** for all API-related code
- [ ] **Compile-time validation** of API contracts in components
- [ ] **Up-to-date generated code** that matches current OpenAPI specification

### Authentication & Authorization
- [ ] **Anonymous-first authentication** - auto-creates users on private access
- [ ] **Seamless account progression** - anonymous to regular with data preservation
- [ ] **Firebase Auth integration** - proper token management
- [ ] **Route protection** - public/private page access controls
- [ ] **Auth state management** - Zustand store with Firebase auth sync

### API Integration
- [ ] **Type-safe API calls** using generated TanStack Query hooks
- [ ] **Automatic auth headers** - Firebase tokens attached to private requests
- [ ] **Error handling** - auth failures, network errors, validation errors
- [ ] **Cache invalidation** - proper query invalidation after mutations

### Testing & Mocking
- [ ] **Automated mock generation** with realistic examples from OpenAPI
- [ ] **Auth-aware mocks** - anonymous vs regular user scenarios
- [ ] **Component testing** - with auth context and proper providers
- [ ] **E2E auth flows** - anonymous signup, regular login, account linking

### User Experience
- [ ] **Progressive enhancement** - public-first, auth enhances experience
- [ ] **SSR for public content** - home page, note details for SEO
- [ ] **CSR for private content** - notebook, account pages for interactivity
- [ ] **Responsive design** - mobile-first with proper breakpoints
- [ ] **Loading states** - proper feedback during auth and API operations

### Security & Performance
- [ ] **Security headers** - CSP, HSTS, frame options configured
- [ ] **Content sanitization** - user-generated content properly escaped
- [ ] **Bundle optimization** - code splitting, tree shaking implemented
- [ ] **Accessibility** - keyboard navigation, screen reader support

This approach ensures a robust, maintainable note-taking application with excellent developer experience, complete type safety, and secure user authentication flow.
