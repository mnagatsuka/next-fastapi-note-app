# Login & SignUp Modals

## 1. Page Overview

### Description
- Global authentication modals that can be triggered from any page to allow users to upgrade from anonymous to regular accounts or authenticate existing regular accounts.
- Designed with a responsive, mobile-first approach optimized for conversion and accessibility.
- Features touch-friendly interactions and enhanced keyboard support for desktop.
- **Client-Side Rendering (CSR)** with modal overlay behavior.
- Dark mode only in phase 1 - no light mode theme switching available.

### URL
- No direct URL - triggered as modals with state management
- Modal state can be reflected in URL query parameters for deep linking (e.g., `/?auth=signup`)

### Access
- Available to all users (anonymous and unauthenticated).
- Primary use case: converting anonymous users to regular accounts.
- Secondary use case: regular user authentication for returning users.

## 2. Layout and Structure

These modals are composed of the following components. For component details, see the **Storybook** and individual component specs.

### Login Modal Components
- `ModalOverlay` (backdrop with click-to-dismiss and focus trap)
- `LoginForm` (email/password authentication form)
- `ForgotPasswordLink` (password reset flow trigger)
- `SignUpToggle` (switch to signup modal)
- `AnonymousUpgradePrompt` (context for anonymous users)

### SignUp Modal Components
- `ModalOverlay` (backdrop with click-to-dismiss and focus trap)
- `SignUpForm` (email, password, display name registration form)
- `TermsAcceptance` (privacy policy and terms agreement)
- `LoginToggle` (switch to login modal)
- `DataPreservationNotice` (explains that anonymous data will be preserved)

### Responsive Behavior
- Modals fill screen on mobile devices (full-screen experience).
- On screens 768px and wider (the `md` breakpoint), modals appear as centered overlays with max-width of 400px.
- Form fields stack vertically with proper spacing and touch targets.
- Keyboard navigation and focus management for accessibility.

## 3. Actions and Interactions

This section describes the primary user actions. They are consistent across mobile and desktop, with differences only in input method (tap vs. click).

### Open Login Modal

#### Trigger
- User clicks "Log In" button in header or when prompted for authentication.
- User attempts to access regular-user-only features.

#### Behavior
1. Modal overlay appears with focus trapped inside.
2. Login form is pre-focused on email field.
3. Modal state is reflected in URL for deep linking.
4. Background content is dimmed and non-interactive.

