import type { Meta, StoryObj } from '@storybook/react';
import { NoteEditor } from './NoteEditor';
import type { PrivateNote } from '@/lib/api/generated/schemas';

// Mock note data
const mockNote: PrivateNote = {
  id: '1',
  title: 'My Existing Note',
  content: 'This is the existing content of the note. It has some text that can be edited.',
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-15T10:30:00Z',
  publishedAt: null,
  isPublic: false,
};

const mockPublicNote: PrivateNote = {
  ...mockNote,
  id: '2',
  title: 'My Public Note',
  isPublic: true,
  publishedAt: '2024-01-15T10:30:00Z',
};

const meta: Meta<typeof NoteEditor> = {
  title: 'Components/Notes/NoteEditor',
  component: NoteEditor,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A note editor component for creating and editing notes with title, content, and visibility settings.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onSave: { action: 'save' },
    onCancel: { action: 'cancel' },
    disabled: {
      control: 'boolean',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-2xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const NewNote: Story = {
  args: {
    onSave: async (data: { title?: string | null; content: string; isPublic?: boolean }) => {
      console.log('Saving new note:', data);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
    onCancel: () => console.log('Cancel new note'),
  },
};

export const EditExistingNote: Story = {
  args: {
    note: mockNote,
    onSave: async (data: { title?: string | null; content: string; isPublic?: boolean }) => {
      console.log('Updating note:', data);
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
    onCancel: () => console.log('Cancel edit'),
  },
};

export const EditPublicNote: Story = {
  args: {
    note: mockPublicNote,
    onSave: async (data: { title?: string | null; content: string; isPublic?: boolean }) => {
      console.log('Updating public note:', data);
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
    onCancel: () => console.log('Cancel edit'),
  },
};

export const DisabledEditor: Story = {
  args: {
    note: mockNote,
    disabled: true,
    onSave: async (data: { title?: string | null; content: string; isPublic?: boolean }) => {
      console.log('Save disabled');
    },
    onCancel: () => console.log('Cancel disabled'),
  },
};

export const LongContent: Story = {
  args: {
    note: {
      ...mockNote,
      title: 'Note with Very Long Content',
      content: `This is a note with very long content that demonstrates how the editor handles extensive text.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.`,
    },
    onSave: async (data: { title?: string | null; content: string; isPublic?: boolean }) => {
      console.log('Saving long note:', data);
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
    onCancel: () => console.log('Cancel edit'),
  },
};

export const EmptyNote: Story = {
  args: {
    note: {
      ...mockNote,
      title: '',
      content: '',
    },
    onSave: async (data: { title?: string | null; content: string; isPublic?: boolean }) => {
      console.log('Saving empty note:', data);
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
    onCancel: () => console.log('Cancel edit'),
  },
};