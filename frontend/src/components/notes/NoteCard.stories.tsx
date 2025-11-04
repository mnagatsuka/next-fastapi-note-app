import type { Meta, StoryObj } from '@storybook/react';
import { NoteCard } from './NoteCard';
import type { PrivateNote, PublicNote } from '@/lib/api/generated/schemas';

// Mock data
const mockPublicNote: PublicNote = {
  id: '1',
  title: 'How to Build Great Software',
  content: 'Building great software requires a deep understanding of user needs, clean architecture, and continuous iteration. Start with a clear vision, break down complex problems into manageable pieces, and always prioritize user experience.',
  author: {
    id: 'author1',
    displayName: 'Jane Developer',
    avatarUrl: null,
  },
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-15T10:30:00Z',
  publishedAt: '2024-01-15T10:30:00Z',
};

const mockPrivateNote: PrivateNote = {
  id: '2',
  title: 'Personal Thoughts on Architecture',
  content: 'I\'ve been thinking about microservices architecture lately. While it offers great scalability, it also introduces complexity in terms of service communication, data consistency, and debugging.',
  createdAt: '2024-01-14T09:15:00Z',
  updatedAt: '2024-01-16T14:22:00Z',
  publishedAt: null,
  isPublic: false,
};

const mockPrivatePublicNote: PrivateNote = {
  ...mockPrivateNote,
  id: '3',
  title: 'My Published Thoughts',
  isPublic: true,
  publishedAt: '2024-01-16T14:22:00Z',
};

const meta: Meta<typeof NoteCard> = {
  title: 'Components/Notes/NoteCard',
  component: NoteCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile note card component that displays different information based on the view context (public, private, or owner views).',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    viewContext: {
      control: 'select',
      options: ['public', 'private', 'owner'],
    },
    onEdit: { action: 'edit' },
    onDelete: { action: 'delete' },
    onAuthorFilter: { action: 'authorFilter' },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const PublicView: Story = {
  args: {
    note: mockPublicNote,
    viewContext: 'public',
  },
};

export const PrivateView: Story = {
  args: {
    note: mockPrivateNote,
    viewContext: 'private',
  },
};

export const OwnerViewPrivate: Story = {
  args: {
    note: mockPrivateNote,
    viewContext: 'owner',
    onEdit: (id: string) => console.log('Edit note:', id),
    onDelete: (id: string) => console.log('Delete note:', id),
  },
};

export const OwnerViewPublished: Story = {
  args: {
    note: mockPrivatePublicNote,
    viewContext: 'owner',
    onEdit: (id: string) => console.log('Edit note:', id),
    onDelete: (id: string) => console.log('Delete note:', id),
  },
};

export const LongTitle: Story = {
  args: {
    note: {
      ...mockPublicNote,
      title: 'This is a Very Long Title That Should Be Truncated Properly When Displayed in the Card Component',
    },
    viewContext: 'public',
  },
};

export const ShortContent: Story = {
  args: {
    note: {
      ...mockPublicNote,
      content: 'Short note.',
    },
    viewContext: 'public',
  },
};

export const UntitledNote: Story = {
  args: {
    note: {
      ...mockPrivateNote,
      title: '',
    },
    viewContext: 'owner',
    onEdit: (id: string) => console.log('Edit note:', id),
    onDelete: (id: string) => console.log('Delete note:', id),
  },
};