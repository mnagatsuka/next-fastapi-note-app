# Public Note Detail

## 1. Page Overview

### Description
- Simple public note reading page that displays the full plain text content of a published note with optimal readability.
- Designed with a responsive, mobile-first approach optimized for reading experience.
- Features touch-friendly interactions and enhanced keyboard support for desktop.
- **Server-Side Rendering (SSR)** with complete SEO optimization including Open Graph and Twitter Card meta tags.
- Dark mode only in phase 1 - no light mode theme switching available.

### URL
- `/notes/[id]` (e.g., `/notes/550e8400-e29b-41d4-a716-446655440000`)

### Access
- Public - no authentication required.
- Available to all visitors (anonymous and authenticated users).
- Full SEO optimization with dynamic meta tags based on note content.

## 2. Layout and Structure

This page is composed of the following components. For component details, see the **Storybook** and individual component specs.

### Primary Components
- `Header` (global navigation with authentication actions - inherited from layout)
- `NoteHeader` (note title, author info with avatar, publication date, clickable author navigation)
- `NoteContent` (formatted plain text content with prose styling and responsive typography)
- `NoteMeta` (creation/update dates, estimated reading time)
- `CommentSection` (displays existing comments and comment form for authenticated users)
- `CommentForm` (allows authenticated users to post comments, shows sign-in prompt for unauthenticated)
- `CommentList` (displays all comments with username and content)

### Responsive Behavior
- The layout is mobile-first with optimal reading width constraints.
- Container max-width of 4xl with centered article max-width of 2xl for comfortable reading.
- Content centered with proper padding (`px-4 py-8`) for mobile and desktop.
- Typography scales from base size on mobile to lg on desktop for optimal readability.

## 3. Actions and Interactions

This section describes the primary user actions. They are consistent across mobile and desktop, with differences only in input method (tap vs. click).

### Read Note Content

#### Trigger
- Page loads via SSR showing the complete note content.

#### Behavior
1. Server-side fetches and renders complete note using `GET /notes/{id}`.
2. Generates dynamic SEO metadata including Open Graph and Twitter Cards.
3. Note content displayed with prose styling and responsive typography.
4. Shows 404 page if note doesn't exist or is inaccessible.

