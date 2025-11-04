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
│   ├── (public)/                     # Public pages (SSR)
│   │   ├── page.tsx                  # Home - latest notes
│   │   └── notes/[id]/page.tsx       # Public note detail
│   ├── (private)/                    # Private pages (CSR)
│   │   ├── me/                       # My Notebook
│   │   │   ├── page.tsx              # Notes list
│   │   │   └── notes/                # Note management
│   │   │       ├── [id]/             # View/edit note
│   │   │       └── new/              # Create note
│   │   └── account/page.tsx          # Account Profile
│   ├── layout.tsx                    # Root layout
│   └── not-found.tsx                 # 404 error page
│
├── components/
│   ├── auth/                         # Authentication components
│   │   ├── LoginModal.tsx            # Login form with Firebase auth
│   │   ├── SignUpModal.tsx           # Registration form  
│   │   └── ModalOverlay.tsx          # Modal wrapper component
│   ├── notes/                        # Note components
│   │   ├── NoteCard.tsx              # Unified note card (public/private)
│   │   ├── NoteEditor.tsx            # Note creation/editing form
│   │   ├── LatestNotesSection.tsx    # Public notes display
│   │   ├── PublicNotesGrid.tsx       # Public notes grid layout
│   │   ├── PrivateNotesGrid.tsx      # Private notes grid layout
│   │   └── BaseNoteCard.tsx          # Base note card component
│   ├── comments/                     # Comment system
│   │   ├── CommentForm.tsx           # Comment creation form
│   │   ├── CommentList.tsx           # Comments display
│   │   └── CommentsSection.tsx       # Complete comments section
│   ├── profile/                      # User profile components
│   │   ├── ProfileDisplay.tsx        # Profile view
│   │   ├── ProfileEditForm.tsx       # Profile editing
│   │   └── ProfileAvatar.tsx         # Avatar component
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
│   │   │       ├── publicNote.ts     # PublicNote interface
│   │   │       ├── privateNote.ts    # PrivateNote interface
│   │   │       ├── userProfile.ts    # UserProfile interface
│   │   │       ├── comment.ts        # Comment interface
│   │   │       └── index.ts          # Schema exports
│   │   └── customFetch.ts            # Custom fetch with Firebase auth
│   ├── config/                       # Configuration
│   │   └── env.ts                    # Environment variables
│   ├── firebase/                     # Firebase client setup
│   │   └── config.ts                 # Firebase configuration
│   ├── providers/                    # React context providers
│   │   ├── AppProviders.tsx          # Main providers wrapper
│   │   ├── AuthProvider.tsx          # Authentication context
│   │   ├── QueryProvider.tsx         # TanStack Query provider
│   │   └── WebSocketProvider.tsx     # WebSocket context
│   ├── hooks/                        # Custom hooks
│   │   ├── useWebSocket.ts           # WebSocket management
│   │   └── useCommentsWebSocket.ts   # Comments real-time updates
│   └── utils.ts                      # General utilities
│
├── stores/                           # Zustand stores
│   ├── auth-store.ts                 # Authentication state
│   ├── auth-modal-store.ts           # Auth modal visibility
│   ├── notes-store.ts                # Notes pagination state
│   └── websocket-store.ts            # WebSocket connection state
│
├── mocks/
│   ├── handlers/index.ts             # MSW handler setup
│   ├── browser.ts                    # Browser MSW setup
│   └── server.ts                     # Node MSW setup (testing)
│
├── hooks/                            # Page-level hooks
│   ├── useNoteNavigation.ts          # Note navigation logic
│   ├── useNoteVisibility.ts          # Note visibility handling
│   └── useProfileForm.ts             # Profile form management
├── utils/                            # Utility functions
│   └── profile.ts                    # Profile-related utilities
└── middleware.ts                     # Next.js middleware (security headers)
```

## 🔄 Development Workflow

### 1. Component Development with Storybook

Our component development workflow includes Storybook for isolated component development and documentation:

#### Running Storybook

```bash
# With Docker (recommended for full environment)
docker compose up storybook

