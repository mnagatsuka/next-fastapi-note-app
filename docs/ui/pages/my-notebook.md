# My Notebook

## 1. Page Overview

### Description
- Simple private workspace where authenticated users (anonymous and regular) can create and manage their personal collection of plain text notes.
- Designed with a responsive, mobile-first approach optimized for basic note taking.
- Features touch-friendly interactions and enhanced keyboard support for desktop.
- **Client-Side Rendering (CSR)** for real-time interactivity and personalized experience.
- Dark mode only in phase 1 - no light mode theme switching available.

### URL
- `/me` (personal notebook dashboard)

### Access
- Authenticated users only (anonymous and regular).
- Anonymous user authentication via Firebase Auth happens automatically on first visit.
- Visiting this page without session triggers `signInAnonymously()` silently in background.
- **Database Operation**: Anonymous user data is automatically stored in DB upon first authentication.

## 2. Layout and Structure

This page is composed of the following components. For component details, see the **Storybook** and individual component specs.

### Primary Components
- `PageHeader` (title, user status, and create new note button)
- `NotesGrid` (responsive grid of user's private notes with built-in empty state)
- `PrivateNoteCard` (individual note preview with hover actions and metadata)
- `FloatingActionButton` (quick create note button on mobile only)
- `NoteEditor` (inline text editor for creating/editing notes)

### Responsive Behavior
- The layout is mobile-first and fills the screen width by default.
- On screens 768px and wider (the `md` breakpoint), shows desktop "New Note" button and hides mobile FAB.
- Page header shows authentication status and note count.
- Notes arrange in responsive grid (1 column mobile, 2 columns tablet, 3 columns desktop, 4 columns wide screens).
- Floating action button appears only on mobile devices for quick note creation.
- Note cards show edit/delete actions on hover (desktop) or touch (mobile).

## 3. Actions and Interactions

This section describes the primary user actions. They are consistent across mobile and desktop, with differences only in input method (tap vs. click).

### View Personal Notes

#### Trigger
- Page loads showing user's private notes collection.

#### Behavior
1. Client-side authenticates user (anonymous if no session exists).
   - **Database Operation**: Anonymous user data is stored in DB if this is their first visit
2. Fetches user's notes using `GET /me/notes` with pagination (page: 1, limit: 100).
3. Renders notes in responsive grid layout with preview cards.
4. Shows empty state with emoji and call-to-action when no notes exist.
5. Each note card shows title preview, content preview, last updated date, word count, and visibility status badge.
6. Visibility badges display "Public" (green) for published notes and "Private" (blue) for draft notes.

#### Component Reference
- `NotesGrid`
- `PrivateNoteCard`
- [Link to relevant Storybook entry](https://localhost:6006/?path=/story/components-notesgrid)

### Create New Note

#### Trigger
- User taps/clicks "+ New Note" button (desktop header) or "+" floating action button (mobile).

#### Behavior
1. Opens inline `NoteEditor` component directly on the same page.
2. Editor shows with empty title and content fields.
3. Save creates new note via `POST /me/notes` with title and content.
   - **Database Requirement**: User must already be stored in DB (automatic for anonymous users)
4. After successful creation, closes editor and refreshes notes grid.
5. New note appears at the top of the grid.

#### Component Reference
- `PageHeader` (desktop button)
- `FloatingActionButton` (mobile)
- `NoteEditor`
- [Link to relevant Storybook entry](https://localhost:6006/?path=/story/components-noteeditor)

### Quick Edit Note

#### Trigger
- User taps/clicks edit (✏️) button on note card hover/touch.

#### Behavior
1. Opens inline `NoteEditor` component with existing note content loaded.
2. Pre-fills title and content fields with current note data.
3. Save updates note via `PATCH /me/notes/{id}` with modified content.
4. After successful update, closes editor and refreshes notes grid.
5. Updated note reflects changes immediately.

#### Component Reference
- `PrivateNoteCard`
- `NoteEditor`

### View Note Detail

#### Trigger
- User taps/clicks anywhere on the note card (except action buttons).

#### Behavior
1. Navigates to dedicated note detail page at `/me/notes/{id}`.
2. Opens full note view with edit and delete capabilities.
3. Preserves notebook context for easy navigation back.

#### Component Reference
- `PrivateNoteCard`

### Delete Note

#### Trigger
- User taps/clicks delete (🗑️) button on note card hover/touch.

#### Behavior
1. Shows native confirmation dialog to prevent accidental deletion.
2. Permanently removes note via `DELETE /me/notes/{id}`.
3. Refreshes notes grid immediately after successful deletion.
4. Shows loading indicator (⏳) during deletion process.
5. No undo functionality - deletion is permanent.

#### Component Reference
- `PrivateNoteCard`

### Cancel Editor

#### Trigger
- User taps/clicks "Cancel" button in the note editor.

#### Behavior
1. Closes inline editor without saving changes.
2. Discards any unsaved modifications.
3. Returns to notes grid view.
4. No API calls made during cancellation.


## 4. Data Requirements

This section outlines the API endpoints this page interacts with. For complete request and response schemas, refer to the **OpenAPI spec**.

### `POST /auth/anonymous-login`

#### Description
- Validates Firebase anonymous ID token and authenticates anonymous user.
- Called automatically after successful `signInAnonymously()` on first visit.
- **Database Operation**: Inserts anonymous user data in DB if this is their first authentication.
- Client maintains Firebase ID token for subsequent authenticated API calls.

#### API Spec Reference
- See the `authenticateAnonymous` endpoint in the [OpenAPI spec](../api/openapi.yml).

### `GET /me/notes`

#### Description
- Fetches user's private note collection including drafts and personal creations.
- Requires anonymous user authentication via Firebase Auth.
- **Database Requirement**: User data must exist in DB (automatically created for anonymous users)
- Currently fetches all notes with pagination (page: 1, limit: 100).

#### Query Params
- `page` (number, default `1`): Page number for pagination
- `limit` (number, default `100`): Number of notes per page (currently set to 100)

#### API Spec Reference
- See the `getMyNotes` endpoint in the [OpenAPI spec](../api/openapi.yml).

### `POST /me/notes`

#### Description
- Creates a new private note draft with plain text content.
- Requires anonymous user authentication via Firebase Auth.
- **Database Requirement**: User data must exist in DB (automatically created for anonymous users)

#### API Spec Reference
- See the `createMyNote` endpoint in the [OpenAPI spec](../api/openapi.yml).

### `PATCH /me/notes/{id}`

#### Description
- Updates existing private note content with plain text.
- Requires anonymous user authentication via Firebase Auth.
- Supports manual save operations.

#### API Spec Reference
- See the `updateMyNote` endpoint in the [OpenAPI spec](../api/openapi.yml).

### `DELETE /me/notes/{id}`

#### Description
- Permanently deletes a private note from user's collection.
- Requires anonymous user authentication via Firebase Auth.
- Cannot be undone once confirmed.

#### API Spec Reference
- See the `deleteMyNote` endpoint in the [OpenAPI spec](../api/openapi.yml).

## 5. State & Visibility Rules

Describe how the page's appearance or behavior changes based on application state or data fetching.

### Authentication State
- Anonymous user authentication happens automatically on first visit.
  - **Database Operation**: Anonymous user data is stored in DB during first authentication
- All features are available immediately after anonymous auth and database storage completes.
- Authentication failures show error message with "Go Home" navigation link.
- User indicator shows "Signed in as Anonymous" or "Signed in" status in page header.

### Loading State
- During initial authentication, shows simple "Loading your notes…" message.
- During notes fetch, shows "Loading your notes..." in centered text.
- Create/edit/delete actions show loading states on respective buttons.
- Delete operation shows ⏳ emoji during processing.

### Empty State
- When user has no notes, `NotesGrid` shows:
  - 📝 emoji icon
  - "No notes yet" heading
  - "Create your first note to get started with your personal notebook." description

### Error State
- Authentication failures show error message with "Go Home" link instead of notes interface.
- Notes loading failures show "Failed to load notes" with "Try Again" button that reloads the page.
- Network connectivity issues display appropriate error messages.

### Editor State
- When editor is open (`editorMode !== 'closed'`):
  - `NoteEditor` component appears above the notes grid
  - Editor shows with save/cancel buttons
  - For edit mode, pre-fills with existing note data
  - For create mode, shows empty fields

### Responsive State
- Desktop (md breakpoint and up):
  - Shows "+ New Note" button in page header
  - Hides floating action button
  - Note cards show hover actions for edit/delete
- Mobile:
  - Hides desktop "New Note" button
  - Shows floating action button with "+" in bottom right
  - Touch interactions for note card actions

### Notes Display State
- Page header shows note count: "• X note(s)" when notes exist
- Each note card displays:
  - Title (or "Untitled" if empty)
  - Content preview (first 120 characters with "..." if longer)
  - Last updated date in "MMM DD, YYYY" format
  - Word count
- Grid layout: 1 column (mobile) → 2 columns (tablet) → 3 columns (desktop) → 4 columns (wide screens)