#### Component Reference
- `NoteContent`
- `NoteHeader` 
- `NoteMeta`
- [Link to relevant Storybook entry](https://localhost:6006/?path=/story/components-notecontent)

### Navigate to Author's Notes

#### Trigger
- User taps/clicks on the author name/avatar in the note header.

#### Behavior
1. Client-side navigation to home page with author filter.
2. Uses query parameter: `/?author={authorId}`.
3. Updates Zustand notes store with author filter state.
4. Preserves page context for smooth navigation experience.

#### Component Reference
- `NoteHeader`

### View Note Metadata

#### Trigger
- Automatic display of note metadata below content.

#### Behavior
1. Shows note creation date in readable format (MMM DD, YYYY).
2. Displays last updated date if different from creation date.
3. Calculates and shows estimated reading time (200 words per minute average).
4. All metadata styled with muted foreground for non-intrusive display.

#### Component Reference
- `NoteMeta`

### View Comments

#### Trigger
- Comments section loads automatically with note content.

#### Behavior
1. Fetches comments using `GET /notes/{id}/comments`.
2. Displays all comments in chronological order.
3. Shows username and comment content for each comment.
4. **Real-time Updates**: Establishes WebSocket connection for live comment notifications.
5. Receives `comment.created` messages via WebSocket when new comments are posted.
6. Accessible to all users (authenticated and unauthenticated).

#### Component Reference
- `CommentSection`
- `CommentList`

### Post Comment (Authenticated Users Only)

#### Trigger
- Authenticated user types in comment form and clicks "Post Comment".

#### Behavior
1. **If Authenticated**: Submits comment via `POST /notes/{id}/comments`.
2. **If Unauthenticated**: Shows sign-in prompt instead of comment form.
3. **Real-time Broadcasting**: Backend automatically broadcasts new comment to all connected WebSocket clients.
4. Comment appears immediately for all users viewing the same note via WebSocket `comment.created` message.
5. Resets comment form after successful submission.
6. Shows error message if submission fails.

#### Component Reference
- `CommentForm`
- `CommentSection`

### Sign In to Comment

#### Trigger
- Unauthenticated user sees comment section.

#### Behavior
1. Shows "Sign in to post comments" message with sign-in buttons.
2. Clicking "Sign In" opens login modal.
3. Clicking "Sign Up" opens signup modal.
4. After successful authentication, comment form becomes available.

#### Component Reference
- `CommentForm`


## 4. Data Requirements

This section outlines the API endpoints this page interacts with. For complete request and response schemas, refer to the **OpenAPI spec**.

### `GET /notes/{id}`

#### Description
- Fetches complete public note data for server-side rendering.
- No authentication required - publicly accessible endpoint.
- Used for SEO optimization and social media meta tag generation.

#### API Spec Reference
- See the `getNoteById` endpoint in the [OpenAPI spec](../api/openapi.yml).

### `GET /notes/{id}/comments`

#### Description
- Fetches all comments for a specific public note.
- No authentication required - publicly accessible endpoint.
- Returns comments in chronological order with username and content.
- Used for initial comment loading; real-time updates handled via WebSocket.

#### API Spec Reference
- See the `getPublicNoteComments` endpoint in the [OpenAPI spec](../api/openapi.yml).

### `POST /notes/{id}/comments`

#### Description
- Creates a new comment on a public note.
- Requires authentication via Firebase Auth token (anonymous or regular).
- Associates comment with authenticated user's username.
- **Real-time Integration**: Automatically broadcasts new comment to all WebSocket connections.
- Available to all authenticated users regardless of note ownership.

#### Request Body
- `content` (string, required): Comment text content

#### WebSocket Integration
- Triggers `comment.created` message broadcast to all connected clients
- Message includes full comment data for real-time UI updates

#### API Spec Reference
- See the `createPublicNoteComment` endpoint in the [OpenAPI spec](../api/openapi.yml).


## 5. State & Visibility Rules

Describe how the page's appearance or behavior changes based on application state or data fetching.

### Authentication State
- **Page Content**: Fully accessible without authentication.
- **Comment Viewing**: Available to all users (authenticated and unauthenticated).
- **Comment Posting**: Requires authentication (anonymous or regular users).
- **Unauthenticated Users**: See sign-in prompt instead of comment form.
- **Header Actions**: Authentication actions remain available for user convenience.

### Loading State
- Server-side rendering eliminates loading states for initial content.
- Content is fully rendered before page delivery to client.

### Error State
- Note not found (404) triggers Next.js `notFound()` function.
- Redirects to custom 404 page with navigation suggestions.
- API errors during SSR also trigger 404 response.

### SEO Optimization State
- Dynamic metadata generation with Open Graph and Twitter Card support.
- Page title and description derived from note content.
- Social media sharing optimized with article-specific metadata.

### Content Display State
- Article layout centered with optimal reading width (max-w-2xl).
- Prose styling with dark mode support.
- Responsive typography scaling from mobile to desktop.
- Comment section maintains consistent styling with note content.
- Comment form integrates seamlessly with page design.

### Author Navigation State
- Author names and avatars clickable in NoteHeader.
- Navigation updates Zustand notes store for consistent filtering.
- Smooth client-side navigation preserves page context.
- Comment authors also have clickable usernames for profile discovery.

### Comment State
- **Loading Comments**: Shows loading indicator while fetching comments.
- **Empty Comments**: Shows "No comments yet" message when no comments exist.
- **Comment Form (Authenticated)**: Full comment form with post button.
- **Comment Form (Unauthenticated)**: Sign-in prompt with "Sign In" and "Sign Up" buttons.
- **Comment Submission**: Shows loading state on submit button during API call.
- **Comment Error**: Displays error message if comment submission fails.
- **WebSocket Connection**: Shows connection status indicator (connected/disconnected).
- **Real-time Updates**: New comments appear instantly without page refresh via WebSocket.

### Metadata Display State
- Creation date always displayed in readable format.
- Update date shown only if different from creation date.
- Reading time calculated and displayed automatically.
- Comment count displayed in metadata section.