#### Component Reference
- `LoginModal`
- `ModalOverlay`
- [Link to relevant Storybook entry](https://localhost:6006/?path=/story/modals-loginmodal)

### Authenticate with Email/Password

#### Trigger
- User submits login form with email and password.

#### Behavior
1. Client-side validation ensures required fields are filled.
2. Firebase Auth `signInWithEmailAndPassword()` is called.
3. Loading state shown during authentication.
4. On success: 
   - Firebase ID token is validated and user authenticated via `GET /auth/login`
   - **Database Operation**: No database changes (user already exists)
   - Modal closes, user state updates globally, redirect if applicable.
5. On error: display specific error message with recovery suggestions.

#### Component Reference
- `LoginForm`
- `FormField`


### Open SignUp Modal

#### Trigger
- User clicks "Sign Up" button or "Create Account" from login modal.
- Anonymous user clicks upgrade prompts throughout the app.

#### Behavior
1. Modal overlay appears with signup form.
2. For anonymous users, shows data preservation notice.
3. Email field is pre-focused for immediate input.
4. Modal state updated in URL for navigation consistency.

#### Component Reference
- `SignUpModal`
- `DataPreservationNotice`

### Create Regular Account

#### Trigger
- User submits signup form with required information.

#### Behavior
1. Client-side validation for email format, password strength, and required fields.
2. **For anonymous users**: 
   - Firebase `linkWithCredential()` to preserve UID and data
   - **Database Operation**: User data is updated in DB via `POST /auth/anonymous-promote`
3. **For new users**: 
   - Firebase `createUserWithEmailAndPassword()`
   - **Database Operation**: User data is inserted to DB via `GET /auth/login`
4. Creates/updates user profile via `PATCH /me` with display name and preferences.
5. On success: modal closes, user state updates, redirect to appropriate page.

#### Component Reference
- `SignUpForm`
- `TermsAcceptance`

### Reset Password

#### Trigger
- User clicks "Forgot Password?" link in login modal.

#### Behavior
1. Shows password reset form in place of login form.
2. User enters email address for reset link.
3. Firebase Auth `sendPasswordResetEmail()` is called.
4. Shows confirmation message with instructions to check email.
5. Provides option to return to login form.

#### Component Reference
- `ForgotPasswordLink`
- `PasswordResetForm`

### Switch Between Login/SignUp

#### Trigger
- User clicks "Already have an account?" or "Need an account?" links.

#### Behavior
1. Smoothly transitions between login and signup modals.
2. Preserves any context about why authentication was requested.
3. Updates modal state and URL parameters accordingly.

#### Component Reference
- `LoginToggle`
- `SignUpToggle`

### Close Modal

#### Trigger
- User clicks backdrop, presses ESC key, or clicks close button.

#### Behavior
1. Modal closes with smooth animation.
2. Focus returns to element that triggered the modal.
3. URL state is cleaned up (removes auth parameters).
4. Background content becomes interactive again.

#### Component Reference
- `ModalOverlay`
- All modal components

## 4. Data Requirements

This section outlines the API endpoints these modals interact with. For complete request and response schemas, refer to the **OpenAPI spec**.

### Firebase Auth Integration

#### Description
- Authentication is handled primarily through Firebase Auth SDK.
- Server-side session management via Firebase Admin SDK.
- Session cookies are set via authentication bridge endpoints.

### `GET /auth/login`

#### Description
- Validates Firebase regular user ID token and authenticates user.
- Called automatically after successful Firebase Auth login for existing users.
- **Database Operation**: No database changes (user already exists).
- Client maintains Firebase ID token for subsequent authenticated API calls.

#### API Spec Reference
- See the `loginRegularUser` endpoint in the [OpenAPI spec](../api/openapi.yml).

### `GET /auth/login`

#### Description
- Handles new regular user account creation and database insertion.
- Called after successful Firebase `createUserWithEmailAndPassword()`.
- **Database Operation**: Inserts new regular user data to DB.
- Sets up initial user profile and preferences.

#### API Spec Reference
- See the `signupNewUser` endpoint in the [OpenAPI spec](../api/openapi.yml).

### `POST /auth/anonymous-promote`

#### Description
- Handles anonymous-to-regular account promotion.
- Called after successful Firebase `linkWithCredential()` for anonymous users.
- **Database Operation**: Updates existing anonymous user data in DB (anonymous → regular).
- Preserves all existing notes and data under same UID.

#### API Spec Reference
- See the `promoteAnonymousUser` endpoint in the [OpenAPI spec](../api/openapi.yml).

### Logout Behavior (Client-side)

#### Description
- Logout is handled client-side using Firebase Auth `signOut()`.
- Clears client authentication state and any local caches.
- No server endpoint is required.

### `PATCH /me`

#### Description
- Updates user profile after successful account creation/conversion.
- Sets display name, preferences, and initial settings.
- **Database Operation**: Updates existing user data in DB (used for both anonymous-to-regular conversion and regular user profile updates).

#### API Spec Reference
- See the `updateUserProfile` endpoint in the [OpenAPI spec](../api/openapi.yml).

## 5. State & Visibility Rules

Describe how the modal's appearance or behavior changes based on application state.

### Authentication Context
- Anonymous users see upgrade messaging and data preservation notices.
- Unauthenticated users see standard login/signup flows.
- Regular users typically don't see these modals (already authenticated).
- Context is preserved about why authentication was requested.

### Loading State
- Form submissions show loading spinners on submit buttons.
- Email verification sends show progress indicators.
- Background prevents multiple simultaneous authentication attempts.

### Error State
- Invalid credentials show clear error messages with recovery suggestions.
- Network errors provide retry options and offline indicators.
- Form validation errors highlight specific fields with helpful guidance.
- Rate limiting errors show wait times and alternative options.

### Success State
- Successful authentication shows brief confirmation before closing.
- New account creation shows welcome message and next steps.
- Password reset shows confirmation with email check instructions.
- Anonymous upgrade shows data preservation confirmation.

### Accessibility State
- Focus trap ensures keyboard navigation stays within modal.
- Screen reader announcements for state changes and errors.
- High contrast support for form elements and buttons.
- Touch targets meet minimum size requirements on mobile.

### Special States
- First-time anonymous users see educational content about account benefits.
- Returning users may see "Welcome back" messaging with last login date.
- Users with expired sessions see re-authentication prompts with context.
