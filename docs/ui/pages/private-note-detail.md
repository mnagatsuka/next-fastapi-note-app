# Private Note Detail

## 1. Page Overview

### Description
- Dedicated page for viewing and editing individual private notes within the authenticated user's personal notebook.
- Designed with a responsive, mobile-first approach optimized for reading and in-place editing.
- Features touch-friendly interactions and enhanced keyboard support for desktop.
- **Client-Side Rendering (CSR)** for real-time interactivity and personalized experience.
- Dark mode only in phase 1 - no light mode theme switching available.

### URL
- `/me/notes/[id]` (e.g., `/me/notes/550e8400-e29b-41d4-a716-446655440000`)

### Access
- Authenticated users only (anonymous and regular).
- Users can only access their own private notes.
- Anonymous user authentication via Firebase Auth happens automatically if needed.
- **Database Operation**: Anonymous user data is automatically stored in DB upon first authentication.

## 2. Layout and Structure

This page is composed of the following components. For component details, see the **Storybook** and individual component specs.

### Primary Components
- `PageHeader` (navigation with back button and action buttons)
- `NoteHeader` (note title with visibility badge, creation/update dates, word count)
- `NoteContent` (plain text content with proper typography)
- `NoteEditor` (in-place text editor for editing mode)
- `ActionButtons` (edit, delete, save, cancel controls)
- `VisibilityBadge` (shows public/private status of the note)
- `CommentSection` (displays existing comments and comment form for authenticated users)
- `CommentForm` (allows authenticated users to post new comments)
- `CommentList` (displays all comments with username and content)

### Responsive Behavior
- The layout is mobile-first with optimal reading width constraints.
- On screens 768px and wider (the `md` breakpoint), content is centered with comfortable reading margins.
- Header provides contextual navigation back to notebook.
- Edit/delete controls are easily accessible but positioned to prevent accidental activation.

## 3. Actions and Interactions

This section describes the primary user actions. They are consistent across mobile and desktop, with differences only in input method (tap vs. click).

### View Private Note

#### Trigger
- Page loads showing the full private note content.

#### Behavior
1. Client-side authenticates user (anonymous if no session exists).
   - **Database Operation**: Anonymous user data is stored in DB if this is their first visit
2. Fetches specific note using `GET /me/notes/{id}`.
3. Plain text content is displayed with proper typography formatting.
4. Shows note metadata including creation/update dates, word count, and visibility status.
5. Displays visibility badge indicating whether note is "Public" (green) or "Private" (blue).

