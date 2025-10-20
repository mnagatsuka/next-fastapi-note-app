# Account Profile

## 1. Page Overview

### Description
- User account management page with dual interfaces: upgrade prompts for anonymous users and full profile management for authenticated users.
- Designed with a responsive, mobile-first approach optimized for profile editing workflows.
- Features touch-friendly interactions and enhanced keyboard support for desktop.
- **Client-Side Rendering (CSR)** for real-time interactivity and personalized profile management.
- Dark mode only in phase 1 - no light mode theme switching available.

### URL
- `/account` (user profile management)

### Access
- All authenticated users (anonymous and regular).
- Anonymous users see upgrade prompts and limited functionality.
- Regular users see full profile management interface.
- Unauthenticated users are redirected to authentication.

## 2. Layout and Structure

This page is composed of the following components. For component details, see the **Storybook** and individual component specs.

### Primary Components
- `PageHeader` (account settings title and description)
- `ProfileSection` (profile display/edit with avatar, name, email)
- `UpgradePrompt` (for anonymous users to convert to regular accounts)
- `NavigationButtons` (links to notebook, home, and authentication)

### Responsive Behavior
- The layout is mobile-first with simple single-column interface.
- Consistent spacing using `space-y-6` and `space-y-4` patterns.
- Profile card uses responsive grid layout for metadata display.
- Form inputs adapt to screen width with proper touch targets.

## 3. Actions and Interactions

This section describes the primary user actions. They are consistent across mobile and desktop, with differences only in input method (tap vs. click).

### View Account Profile (Authenticated Users)

#### Trigger
- Authenticated user accesses account page.

#### Behavior
1. Fetches user profile via `GET /me` using API hook.
2. Shows loading skeleton while profile data loads.
3. Displays profile information with avatar, name, email, account type, and dates.
4. Provides "Edit" button to enter edit mode.
5. Shows error state with retry option if profile loading fails.

