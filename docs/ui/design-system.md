# Design System

This document captures the shared UI rules, naming, and usage patterns that make our product feel consistent and predictable. It focuses on common patterns and our custom decisions. It intentionally avoids speculative features and deep implementation detail.

## 1. Overview

- Purpose: Provide reusable, composable UI building blocks with clear rules, reducing design drift and implementation time.
- Principles: Clarity over decoration, consistency over novelty, accessibility by default, responsive from smallest to largest.
- Scope: Web, responsive across common breakpoints. Print and native platforms are out of scope.

## 2. Design Tokens

Design tokens are the single source of truth for style values. They are exposed as CSS variables and mapped to framework utilities where convenient.

- Colors: Role-based, not brand-only.
  - Base/Neutral: `--color-bg`, `--color-surface`, `--color-border`, `--color-text-muted`, `--color-text`.
  - Primary actions: `--color-primary`, `--color-on-primary`, hover/active tones: `--color-primary-hover`, `--color-primary-active`.
  - Secondary/Accent: `--color-accent`, `--color-on-accent` (use sparingly to highlight secondary actions).
  - Semantic: `--color-success`, `--color-warning`, `--color-danger`, with matching on-colors.
  - Visibility status: Green for public notes (`bg-green-100 text-green-700`), Blue for private notes (`bg-blue-100 text-blue-700`). Dark mode variants included.
  - Elevation overlays: `--color-scrim` for modals/drawers.
  - Optional theme: Provide a dark theme only when required; do not invent colors per page.

- Typography:
  - Families: `--font-sans` (UI), `--font-mono` (code, numbers when needed).
  - Scale (example): `--font-size-100` 12px, `200` 14px, `300` 16px, `400` 18px, `500` 20px, `600` 24px, `700` 28px, `800` 32px.
  - Weights: `--font-weight-regular` 400, `--font-weight-medium` 500, `--font-weight-semibold` 600.
  - Leading: `--line-compact` 1.2, `--line-default` 1.5, `--line-loose` 1.7.

- Spacing (4px base grid):
  - `--space-0` 0, `--space-1` 4px, `--space-2` 8px, `--space-3` 12px, `--space-4` 16px, `--space-6` 24px, `--space-8` 32px, `--space-12` 48px.
  - Use multiples of 4px. Avoid 1–3px nits except for borders.

- Breakpoints (content-first):
  - `--bp-xs` 360px, `--bp-sm` 640px, `--bp-md` 768px, `--bp-lg` 1024px, `--bp-xl` 1280px.
  - Mobile is the baseline; progressively enhance layout and density above each breakpoint.

## 3. Foundation Elements

- Layout grid: Fluid container with a 12-column grid and consistent gutters (16px on mobile, 24px at md+, 32px at lg+). Max content width 1200–1280px for reading comfort.
- Radius: `--radius-0` 0, `--radius-1` 2px, `--radius-2` 4px, `--radius-3` 8px, `--radius-round` 9999px (for pills). Use `--radius-2` as default.
- Shadows (subtle; avoid heavy blur): `--shadow-1` small elevation (e.g., cards), `--shadow-2` elevated (dropdowns), `--shadow-3` high (modals). Prefer border + subtle shadow for clarity.
- Motion: Easing `--ease-standard` cubic-bezier(0.2, 0, 0, 1). Durations: `--dur-fast` 120ms, `--dur-med` 180ms, `--dur-slow` 240ms. Animate opacity/transform only; avoid layout thrash.
- Z-index layers: `--z-base` 0, `--z-sticky` 100, `--z-dropdown` 1000, `--z-overlay` 1100, `--z-modal` 1200, `--z-toast` 1300. Never hardcode ad-hoc z-indexes.

## 4. Component Library

Focus on a minimal, consistent set. Variants are functional, not decorative.

- Buttons
  - Variants: Primary (default action), Secondary (alternate), Tertiary/Ghost (low emphasis), Destructive (danger flows).
  - Sizes: sm, md (default), lg. Minimum hit area 40px.
  - States: hover, active, focus-visible (2px focus ring), disabled (reduced contrast, no cursor-pointer).
  - Icon buttons: square, label hidden; provide `aria-label`.

- Form elements
  - Inputs/Textareas: clear label, placeholder as hint only. Support help text and validation message below field.
  - Selects: use native where possible; custom selects must keep keyboard and screen reader parity.
  - Checkboxes/Radio: label clickable; group radios with a fieldset + legend when related.
  - Toggles/Switch: binary settings only; reflect immediate effect.
  - Validation: success/warning/error colors; do not rely on color alone—add icon/text.

- Navigation
  - App header: product name/brand at left, primary nav, user menu at right. Collapses to menu button on `--bp-sm`.
  - Tabs: switch views within a route. Use underline/indicator; avoid mixing tabs and subnav in the same area.
  - Breadcrumbs: optional for nested content; truncate middle items on small screens.
  - Pagination: next/prev with page numbers; show total when known.

- Overlays
  - Modal: focus trap, escape-to-close, click-scrim to dismiss for non-destructive content. Provide a clear primary action.
  - Drawer: use for secondary tasks or mobile navigation. Same focus/dismiss rules as modal.
  - Tooltip: short labels only; never essential information.

- Data display
  - Cards: surface with image/icon, title, meta, and concise actions. Maintain consistent padding and spacing.
  - Tables: minimal borders, zebra or hover highlight; support dense and comfortable density. Keep column count manageable on mobile via stacking or horizontal scroll.
  - Lists: media list (avatar/icon + text), action list (icon + label). Keep one clear primary action.
  - Empty states: icon/illustration, 1–2 sentences, and a primary action.
  - Skeletons: use for loads >300ms; mirror layout shape.

Custom patterns for this app
- Note card: title, updated time, first lines preview, visibility badge. Click opens detail; hover reveals edit/delete actions.
- Visibility badge: small rounded pill indicating public/private status. Green for public ("Public"), blue for private ("Private"). Size: `text-xs` with `px-2 py-1` padding.
- Profile avatar: circular image with automatic fallback to default SVG avatar. Sizes: sm (32px), md (64px), lg (96px). Error handling switches to default avatar seamlessly.
- Form field: consistent input styling with integrated validation, character counts, and helper text. Error states use red border and message text below field.
- Editor toolbar: sticky at top, includes save status, undo/redo, and formatting basics (bold, italic, code). Keep icons with tooltips.

## 5. Usage Guidelines

- Choosing components: pick the lowest-emphasis element that still communicates action clearly. Reserve Primary for the main task.
- Composition: prefer stacking primitives (e.g., button + icon + badge) over creating new bespoke variants. Keep spacing aligned to the 4px grid.
- Accessibility: all interactive elements must be reachable by keyboard (Tab/Shift+Tab), show a visible focus style, and include accessible names. Ensure color contrast meets WCAG AA.
- Responsive behavior: layout flows vertically on small screens; hide only non-critical chrome. Convert multi-column content to single column; maintain target sizes and spacing.
- Copy and labels: write concise, action-oriented labels. Use sentence case.

Deliverables
- Keep tokens and foundations stable. Add variants only when a clear recurring need appears.
- When introducing a new component, document its role, anatomy, and allowed variants in this file before implementation.
