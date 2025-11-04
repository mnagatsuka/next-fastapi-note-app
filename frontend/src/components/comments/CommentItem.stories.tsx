import type { Meta, StoryObj } from '@storybook/react';
import { CommentItem } from './CommentItem';
import type { Comment } from '@/lib/api/generated/schemas';

// Mock comment data
const mockComment: Comment = {
  id: '1',
  content: 'This is a great article! I really enjoyed reading your insights on software architecture.',
  username: 'john_developer',
  createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  postId: '550e8400-e29b-41d4-a716-446655440000',
};

const meta: Meta<typeof CommentItem> = {
  title: 'Components/Comments/CommentItem',
  component: CommentItem,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A comment item component that displays individual comments with username, timestamp, and content. Supports optimistic UI updates.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    comment: mockComment,
  },
};

export const LongComment: Story = {
  args: {
    comment: {
      ...mockComment,
      content: 'This is a much longer comment that spans multiple lines. It discusses various aspects of the topic and provides detailed feedback. The comment system should handle longer content gracefully with proper line breaks and spacing. Here\'s more text to demonstrate how the component handles extensive content.',
    },
  },
};

export const RecentComment: Story = {
  args: {
    comment: {
      ...mockComment,
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    },
  },
};

export const OldComment: Story = {
  args: {
    comment: {
      ...mockComment,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    },
  },
};

export const OptimisticComment: Story = {
  args: {
    comment: {
      ...mockComment,
      id: 'optimistic-12345',
      content: 'This comment is being posted...',
      createdAt: new Date().toISOString(),
    },
  },
};

export const CommentWithLineBreaks: Story = {
  args: {
    comment: {
      ...mockComment,
      content: 'This comment has\nmultiple lines\n\nAnd some paragraphs separated by empty lines.',
    },
  },
};

export const ShortComment: Story = {
  args: {
    comment: {
      ...mockComment,
      content: 'Nice!',
    },
  },
};