#### Component Reference
- `ProfileSection`
- [Link to relevant Storybook entry](https://localhost:6006/?path=/story/components-profilesection)

### Edit Profile Information

#### Trigger
- User clicks "Edit" button in profile card header.

#### Behavior
1. Switches ProfileSection to edit mode with form fields.
2. Pre-fills form with current profile data (display name, email, avatar URL).
3. Shows character count for display name (max 60 characters).
4. Provides form validation and helpful hints for each field.
5. Shows Save/Cancel buttons in edit mode.

#### Component Reference
- `ProfileSection`

### Save Profile Changes

#### Trigger
- User clicks "Save Changes" button in edit mode.

#### Behavior
1. Compares form data with original profile to detect changes.
2. Sends only changed fields via `PATCH /me` API call.
   - **Database Operation**: Updates user data in DB with new profile information
3. Shows "Saving..." loading state on save button.
4. Invalidates and refreshes profile cache on success.
5. Exits edit mode and returns to display view.
6. Handles errors gracefully with console logging.

#### Component Reference
- `ProfileSection`

### Cancel Profile Edit

#### Trigger
- User clicks "Cancel" button in edit mode.

#### Behavior
1. Exits edit mode without saving changes.
2. Restores form data to original profile values.
3. Returns to display view with unchanged profile information.
4. No API calls made during cancellation.

#### Component Reference
- `ProfileSection`

### Upgrade Anonymous Account

#### Trigger
- Anonymous user accesses account page and sees upgrade prompt.

#### Behavior
1. Shows "Upgrade Required" interface with explanation.
2. Displays blue-tinted upgrade prompt with note preservation message.
3. "Upgrade to Regular Account" button opens signup modal.
4. Uses Zustand auth modal store to trigger signup with anonymous upgrade flow.
5. Preserves all existing private notes during upgrade process.

#### Component Reference
- `UpgradePrompt` (inline in account page)
- `AuthModalProvider`

### Navigate to Other Sections

#### Trigger
- User clicks navigation buttons (My Notebook, Sign In, Home).

#### Behavior
1. "Go to My Notebook" navigates to `/me` notebook page.
2. "Sign In" button (for unauthenticated) opens login modal.
3. "Home" button navigates to `/` home page.
4. All navigation preserves current authentication state.

#### Component Reference
- `NavigationButtons` (inline in account page)


## 4. Data Requirements

This section outlines the API endpoints this page interacts with. For complete request and response schemas, refer to the **OpenAPI spec**.

### `GET /me`

#### Description
- Fetches complete user profile information including display name, email, avatar, and account metadata.
- Requires authenticated user (regular users only, not available to anonymous users).
- Returns profile data, account type (isAnonymous), and timestamp information.

#### Response Data
- `displayName`: User's display name
- `email`: User's email address (nullable)
- `avatarUrl`: Profile picture URL (nullable)
- `isAnonymous`: Boolean indicating account type
- `createdAt`: Account creation timestamp
- `updatedAt`: Last profile update timestamp

#### API Spec Reference
- See the `getUserProfile` endpoint in the [OpenAPI spec](../api/openapi.yml).

### `PATCH /me`

#### Description
- Updates user profile information with partial update support.
- **Database Operation**: Updates existing user data in DB with new profile information
- Requires authenticated user (regular users only).
- Only sends changed fields to optimize API calls.

#### Request Body (partial)
- `displayName` (string, optional): Updated display name (max 60 characters)
- `email` (string, optional): Updated email address
- `avatarUrl` (string, optional): Updated avatar URL

#### API Spec Reference
- See the `updateUserProfile` endpoint in the [OpenAPI spec](../api/openapi.yml).


## 5. State & Visibility Rules

Describe how the page's appearance or behavior changes based on application state or data fetching.

### Authentication State
- **Authenticated Users** (`status === 'authenticated'`): See full profile management interface with ProfileSection.
  - **Database Requirement**: User data exists in DB as regular user
- **Anonymous Users** (`status === 'anonymous'`): See upgrade prompt with note preservation message.
  - **Database State**: User data exists in DB but marked as anonymous
- **Unauthenticated Users** (`status === 'unauthenticated'`): See upgrade prompt with Sign In button.
- **Loading State** (`status === 'loading'`): Shows simple "Loading account…" message.

### Profile Loading State
- Shows skeleton loading animation with placeholder bars while fetching profile data.
- Loading skeleton maintains card structure with title and content areas.
- Form inputs disabled during profile update operations.

### Profile Edit State
- **Display Mode**: Shows profile info with avatar, name, email, and metadata in read-only format.
- **Edit Mode**: Replaces display with form fields for display name, email, and avatar URL.
- Form validation includes character count (60 max for display name) and field hints.
- Save/Cancel buttons replace Edit button during edit mode.

### Error State
- Profile loading failure shows "Failed to load profile" with "Try Again" button.
- Update errors logged to console without blocking UI.
- Network connectivity issues handled gracefully with retry options.

### Anonymous User Upgrade State
- Shows "Upgrade Required" heading with explanatory text.
- Blue-tinted upgrade prompt with note preservation assurance (📝 emoji).
- "Upgrade to Regular Account" button triggers signup modal with upgrade flow.
- Navigation options include My Notebook, Sign In (if unauthenticated), and Home.

### Profile Display Features
- **Avatar Display**: Shows user-provided avatar URL or falls back to professional default avatar image (`/default-avatar.svg`).
  - **Fallback Handling**: If custom avatar fails to load, automatically falls back to default avatar.
  - **Firebase Sync**: Avatar URL is synced with Firebase Auth profile for consistency across integrations.
- **Metadata Grid**: Shows Account Type (Anonymous/Regular) and Member Since date.
- **Update History**: Shows last updated date if different from creation date.
- **Responsive Layout**: Avatar and name displayed side-by-side with proper spacing.

### Form Validation and User Experience
- **Real-time Validation**: Form fields validate as user types with clear error messages.
- **Character Limits**: Display name limited to 60 characters with live counter.
- **URL Validation**: Avatar URL validates proper format, allows empty for default avatar.
- **Email Validation**: Standard email format validation with helpful error messages.
- **Firebase Integration**: Proper handling of Firebase Auth profile updates with error recovery.

