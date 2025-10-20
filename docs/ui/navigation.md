# Navigation & Authentication Flows

This document outlines the primary user flows and screen transitions within the Simple Note Application.

## Navigation Flow Diagram

```mermaid
graph TD
    subgraph "Public Pages"
        A["/- Home 📚 Latest public notes"]
        B["/notes/[id] - Public Note Detail 📄 Read + comment"]
    end
    
    subgraph "Private Pages (Authenticated)"
        C["/me - My Notebook 📝 Private notes"]
        D["/me/notes/[id] - Private Note Detail 📄 Edit + comment"]
        E["/me/notes/[id]/edit - Note Editor ✏️ Edit mode"]
        F["/me/notes/new - New Note ✨ Create mode"]
        G["/account - Account Profile ⚙️ User settings"]
    end
    
    subgraph "Error Pages"
        H["/404 - Not Found ❌ Go to Home"]
    end

    %% Public Navigation
    A -->|Click note card| B
    B -->|Browser back/breadcrumb| A
    B -->|"Read more by author"| A
    
    %% Public to Private Navigation
    A -->|"My Notebook" button| C
    B -->|"My Notebook" button| C
    
    %% Private Navigation
    C -->|Click note card| D
    C -->|"New Note" button| F
    C -->|Edit icon on card| E
    D -->|"Edit" button| E
    D -->|"← Back to Notes"| C
    E -->|"Save" or "Cancel"| D
    F -->|"Save" or "Cancel"| C
    
    %% Account Navigation (authenticated users only)
    C -->|"Account" button (auth only)| G
    D -->|"Account" button (auth only)| G
    E -->|"Account" button (auth only)| G
    G -->|"My Notebook" button| C
    
    %% Error Handling
    A -->|Invalid URL| H
    B -->|Note not found| H
    C -->|Auth failure| H
    D -->|Auth failure/not owner| H
    G -->|Access denied| H
    H -->|"Go to Home"| A
```

## Authentication Flow Diagram

```mermaid
graph TD
    subgraph "Authentication States"
        H[Unauthenticated 👤 No session]
        I[Anonymous 👻 Firebase anonymous]
        J[Authenticated 👨‍💻 Full account]
        K[Loading 🔄 Authentication check]
    end
    
    subgraph "Authentication Modals"
        L["Login Modal 🔑 Email/password"]
        S["SignUp Modal ✨ Create account"]
    end

    %% Authentication State Transitions
    K -->|Session check complete| H
    K -->|Session check complete| I  
    K -->|Session check complete| J
    H -->|Click "My Notebook"| I
    H -->|Click "Sign In"| L
    H -->|Click "Sign Up"| S
    I -->|Click "Upgrade Account"| S
    L -->|Successful login| J
    S -->|Successful signup| J
    L -->|"Need account?" link| S
    S -->|"Have account?" link| L
    J -->|"Sign Out"| H
    I -->|"Sign Out"| H
    
    %% Auto-authentication trigger
    H -.->|Auto signInAnonymously on /me access| I
    
    %% Page Access by Auth State
    H -.->|✅ Can access| PA["Public Pages + View Comments\n(/, /notes/[id])"]
    I -.->|✅ Can access| PB["Public + Private Pages + Post Comments\n(all except /account)"]
    J -.->|✅ Can access| PC["All Pages + Post Comments\n(including /account)"]
    K -.->|🔄 Loading| PD["Loading States"]
```

## Navigation Patterns

### 1. Anonymous-First Authentication
- **Trigger**: User clicks "My Notebook" button while unauthenticated
- **Behavior**: Automatically calls `signInAnonymously()` and redirects to `/me`
- **Result**: Immediate access to private note management without registration barriers
- **UI State**: Button shows "Loading..." during authentication

### 2. Comment Authentication
- **All Notes**: Unauthenticated users can read comments but cannot post
- **Comment Posting**: Only authenticated users (anonymous/regular) can post comments on both public and private notes
- **Comment Form**: Shows sign-in prompt for unauthenticated users, comment form for authenticated users

### 3. Public to Private Discovery
- **Header Navigation**: "My Notebook" button always visible in header
- **Home Page CTA**: Call-to-action in hero section promotes notebook creation
- **Seamless UX**: No login prompts, authentication happens transparently

### 4. Account Progression
- **Anonymous → Regular**: "Upgrade Account" button in header for anonymous users
- **Modal Flow**: Upgrade opens signup modal with `isAnonymousUpgrade: true`
- **Data Preservation**: Uses `linkWithCredential` to maintain same UID and all private notes
- **Benefit Unlocks**: Profile management, display name, avatar customization

