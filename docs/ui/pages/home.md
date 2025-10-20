# Home (Latest Notes)

## 1. Page Overview

### Description
- Simple landing page showcasing the latest public notes where anyone can browse recently published content without authentication.
- Designed with a responsive, mobile-first approach.
- Features touch-friendly interactions and enhanced keyboard support for desktop.
- **Client-Side Rendering (CSR)** with Suspense for dynamic content loading.
- Dark mode only in phase 1 - no light mode theme switching available.

### URL
- `/` (root path)

### Access
- Public - no authentication required.
- Available to all visitors (anonymous and authenticated users).

## 2. Layout and Structure

This page is composed of the following components. For component details, see the **Storybook** and individual component specs.

### Primary Components
- `Header` (sticky top navigation with authentication actions)
- `HeroSection` (welcome banner with app title and description)
- `LatestNotesSection` (paginated grid of recently published notes with author filtering)
- `NoteCard` (individual note preview cards with author navigation)

### Responsive Behavior
- The layout is mobile-first and fills the screen width by default.
- Container with max-width constraints and padding (`container mx-auto px-4 py-6`).
- Header remains sticky at the top for easy navigation with backdrop blur effect.
- Note cards arrange in responsive grid (1 column mobile, 2 columns tablet, 3 columns desktop).
- Pagination controls adapt to screen size with centered layout.

## 3. Actions and Interactions

This section describes the primary user actions. They are consistent across mobile and desktop, with differences only in input method (tap vs. click).

### Browse Latest Notes

#### Trigger
- Page loads showing the latest notes section with Suspense fallback.

#### Behavior
1. Client-side fetches recent notes using `GET /notes` with pagination (page: 1, limit: 12, sort: 'latest').
2. Shows skeleton loading state during initial fetch.
3. Implements pagination with Previous/Next buttons for additional notes.
4. Displays note count and current page information.
5. Shows empty state if no notes are published.

#### Component Reference
- `LatestNotesSection`
- `NoteCard`
- [Link to relevant Storybook entry](https://localhost:6006/?path=/story/components-latestnotes)

### Navigate to Note Detail

#### Trigger
- User taps/clicks on any note card or note title.

#### Behavior
1. Client-side navigation to `/notes/{id}` for public note detail view.
2. Uses Link component for optimized navigation.
3. Preserves scroll position when user returns using browser back button.

#### Component Reference
- `NoteCard`

### Filter Notes by Author

#### Trigger
- User taps/clicks on author name in any note card.

#### Behavior
1. Updates URL with query parameter: `/?author={authorId}`.
2. Updates page title to show "Notes by {Author Name}".
3. Shows "← Show all notes" button to clear filter.
4. Resets pagination to page 1 when filtering.
5. Uses Zustand store to manage filter state across navigation.

#### Component Reference
- `NoteCard`
- `NoteHeader`
- `LatestNotesSection`

### Navigate Between Pages

#### Trigger
- User taps/clicks "Previous" or "Next" pagination buttons.

#### Behavior
1. Updates current page state using Zustand store.
2. Fetches new page of notes while maintaining author filter if active.
3. Shows loading state during page transitions.
4. Disables buttons appropriately based on available pages.

#### Component Reference
- `LatestNotesSection`

### Access Personal Notebook

#### Trigger
- User clicks "My Notebook" button in header (always visible).

#### Behavior
1. If no Firebase Auth session exists, silently calls `signInAnonymously()` in background.
2. Shows "Loading..." state during authentication process.
3. Firebase ID token is validated and user authenticated via `POST /auth/anonymous-login`.
   - **Database Operation**: Anonymous user data is stored in DB upon first authentication
4. Navigates to `/me` (My Notebook page) after authentication completes.
5. Authentication errors are logged but user can retry.

#### Component Reference
- `Header`

### Access Authentication Modals

#### Trigger
- User clicks "Sign In" or "Sign Up" buttons in header.

#### Behavior
1. Opens respective authentication modal using Zustand modal store.
2. Updates URL with query parameters (`?auth=login` or `?auth=signup`).
3. Modal state is synchronized with URL for deep linking.
4. Supports anonymous account upgrade flow.

#### Component Reference
- `Header`
- `AuthModalProvider`

## 4. Data Requirements

This section outlines the API endpoints this page interacts with. For complete request and response schemas, refer to the **OpenAPI spec**.

### `GET /notes`

#### Description
- Fetches paginated list of latest public notes in chronological order.
- No authentication required - publicly accessible endpoint.
- Supports author filtering through query parameters.

#### Query Params
- `sort` (string, default `latest`): Sort order (latest only)
- `page` (number, default `1`): Page number for pagination
- `limit` (number, default `12`): Number of notes per page
- `author` (string, optional): Filter notes by author ID (not yet implemented in backend)

#### API Spec Reference
- See the `getNotes` endpoint in the [OpenAPI spec](../api/openapi.yml).

### `POST /auth/anonymous-login`

#### Description
- Validates Firebase anonymous ID token and authenticates anonymous user.
- Called when user clicks "My Notebook" without existing session.
- **Database Operation**: Inserts anonymous user data in DB if first authentication.

#### API Spec Reference
- See the `authenticateAnonymous` endpoint in the [OpenAPI spec](../api/openapi.yml).

## 5. State & Visibility Rules

Describe how the page's appearance or behavior changes based on application state or data fetching.

### Authentication State
- Page is fully accessible without authentication.
- "My Notebook" button in header is always visible and handles authentication automatically.
- Sign In/Sign Up buttons appear for unauthenticated users.
- Authenticated users see Account and Sign Out options in header.

### Loading State
- Initial page load shows Suspense fallback: "Loading notes..." message.
- Notes section shows skeleton loading during data fetch.
- "My Notebook" button shows "Loading..." during authentication.
- Pagination shows loading state during page transitions.

### Empty State
- When no notes are available, shows:
  - "No notes published yet" or "No notes found" message
  - Encouragement text based on filter state
  - "Show All Notes" button when author filter is active

### Error State
- Network errors during note loading display "Failed to load notes. Please try again later." message.
- Authentication errors are logged but don't block UI functionality.
- Retry mechanisms available for failed operations.

### Author Filter State
- When author filter is active:
  - Page title shows "Notes by {Author Name}"
  - Shows "← Show all notes" button to clear filter
  - Note count reflects filtered results
  - Pagination resets to page 1
- Filter state managed by Zustand store and synchronized with URL

### Pagination State
- Shows "Page X of Y" information
- Previous/Next buttons disabled appropriately
- Note count shows total available notes
- Current page persists in Zustand store during navigation

### Responsive State
- Mobile: Single column note grid
- Tablet: Two column note grid
- Desktop: Three column note grid
- Header adapts with proper spacing and button sizing