# Or locally
cd frontend
pnpm install
pnpm storybook
```

Access Storybook at http://localhost:6006 for:
- **Component Development**: Build and test components in isolation
- **Interactive Documentation**: View auto-generated docs and component APIs
- **Visual Testing**: Test different props, states, and variants
- **Accessibility Testing**: Built-in a11y addon for accessibility validation
- **Design System**: Maintain consistent component library

#### Available Stories

- **UI Components**: Button, FormField, and other base components
- **Profile Components**: ProfileAvatar with different sizes and states
- **Note Components**: NoteCard (public/private/owner views), NoteEditor
- **Comment Components**: CommentItem with optimistic updates
- **Layout Components**: Header with different authentication states

#### Adding New Stories

1. Create a `.stories.tsx` file next to your component:
```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { YourComponent } from './YourComponent';

const meta: Meta<typeof YourComponent> = {
  title: 'Components/YourComponent',
  component: YourComponent,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Your default props
  },
};
```

2. Run `pnpm storybook` to see your stories

#### Storybook Development Workflow

1. **Design Components**: Start with stories to define component API
2. **Build Variants**: Create stories for different states and props
3. **Test Interactions**: Use controls to test component behavior
4. **Document Usage**: Auto-generated docs with JSDoc comments
5. **Accessibility Check**: Use a11y addon to validate accessibility
6. **Integration**: Use components in actual pages after Storybook validation

### 2. Schema-to-Code Generation

When OpenAPI schemas change, regenerate frontend code:

```bash
# From project root
pnpm api:fe
```

This runs:
1. `pnpm api:bundle` - Bundles OpenAPI spec to `docs/api/openapi.bundled.yml`  
2. `orval` - Generates TypeScript code and MSW mocks using orval.config.ts

### 2. Authentication-First Development

Our app follows an **anonymous-first** authentication pattern:

1. **Public Pages** (SSR): Home, note detail, 404 - no auth required
2. **Private Pages** (CSR): My Notebook, Account - auto-creates anonymous users
3. **Account Progression**: Anonymous → Regular via Firebase `linkWithCredential`

Bridge calls to backend (per docs/api):
- After `signInAnonymously()`: call `POST /auth/anonymous-login` with Bearer token to ensure DB user
- After regular login/signup (`signInWithEmailAndPassword`/provider): handled automatically via customFetch
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
import type { PublicNote, PrivateNote } from '@/lib/api/generated/schemas'

interface NoteCardProps {
  note: PublicNote | PrivateNote  // ✅ Generated from OpenAPI
  viewContext: "public" | "private" | "owner"
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onAuthorFilter?: (authorId: string) => void
}

export function NoteCard({ note, viewContext, onEdit, onDelete }: NoteCardProps) {
  // Type guards to handle API differences
  function isPublicNote(note: PublicNote | PrivateNote): note is PublicNote {
    return "author" in note && !("isPublic" in note);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{note.title || "Untitled"}</CardTitle>  {/* ✅ Type-safe */}
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3">{note.content}</p>
        <p className="text-sm text-muted-foreground">
          {formatDate(note.updatedAt)}
        </p>
        {isPublicNote(note) && (
          <p className="text-sm text-muted-foreground">
            by {note.author.displayName}
          </p>
        )}
      </CardContent>
      <CardFooter>
        {viewContext === "owner" && (
          <>
            <Button variant="outline" onClick={() => onEdit?.(note.id)}>
              Edit
            </Button>
            <Button variant="destructive" onClick={() => onDelete?.(note.id)}>
              Delete
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}
```

### 6. Data Fetching Patterns

#### Public Pages (SSR) - Home Page

**Example**: `frontend/src/app/(public)/page.tsx`
```typescript
import { LatestNotesSection } from '@/components/notes/LatestNotesSection'
import { Suspense } from 'react'

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
      <div className="space-y-8">
        <section className="text-center py-12 sm:py-16">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">Simple Notes</h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Discover and read the latest public notes from our community. Create
            your own private notebook to start writing your thoughts.
          </p>
        </section>

        <Suspense
          fallback={
            <div className="text-center py-8">
              <div className="text-muted-foreground">Loading notes...</div>
            </div>
          }
        >
          <LatestNotesSection limit={12} />  {/* ✅ Client component with hooks */}
        </Suspense>
      </div>
    </main>
  )
}
```