#### Component Reference
- `NoteContent`
- `NoteHeader`
- [Link to relevant Storybook entry](https://localhost:6006/?path=/story/components-notecontent)

### Edit Note

#### Trigger
- User taps/clicks "Edit" button in the page header.

#### Behavior
1. Switches to edit mode with inline `NoteEditor` component.
2. Pre-fills editor with existing note content.
3. Provides plain text editing with title and content fields.
4. Shows save/cancel buttons for commit/discard actions.

#### Component Reference
- `NoteEditor`
- `ActionButtons`
- [Link to relevant Storybook entry](https://localhost:6006/?path=/story/components-noteeditor)

### Save Note Changes

#### Trigger
- User taps/clicks "Save" button in edit mode.

#### Behavior
1. Validates note content and title.
2. Updates note via `PATCH /me/notes/{id}` with new content.
3. Refreshes note data and notebook cache.
4. Exits edit mode and returns to view mode.
5. Shows brief success confirmation.

#### Component Reference
- `NoteEditor`

### Cancel Edit

#### Trigger
- User taps/clicks "Cancel" button in edit mode.

#### Behavior
1. Discards any unsaved changes.
2. Returns to view mode without API calls.
3. Restores original note content display.

#### Component Reference
- `NoteEditor`

### Delete Note

#### Trigger
- User taps/clicks "Delete" button in the page header.

#### Behavior
1. Shows confirmation dialog to prevent accidental deletion.
2. Permanently removes note via `DELETE /me/notes/{id}`.
3. Refreshes notebook cache to reflect deletion.
4. Navigates back to notebook main page (`/me`).
5. Shows deletion confirmation message.

#### Component Reference
- `ActionButtons`
- `ConfirmationDialog`

### Navigate Back to Notebook

#### Trigger
- User taps/clicks "← Back to Notes" button in the page header.

#### Behavior
1. Navigates back to the main notebook page (`/me`).
2. Preserves any notebook filtering or pagination state.

#### Component Reference
- `PageHeader`

### View Comments

#### Trigger
- Comments section loads automatically with note content.

#### Behavior
1. Fetches comments using `GET /me/notes/{id}/comments`.
2. Displays all comments in chronological order.
3. Shows username and comment content for each comment.
4. **Real-time Updates**: Establishes WebSocket connection for live comment notifications.
5. Receives `comment.created` messages via WebSocket when new comments are posted.

#### Component Reference
- `CommentSection`
- `CommentList`

### Post Comment

#### Trigger
- Authenticated user types in comment form and clicks "Post Comment".

#### Behavior
1. Validates user is authenticated (anonymous or regular).
2. Submits comment via `POST /me/notes/{id}/comments`.
3. **Real-time Broadcasting**: Backend automatically broadcasts new comment to all connected WebSocket clients.
4. Comment appears immediately for all users viewing the same note via WebSocket `comment.created` message.
5. Resets comment form after successful submission.
6. Shows error message if submission fails.

#### Component Reference
- `CommentForm`
- `CommentSection`

## 4. Data Requirements

This section outlines the API endpoints this page interacts with. For complete request and response schemas, refer to the **OpenAPI spec**.

### `POST /auth/anonymous-login`

#### Description
- Validates Firebase anonymous ID token and authenticates anonymous user.
- Called automatically if user is not authenticated when accessing private content.
- **Database Operation**: Inserts anonymous user data in DB if this is their first authentication.
- Client maintains Firebase ID token for subsequent authenticated API calls.

#### API Spec Reference
- See the `authenticateAnonymous` endpoint in the [OpenAPI spec](../api/openapi.yml).

### `GET /me/notes/{id}`

#### Description
- Fetches specific private note including content, metadata, and timestamps.
- Requires authentication via Firebase Auth token.
- **Database Requirement**: User data must exist in DB (automatically created for anonymous users).
- Returns 404 if note doesn't exist or doesn't belong to authenticated user.

#### API Spec Reference
- See the `getMyNoteById` endpoint in the [OpenAPI spec](../api/openapi.yml).

### `PATCH /me/notes/{id}`

#### Description
- Updates existing private note content including title and body text.
- Requires authentication via Firebase Auth token.
- Supports partial updates (title and/or content).
- Updates `updatedAt` timestamp automatically.

#### Request Body
- `title` (string, optional): Updated note title
- `content` (string, required): Updated note content

#### API Spec Reference
- See the `updateMyNote` endpoint in the [OpenAPI spec](../api/openapi.yml).

### `POST /me/notes/{id}/publish`

#### Description
- Makes a private note public, allowing it to appear in the public notes feed.
- Requires authentication via Firebase Auth token.
- Sets `isPublic` to `true` and updates `publishedAt` timestamp.

#### API Spec Reference
- See the `publishNote` endpoint in the [OpenAPI spec](../api/openapi.yml).

### `POST /me/notes/{id}/unpublish`

#### Description
- Makes a public note private, removing it from the public notes feed.
- Requires authentication via Firebase Auth token.
- Sets `isPublic` to `false` and clears `publishedAt` timestamp.

#### API Spec Reference
- See the `unpublishNote` endpoint in the [OpenAPI spec](../api/openapi.yml).

### `DELETE /me/notes/{id}`

#### Description
- Permanently deletes a private note from user's collection.
- Requires authentication via Firebase Auth token.
- Cannot be undone once confirmed.
- Returns 404 if note doesn't exist or doesn't belong to authenticated user.

#### API Spec Reference
- See the `deleteMyNote` endpoint in the [OpenAPI spec](../api/openapi.yml).

### `GET /me/notes/{id}/comments`

#### Description
- Fetches all comments for a specific private note.
- Requires authentication via Firebase Auth token.
- Returns comments in chronological order.
- Only shows comments for notes owned by authenticated user.
- Used for initial comment loading; real-time updates handled via WebSocket.

#### API Spec Reference
- See the `getPrivateNoteComments` endpoint in the [OpenAPI spec](../api/openapi.yml).

### `POST /me/notes/{id}/comments`

#### Description
- Creates a new comment on a private note.
- Requires authentication via Firebase Auth token (anonymous or regular).
- Associates comment with authenticated user's username.
- Only allows comments on notes owned by authenticated user.
- **Real-time Integration**: Automatically broadcasts new comment to all WebSocket connections.

#### Request Body
- `content` (string, required): Comment text content

#### WebSocket Integration
- Triggers `comment.created` message broadcast to all connected clients
- Message includes full comment data for real-time UI updates

#### API Spec Reference
- See the `createPrivateNoteComment` endpoint in the [OpenAPI spec](../api/openapi.yml).

## 5. State & Visibility Rules

Describe how the page's appearance or behavior changes based on application state or data fetching.

### Authentication State
- Anonymous user authentication happens automatically if user is not authenticated.
  - **Database Operation**: Anonymous user data is stored in DB during first authentication
- All features are available immediately after authentication and database storage completes.
- Page shows authentication retry option if authentication fails.

### Loading State
- During initial auth and note fetch, shows loading spinner with back navigation.
- Edit/delete actions show loading indicators during API operations.
- Save operation shows loading state on save button.

### Edit Mode State
- In edit mode, note content is replaced with editable form fields.
- Edit/delete buttons are hidden, replaced with save/cancel buttons.
- Form validation prevents saving empty content.

### Empty State
- If note content is empty, shows placeholder text in view mode.
- Edit mode always shows editable fields regardless of content state.

### Error State
- Authentication failures show error message with retry option.
- Note not found (404) redirects to Next.js 404 page.
- API errors during CRUD operations display error messages with retry options.
- Network connectivity issues show offline indicator.

### Comment State
- **Loading Comments**: Shows loading indicator while fetching comments.
- **Empty Comments**: Shows "No comments yet" message when no comments exist.
- **Comment Form**: Only visible to authenticated users (anonymous or regular).
- **Unauthenticated**: Shows "Sign in to post comments" message instead of form.
- **Comment Submission**: Shows loading state on submit button during API call.
- **Comment Error**: Displays error message if comment submission fails.
- **WebSocket Connection**: Shows connection status indicator (connected/disconnected).
- **Real-time Updates**: New comments appear instantly without page refresh via WebSocket.

### Success State
- Successful note updates show brief "Saved" confirmation.
- Successful deletion shows confirmation before navigation.
- Successful comment posting immediately adds comment to list.
- Smooth transitions between view and edit modes.

### Responsiveness State
- Mobile: Single column layout with stacked action buttons and full-width comment form.
- Tablet/Desktop: Wider content area with inline action buttons and optimized comment layout.
- Touch-friendly tap targets on mobile devices.
- Keyboard shortcuts for common actions on desktop.

## 6. Security Considerations

### Access Control
- Users can only access notes that belong to their authenticated session.
- Firebase Auth token validates user identity on every API request.
- No client-side note ID enumeration or unauthorized access possible.

### Data Validation
- Input sanitization prevents XSS attacks in note content and comments.
- Content length limits prevent abuse and performance issues.
- Title, content, and comment validation on both client and server sides.
- Comment content limited to reasonable character count (e.g., 1000 characters).

## 7. Performance Considerations

### Caching Strategy
- Note data is cached using TanStack Query for instant navigation.
- Cache invalidation on successful updates maintains data consistency.
- Optimistic updates for immediate UI feedback during saves.

### Loading Optimization
- Lazy loading of edit components until edit mode is activated.
- Comment section loads independently of note content for better perceived performance.
- Efficient re-rendering only affected components during state changes.
- Minimal API calls through intelligent cache management.
- Real-time comment updates without full page refresh.