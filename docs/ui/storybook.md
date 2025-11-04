# Storybook Documentation

This project uses [Storybook](https://storybook.js.org/) for component development and documentation.

## Setup

### Installation

The Storybook dependencies are already included in `package.json`. To install them:

```bash
pnpm install
```

### Running Storybook

Start the Storybook development server:

```bash
pnpm storybook
```

This will start Storybook on `http://localhost:6006`.

### Building Storybook

Build a static version of Storybook:

```bash
pnpm build-storybook
```

## Available Stories

### UI Components
- **Button** (`components/ui/button.stories.tsx`) - All button variants and states
- **FormField** (`components/ui/FormField.stories.tsx`) - Form input component with validation

### Profile Components
- **ProfileAvatar** (`components/profile/ProfileAvatar.stories.tsx`) - User avatar component with different sizes

### Note Components
- **NoteCard** (`components/notes/NoteCard.stories.tsx`) - Note display cards for different contexts
- **NoteEditor** (`components/notes/NoteEditor.stories.tsx`) - Note creation and editing interface

### Comment Components
- **CommentItem** (`components/comments/CommentItem.stories.tsx`) - Individual comment display

### Layout Components
- **Header** (`components/layout/Header.stories.tsx`) - Main navigation header

## Story Structure

Each story file follows this pattern:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from './ComponentName';

const meta: Meta<typeof ComponentName> = {
  title: 'Category/ComponentName',
  component: ComponentName,
  parameters: {
    layout: 'centered', // or 'fullscreen'
  },
  tags: ['autodocs'],
  argTypes: {
    // Control definitions
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Default props
  },
};
```

## Adding New Stories

1. Create a `.stories.tsx` file next to your component
2. Import the component and necessary types
3. Define the meta configuration
4. Create story variants showcasing different states
5. Add the story to this README

## Storybook Configuration

- **Main config**: `.storybook/main.ts` - Defines addons and build settings
- **Preview config**: `.storybook/preview.ts` - Global decorators and parameters
- **Styles**: Imports `globals.css` for consistent styling

## Addons Included

- **@storybook/addon-essentials** - Core functionality (controls, actions, docs)
- **@storybook/addon-interactions** - Testing interactions
- **@storybook/addon-a11y** - Accessibility testing

## Best Practices

1. **Show all variants** - Create stories for different states and props
2. **Use meaningful names** - Story names should clearly indicate what they demonstrate
3. **Add descriptions** - Use `parameters.docs.description` for context
4. **Mock dependencies** - Create mock versions of complex dependencies
5. **Interactive examples** - Use args and controls for interactive demos

## Limitations

Some components may have limited functionality in Storybook due to dependencies on:
- Next.js router
- Firebase authentication
- Zustand stores
- API calls

These are mocked where possible to show visual states.

## Deployment

Storybook can be deployed as a static site using the build output from `pnpm build-storybook`. The built files will be in the `storybook-static` directory.