#### Private Pages (CSR) - My Notebook

**Example**: `frontend/src/app/(private)/me/page.tsx`
```typescript
'use client'

import { PrivateNotesGrid } from '@/components/notes/PrivateNotesGrid'
import { FloatingActionButton } from '@/components/ui/floating-action-button'
import { useRouter } from 'next/navigation'

export default function MyNotebookPage() {
  const router = useRouter()

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
      <div className="space-y-8">
        <section>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">My Notebook</h1>
          <p className="text-muted-foreground">
            Your private notes. Only you can see them.
          </p>
        </section>

        <PrivateNotesGrid />  {/* ✅ Uses generated hooks internally */}
        
        <FloatingActionButton 
          onClick={() => router.push('/me/notes/new')}
          label="Add Note"
        />
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

import type { CreateMyNoteBody } from '@/lib/api/generated/schemas'
import { useCreateMyNote } from '@/lib/api/generated/client'
import { useAuthStore } from '@/lib/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'

export function NoteEditor() {
  const { user } = useAuthStore()
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  
  const createMutation = useCreateMyNote({
    onSuccess: (response) => {
      // response is typed as PrivateNoteResponse
      console.log('Created note:', response.data.id)
      setContent('')
      setTitle('')
      // Query invalidation handled by onSuccess callback
    }
  })
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    
    const formData: CreateMyNoteBody = {
      content: content.trim(),
      title: title.trim() || undefined
    }
    
    createMutation.mutate(formData)  // ✅ Type-safe API call
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Note title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <Textarea
        placeholder="Write your note..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />
      <Button 
        type="submit" 
        disabled={createMutation.isPending || !content.trim()}
      >
        {createMutation.isPending ? 'Creating...' : 'Create Note'}
      </Button>
    </form>
  )
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
import type { PrivateNote, CreateMyNoteBody, UserProfile } from '@/lib/api/generated/schemas'

// ✅ Good: Use generated types for props
interface NoteCardProps {
  note: PrivateNote | PublicNote
  viewContext: "public" | "private" | "owner"
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

# 2. Start development services
docker compose up frontend        # Next.js development server
docker compose up storybook      # Component development

# 3. Component development workflow
cd frontend && pnpm storybook    # Local Storybook development

# 4. Type check across the project
cd frontend && pnpm typecheck

# 5. Run tests with generated mocks and auth context
cd frontend && pnpm test

# 6. E2E tests with full auth flow
cd frontend && pnpm test:e2e

# 7. Lint and format code (using Biome)
cd frontend && pnpm lint && pnpm format

# 8. Build Storybook for deployment
cd frontend && pnpm build-storybook
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

### Component Development & Validation

```bash
# Ensure generated code compiles without errors
cd frontend && pnpm typecheck

# Verify MSW handlers work correctly with auth
cd frontend && pnpm test src/components/notes/
cd frontend && pnpm test src/components/auth/

# Test auth integration
cd frontend && pnpm test src/lib/auth/

# Component development with Storybook
cd frontend && pnpm storybook

# Build and validate Storybook
cd frontend && pnpm build-storybook

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

7. **Storybook Issues**
   - **Stories not loading**: Check if `.storybook` directory is properly configured
   - **Component imports failing**: Verify path aliases are configured in `.storybook/main.ts`
   - **Tailwind styles not working**: Ensure `globals.css` is imported in `.storybook/preview.ts`
   - **Dependencies missing**: Run `pnpm install` to ensure Storybook packages are installed
   - **Port conflicts**: Ensure port 6006 is available or change port in docker-compose.yml

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
- **Storybook Config**: `frontend/.storybook/main.ts`
- **Storybook Preview**: `frontend/.storybook/preview.ts`
- **Docker Compose**: `docker-compose.yml` (includes Storybook service)

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
- [ ] **Storybook stories** - comprehensive component documentation with all variants

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
