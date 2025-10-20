# Visibility Badge Component

## Overview
Small badge component that indicates the visibility status of notes. Used consistently across note cards and note detail pages to show whether a note is public or private.

## Visual Design
- **Public Notes**: Green badge with "Public" text
  - `bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300`
- **Private Notes**: Blue badge with "Private" text  
  - `bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300`
- **Shape**: Rounded pill/badge shape with padding
  - `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium`

## Usage Locations

### Note Cards (My Notebook)
- Appears in note card metadata section
- Shows visibility status for each note in grid view
- Helps users quickly identify which notes are published
- Used in `NoteCard` component with `viewContext="owner"`

### Note Detail Page
- Displayed next to note title in header section
- Shows current visibility status prominently
- Updates immediately when note visibility changes
- Positioned alongside title with `gap-3` spacing

## Implementation Pattern

### In NoteCard Component
```tsx
{viewContext === 'owner' && (
  <div className="mt-1">
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
      (note as any).isPublic === true
        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
        : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
    }`}>
      {(note as any).isPublic === true ? 'Public' : 'Private'}
    </span>
  </div>
)}
```

### In Note Detail Header
```tsx
<div className="flex items-center gap-3">
  <h1 className="text-3xl font-bold">
    {note.title || 'Untitled'}
  </h1>
  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
    (note as any).isPublic === true
      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
      : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
  }`}>
    {(note as any).isPublic === true ? 'Public' : 'Private'}
  </span>
</div>
```

## Design Rationale

### Color Coding
- **Green for Public**: Represents "go" or "visible to all"
- **Blue for Private**: Represents "personal" or "restricted access"
- Colors are accessible with sufficient contrast in both light and dark modes

### Size and Position
- **Small Size**: `text-xs` ensures it doesn't compete with main content
- **Prominent Placement**: Next to titles for immediate visibility status awareness
- **Consistent Spacing**: Uses standardized gap and padding values

## Data Requirements

### Backend API Response
The visibility badge relies on the `isPublic` field returned by private note endpoints:

```typescript
// Note object from API
interface PrivateNote {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  publishedAt: string | null
  isPublic: boolean  // ← Required for visibility badge
}
```

### Endpoints That Include isPublic
- `GET /me/notes` - List user's notes with visibility status
- `GET /me/notes/{id}` - Get single note with visibility status
- `POST /me/notes/{id}/publish` - Returns updated note with `isPublic: true`
- `POST /me/notes/{id}/unpublish` - Returns updated note with `isPublic: false`

## Accessibility Features

### Screen Reader Support
- Clear text labels: "Public" and "Private"
- Color is not the only indicator (text content provides meaning)
- Proper contrast ratios in light and dark modes

### Keyboard Navigation
- Badge is not interactive, so no keyboard focus needed
- Visual information is also conveyed through text content
- Works with screen magnifiers and high contrast modes

## Future Enhancements

### Potential Improvements
- **Icon Support**: Add small icons (eye for public, lock for private)
- **Tooltip**: Add hover tooltip with publish date for public notes
- **Animation**: Subtle animation when visibility status changes
- **Status Variants**: Support for "Draft", "Scheduled", "Archived" states
- **Interactive Badge**: Click to toggle visibility (with proper permissions)

### Customization Options
- Size variants (xs, sm, md)
- Color theme variants
- Icon-only mode for compact layouts
- Accessibility improvements for color-blind users