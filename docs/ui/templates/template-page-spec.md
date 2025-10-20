# [Page Name]

## 1. Page Overview

### Description
- A brief description of the page's purpose and its role in the user's workflow.
- Designed with a responsive, mobile-first approach.
- Features touch-friendly interactions and enhanced keyboard support for desktop.
- *Include the rendering strategy: **Server-Side Rendering (SSR)** for SEO optimization and social sharing, or **Client-Side Rendering (CSR)** for real-time interactivity.*
- *Specify theme support: Dark mode only in phase 1 - no light mode theme switching available (if applicable).*

### URL
- `/[page-path]` or `/resource/[id]` (e.g., `/dashboard`, `/posts/[id]`)

### Access
- Define who can access this page (e.g., Authenticated Users only, Public, Admin).
- *For anonymous auth: Anonymous user authentication via Firebase Auth (automatic on first visit).*
- *For phase 1: No regular user login required - all users are anonymous.*
- For more details, see the **Authentication State** section.


## 2. Layout and Structure

This page is composed of the following components. For component details, see the **Storybook** and individual component specs.

### Primary Components
- `ComponentName1` (placement in layout, e.g., "at the top", "main content area")
- `ComponentName2` (placement in layout)
- `ComponentName3` (placement in layout)
- *Add more components as needed, describing their role and placement.*

### Responsive Behavior
- The layout is mobile-first and fills the screen width by default.
- On screens 768px and wider (the `md` breakpoint), the layout transitions to a centered card with a fixed width of 480px.
- Describe which elements remain sticky (e.g., headers, navigation, action buttons).
- Detail how scrollable areas behave and overflow handling.
- *Include specific breakpoint behavior and layout transitions.*


## 3. Actions and Interactions

This section describes the primary user actions. They are consistent across mobile and desktop, with differences only in input method (tap vs. click).

### [Descriptive Action Name]

#### Trigger
- Describe the specific user action (e.g., "User taps/clicks the 'Submit' button", "Page loads") or system event that initiates this behavior.

#### Behavior
1. Describe the first step of the interaction (e.g., "Client-side validation is performed").
2. Describe subsequent steps, including API calls (e.g., `POST /data`), state changes, loading indicators, error handling, and navigation.
3. *Use numbered lists for clarity and include specific API endpoints.*

#### Component Reference
- List the primary components involved in this action.
- [Link to relevant Storybook entry](https://storybook-url.com/?path=/story/components-componentname) (e.g., `https://localhost:6006/?path=/story/components-blogpostform`)


## 4. Data Requirements

This section outlines the API endpoints this page interacts with. For complete request and response schemas, refer to the **OpenAPI spec**.

### `[HTTP METHOD] /[endpoint]`

**Example:** `GET /v1/resource/78R7qC8P254Y8nmiWjHUx`

#### Description
- Describe what data this endpoint provides or modifies, and its purpose for this page.
- *Include authentication requirements if applicable (e.g., "Requires anonymous user authentication via Firebase Auth").*

#### Query Params (Optional)
- List any query parameters, their types, and default values (e.g., `page` (number, default `1`), `limit` (number, default `10`)). *Only include if applicable for GET requests.*

#### API Spec Reference
- See the `[endpoint name]` endpoint in the [OpenAPI spec](https://link-to-your-openapi-spec) (e.g., `getResourceById` endpoint in the OpenAPI spec).

*For pages with multiple endpoints, list them using bullet points:*
- **`GET /v1/endpoint1`:** Brief description of what this fetches.
- **`POST /v1/endpoint2`:** Brief description of what this creates/updates.
- **`DELETE /v1/endpoint3/{id}`:** Brief description of what this removes.


## 5. State & Visibility Rules (Optional)

Describe how the page's appearance or behavior changes based on application state or data fetching.

### Authentication State
- Anonymous user authentication happens automatically on first visit.
- All features are available immediately after anonymous auth completes.
- No login prompts or user registration are required.
- *Modify this section based on your authentication requirements.*

### Loading State
- During initial load, skeleton loaders are displayed that mimic the page's layout.
- Headers and action buttons remain visible but in a disabled state.
- *Describe specific loading indicators for different sections.*

### Empty State
- When no data is available, show a contextual message (e.g., "No items found").
- Include call-to-action buttons where appropriate.
- *Describe specific conditions that trigger empty states.*

### Error State
- API or network errors display toast notifications.
- Retry buttons are provided for failed data fetching operations.
- *Include specific error handling for different failure scenarios.*