## Key User Flows

### First-Time Visitor Flow
```
Home (/) → Browse latest notes → Read note (/notes/[id]) →
Comment section (view only) → Click "My Notebook" → 
Anonymous auth (automatic) → My Notebook (/me) → 
Create/edit notes → Upgrade prompts → Sign Up → Regular account
```

### Returning User Flow  
```
Home (/) → Click "My Notebook" → 
Auth state check → Direct access (/me) OR
Anonymous auth (if needed) → My Notebook
```

### Content Discovery Flow
```
Home (/) → Click note card → Note detail (/notes/[id]) → 
Read + view comments → Click author name → 
Home with author filter (/?author=[id]) → Browse author's notes
```

### Note Management Flow
```
My Notebook (/me) → Click note → Note detail (/me/notes/[id]) →
Edit button → Editor (/me/notes/[id]/edit) → 
Save → Back to detail → Back to notebook
```

### Comment Interaction Flow
```
Note detail (public/private) → View comments →
[If unauthenticated] Sign in prompt →
[If authenticated] Comment form → Post comment → 
Real-time comment appears
```

## Error Recovery

### 404 Not Found
- **Triggers**: Invalid URLs, deleted notes, access to private resources
- **Recovery Options**: 
  - "Go to Home" → Home (/)
- **Simple Recovery**: Single button to return to main application

### Authentication Failures
- **Anonymous Auth Failure**: Retry with user feedback
- **Regular Auth Failure**: Fallback to anonymous mode or re-authentication
- **Access Denied**: Clear messaging with upgrade path to regular account

## State Management Integration

### Global State (Zustand)
- `auth.status`: 'loading' | 'unauthenticated' | 'anonymous' | 'authenticated'
- `auth.user`: User profile data (displayName, email, avatar)
- `authModal.activeModal`: 'login' | 'signup' | null
- `authModal.options`: { isAnonymousUpgrade?: boolean }

### Route Protection
- **Public Routes** (`/`, `/notes/[id]`): Always accessible
- **Private Routes** (`/me/*`): Require authentication (anonymous or authenticated)
- **Restricted Routes** (`/account`): Require authenticated user account only (not anonymous)
- **Comment Posting**: Authenticated users only (anonymous or regular) on both public and private notes
- **Comment Viewing**: Available to all users on both public and private notes

### Navigation Guards
- **Loading State**: Shows loading UI during auth state checks
- **Anonymous Auth Trigger**: Automatic when clicking "My Notebook" while unauthenticated
- **Comment Auth**: Shows sign-in prompt for unauthenticated users on comment forms
- **Account Access**: Redirects anonymous users to upgrade flow
- **Graceful Degradation**: Always provides clear next steps, no dead ends

## API Integration Points

### Navigation-Triggered API Calls
- **Home Page Load**: `GET /notes` (latest public notes with pagination)
- **Public Note Detail**: `GET /notes/[id]` (public note + comments)
- **Private Note Detail**: `GET /me/notes/[id]` (private note + comments, requires auth)
- **My Notebook**: `GET /me/notes` (user's private notes, requires auth)
- **Account Access**: `GET /me/profile` (authenticated users only)
- **Comments**: `GET /notes/[id]/comments` (public), `GET /me/notes/[id]/comments` (private)

### Authentication API Bridge
- **Anonymous Login**: Firebase `signInAnonymously()` → `POST /auth/anonymous-login`
- **Regular Login**: Firebase `signInWithEmailAndPassword()` → Backend token validation
- **Regular Signup**: Firebase `createUserWithEmailAndPassword()` → `POST /auth/register`
- **Anonymous Upgrade**: Firebase `linkWithCredential()` → `POST /auth/link-anonymous`
- **Logout**: Firebase `signOut()` → Client-side state reset + cache clear

### Comment System API Integration
- **Public Note Comments**: 
  - View: `GET /notes/[id]/comments` (all users)
  - Post: `POST /notes/[id]/comments` (authenticated only)
- **Private Note Comments**: 
  - View: `GET /me/notes/[id]/comments` (note owner only) 
  - Post: `POST /me/notes/[id]/comments` (note owner only)
- **Real-time Updates**: WebSocket integration for live comment broadcasting
  - Connection: WebSocket endpoint for real-time notifications
  - Messages: `comment.created` type with full comment data
  - Broadcasting: Automatic to all connected clients when comments are posted
