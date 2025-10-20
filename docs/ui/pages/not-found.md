# Not Found (404)

## 1. Page Overview

### Description
- Simple error page shown when users navigate to non-existent routes, providing a link back to the home page.
- Designed with a responsive, mobile-first approach focused on recovery and user guidance.
- Features touch-friendly interactions and enhanced keyboard support for desktop.
- **Server-Side Rendering (SSR)** for consistent error handling and SEO optimization.
- Dark mode only in phase 1 - no light mode theme switching available.

### URL
- Automatically shown for any non-matching route (Next.js `not-found.tsx`)
- Can be explicitly accessed via `/404` for testing

### Access
- Public - available to all users regardless of authentication status.
- Provides different suggestions based on user authentication state.
- Maintains user context for personalized recovery options.

## 2. Layout and Structure

This page is composed of the following components. For component details, see the **Storybook** and individual component specs.

### Primary Components
- `Header` (minimal header with site branding and basic navigation)
- `NotFoundHero` (404 illustration, error message, and explanation)
- `RecoveryActions` (home page navigation link)
- `Footer` (minimal footer with essential site links)

### Responsive Behavior
- The layout is mobile-first and centers content vertically and horizontally.
- On screens 768px and wider (the `md` breakpoint), layout uses wider content area.
- Error illustration scales appropriately for different screen sizes.
- Simple home button is prominently displayed across all breakpoints.

## 3. Actions and Interactions

This section describes the primary user actions. They are consistent across mobile and desktop, with differences only in input method (tap vs. click).

### Navigate to Home

#### Trigger
- User clicks "Go to Home" button - primary recovery action.

#### Behavior
1. Redirects to home page (`/`) showing the latest public notes.
2. Provides immediate value by showing available public content.

#### Component Reference
- `RecoveryActions`
- [Link to relevant Storybook entry](https://localhost:6006/?path=/story/components-recoveryactions)

### Go Back

#### Trigger
- User clicks "Go Back" button or uses browser navigation.

#### Behavior
1. Uses `window.history.back()` to return to previous page.
2. Fallback to home page (`/`) if no history exists.
3. Maintains user context and authentication state.

#### Component Reference
- `RecoveryActions`

## 4. Data Requirements

This page is purely static and does not require any API endpoints. All functionality is client-side navigation.

## 5. State & Visibility Rules

Describe how the page's appearance or behavior changes based on application state.

### Authentication State
- All users see "Go to Home" as the primary recovery option.
- No authentication required for any functionality on this page.

### Loading State
- Page loads immediately with static content.
- No loading states required.

### Empty State
- Core recovery action (Home button) is always available.

### Error State
- Home navigation remains functional regardless of any errors.
- No API dependencies mean minimal error scenarios.

### Context-Aware State
- Page maintains simplicity with focus on single recovery path: Home page.
- URL that caused 404 is logged for analytics but doesn't change user interface.

### Accessibility State
- Focus management ensures keyboard users can navigate to primary actions efficiently.
- Screen reader announcements explain the error and highlight available recovery options.
- High contrast support for all interactive elements.
- Alternative text for error illustrations and visual elements.

### Success State
- Successful navigation to Home page removes user from error state.
- Simple home button provides clear path back to main application.