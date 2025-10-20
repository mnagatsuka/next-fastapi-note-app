# Profile Components

## ProfileSection

### Overview
The main profile management component that handles user account information display and editing. Built with modular architecture using generated API types and reusable form components.

### Features
- **Dual Mode Interface**: View and edit modes with smooth transitions
- **Real-time Validation**: Form validation with live error feedback
- **Default Avatar Support**: Professional fallback avatar with automatic error handling
- **Firebase Integration**: Syncs profile updates with Firebase Auth
- **Generated Types**: Uses Orval-generated TypeScript types for type safety

### Component Structure
```typescript
ProfileSection
├── ProfileDisplay (view mode)
│   ├── ProfileAvatar
│   └── Metadata grid
└── ProfileEditForm (edit mode)
    ├── FormField (display name)
    ├── FormField (email) 
    ├── FormField (avatar URL)
    └── Action buttons
```

### State Management
- Uses custom `useProfileForm` hook for form state management
- Leverages React Query generated hooks: `useGetUserProfile`, `useUpdateUserProfile`
- Handles Firebase Auth profile synchronization

## ProfileAvatar

### Overview
Reusable avatar component with automatic fallback handling and size variants.

### Props
```typescript
interface ProfileAvatarProps {
  avatarUrl?: string | null
  displayName: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}
```

### Features
- **Multiple Sizes**: Small (8x8), medium (16x16), large (24x24) variants
- **Automatic Fallback**: Falls back to `/default-avatar.svg` on load errors
- **Accessible**: Proper alt text and ARIA attributes
- **Responsive**: Scales appropriately across devices

## ProfileEditForm

### Overview
Dedicated form component for profile editing with integrated validation and loading states.

### Features
- **Generated Types**: Uses `UpdateUserProfileBody` type from Orval
- **Real-time Validation**: Validates as user types with clear error messages
- **Character Limits**: Live character count for display name (max 60)
- **URL Validation**: Validates avatar URL format, allows empty for default
- **Loading States**: Disables form during submission with visual feedback

### Validation Rules
- **Display Name**: Required, 1-60 characters
- **Email**: Valid email format, optional
- **Avatar URL**: Valid URL format, optional (empty = default avatar)

## FormField

### Overview
Generic reusable form field component with built-in validation, error handling, and accessibility features.

### Props
```typescript
interface FormFieldProps {
  label: string
  id: string
  type?: 'text' | 'email' | 'url'
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  required?: boolean
  maxLength?: number
  helperText?: string
  error?: string
}
```

### Features
- **Type Safety**: Supports text, email, and URL input types
- **Error States**: Red border and error message display
- **Helper Text**: Contextual help text below input
- **Character Counter**: Shows current/max characters when maxLength is set
- **Accessibility**: Proper labels, ARIA attributes, and focus management

## useProfileForm Hook

### Overview
Custom hook that encapsulates profile form state management logic.

### Features
- **Generated Types**: Uses `UserProfile` and `UpdateUserProfileBody` from Orval
- **Change Detection**: Only sends modified fields to API
- **Form Reset**: Restores original values on cancel
- **Type Safety**: Full TypeScript integration with API schemas

### Usage
```typescript
const { formData, resetFormData, updateField, getChangedFields } = useProfileForm({
  profile: userProfile,
  isEditing: isEditMode
})
```

## Architecture Benefits

### Type Safety
- ✅ **Generated Types**: Uses Orval-generated types directly from OpenAPI spec
- ✅ **No Custom Types**: Eliminates duplicate type definitions
- ✅ **API Consistency**: Types automatically update when API changes

### Modularity
- ✅ **Reusable Components**: FormField, ProfileAvatar can be used elsewhere
- ✅ **Single Responsibility**: Each component has one clear purpose
- ✅ **Easy Testing**: Small, focused components are easier to test

### User Experience
- ✅ **Real-time Feedback**: Validation happens as user types
- ✅ **Professional Appearance**: Default avatar ensures consistent branding
- ✅ **Error Recovery**: Graceful handling of network and validation errors
- ✅ **Accessibility**: Proper ARIA attributes and keyboard navigation