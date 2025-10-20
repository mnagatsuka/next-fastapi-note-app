# Comment Components

## Overview
Comment system components that enable authenticated users to post comments on both public and private notes. Provides a simple interface showing username and comment content.

## CommentSection

### Overview
Container component that manages the entire comment experience for a note, including loading comments, displaying the comment list, and handling the comment form.

### Features
- **Universal Access**: All users can view comments, only authenticated users can post
- **Real-time Updates**: Comments update immediately after posting
- **Authentication Handling**: Shows appropriate UI based on user auth state
- **Loading States**: Proper loading and error state management
- **Simple Design**: Clean interface focusing on username and comment content

### Component Structure
```typescript
CommentSection
├── CommentList (displays existing comments)
│   └── CommentItem[] (individual comment cards)
└── CommentForm (posting interface for authenticated users)
    ├── CommentTextarea (comment input)
    └── AuthPrompt (sign-in buttons for unauthenticated users)
```

### Props
```typescript
interface CommentSectionProps {
  noteId: string
  isPrivateNote: boolean  // Determines API endpoints to use
  className?: string
}
```

## CommentList

### Overview
Displays all comments for a note in chronological order with clean, readable formatting.

### Features
- **Chronological Order**: Comments displayed oldest to newest
- **User Attribution**: Each comment shows the author's username
- **Empty State**: Shows "No comments yet" when no comments exist
- **Responsive Layout**: Adapts to mobile and desktop screens
- **Simple Format**: Username and comment content only

### Props
```typescript
interface CommentListProps {
  comments: Comment[]
  isLoading: boolean
  className?: string
}

interface Comment {
  id: string
  content: string
  username: string
  createdAt: string
  updatedAt: string
}
```

### Implementation Pattern
```tsx
<div className="space-y-4">
  {comments.length === 0 ? (
    <p className="text-muted-foreground text-center py-4">
      No comments yet. Be the first to comment!
    </p>
  ) : (
    comments.map((comment) => (
      <CommentItem key={comment.id} comment={comment} />
    ))
  )}
</div>
```

## CommentItem

### Overview
Individual comment display component with username and comment content.

### Features
- **Clean Layout**: Username header with comment content below
- **Timestamp Display**: Shows when comment was posted
- **Typography**: Consistent with design system
- **Responsive**: Works well on all screen sizes

### Props
```typescript
interface CommentItemProps {
  comment: Comment
  className?: string
}
```

### Visual Design
- **Username**: Semi-bold, medium size text
- **Timestamp**: Muted, small text next to username
- **Comment Content**: Regular text with proper line height
- **Card Style**: Subtle background with rounded corners
- **Spacing**: Consistent padding and margins

### Implementation Pattern
```tsx
<div className="bg-muted/50 rounded-lg p-4">
  <div className="flex items-center gap-2 mb-2">
    <span className="font-medium text-sm">{comment.username}</span>
    <span className="text-muted-foreground text-xs">
      {formatDate(comment.createdAt)}
    </span>
  </div>
  <p className="text-sm leading-relaxed">{comment.content}</p>
</div>
```

## CommentForm

### Overview
Input form for posting new comments with authentication state handling.

### Features
- **Authentication Aware**: Shows different UI based on auth state
- **Form Validation**: Validates comment content before submission
- **Character Limit**: Enforces reasonable comment length (e.g., 1000 chars)
- **Loading States**: Shows loading indicator during submission
- **Error Handling**: Displays error messages for failed submissions

### Authentication States

#### Authenticated Users (Anonymous & Regular)
- Shows textarea for comment input
- Shows character count and "Post Comment" button
- Enables immediate comment posting

#### Unauthenticated Users
- Shows sign-in prompt instead of form
- Provides "Sign In" and "Sign Up" buttons
- Clear messaging: "Sign in to post comments"

### Props
```typescript
interface CommentFormProps {
  noteId: string
  isPrivateNote: boolean
  onCommentPosted: () => void  // Callback to refresh comment list
  className?: string
}
```

### Implementation Pattern

#### For Authenticated Users
```tsx
<form onSubmit={handleSubmit} className="space-y-3">
  <textarea
    value={commentText}
    onChange={(e) => setCommentText(e.target.value)}
    placeholder="Write a comment..."
    className="w-full min-h-[100px] p-3 border rounded-md resize-none"
    maxLength={1000}
    disabled={isSubmitting}
  />
  <div className="flex justify-between items-center">
    <span className="text-xs text-muted-foreground">
      {commentText.length}/1000 characters
    </span>
    <Button 
      type="submit" 
      disabled={isSubmitting || commentText.trim().length === 0}
    >
      {isSubmitting ? 'Posting...' : 'Post Comment'}
    </Button>
  </div>
</form>
```

#### For Unauthenticated Users
```tsx
<div className="text-center py-6 bg-muted/30 rounded-lg">
  <p className="text-muted-foreground mb-3">Sign in to post comments</p>
  <div className="space-x-2">
    <Button variant="outline" onClick={() => openModal('login')}>
      Sign In
    </Button>
    <Button onClick={() => openModal('signup')}>
      Sign Up
    </Button>
  </div>
</div>
```

## API Integration

### Public Notes
- **View Comments**: `GET /notes/{id}/comments`
- **Post Comment**: `POST /notes/{id}/comments` (authenticated only)

### Private Notes
- **View Comments**: `GET /me/notes/{id}/comments` (authenticated only)
- **Post Comment**: `POST /me/notes/{id}/comments` (authenticated only)

### Request/Response Format

#### Comment Creation Request
```typescript
interface CreateCommentRequest {
  content: string  // Required, 1-1000 characters
}
```

#### Comment Response
```typescript
interface CommentResponse {
  id: string
  content: string
  username: string  // Display name or email
  createdAt: string
  updatedAt: string
}
```

## Usage Guidelines

### When to Use Comments
- **Public Notes**: Allow community discussion and feedback
- **Private Notes**: Enable personal reflection or feedback from collaborators
- **Note Detail Pages**: Comments appear below note content

### Content Guidelines
- **Length Limit**: Maximum 1000 characters per comment
- **Content Policy**: Basic input sanitization to prevent XSS
- **Username Display**: Uses user's display name or email if no display name

### Accessibility Features

#### Screen Reader Support
- Proper semantic HTML structure
- Clear labels for form inputs
- Status announcements for comment posting

#### Keyboard Navigation
- Tab-friendly form inputs
- Enter to submit comments
- Focus management after posting

#### Visual Accessibility
- High contrast text and background
- Clear visual hierarchy
- Readable font sizes and line heights

## Future Enhancements

### Potential Features
- **Comment Reactions**: Like/upvote functionality
- **Comment Replies**: Nested comment threads
- **Comment Editing**: Allow users to edit their own comments
- **Comment Deletion**: Allow users to delete their own comments
- **Moderation**: Report/hide inappropriate comments
- **Rich Text**: Support for basic markdown formatting
- **User Profiles**: Click username to view user profile

### Technical Improvements
- **Real-time Updates**: WebSocket integration for live comments
- **Pagination**: Load comments in batches for better performance
- **Caching**: Optimize comment loading and updates
- **Offline Support**: Queue comments when offline