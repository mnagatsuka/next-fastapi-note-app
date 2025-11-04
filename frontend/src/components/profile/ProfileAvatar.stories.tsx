import type { Meta, StoryObj } from '@storybook/react';
import { ProfileAvatar } from './ProfileAvatar';

const meta: Meta<typeof ProfileAvatar> = {
  title: 'Components/Profile/ProfileAvatar',
  component: ProfileAvatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    avatarUrl: {
      control: 'text',
    },
    displayName: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    displayName: 'John Doe',
    avatarUrl: null,
    size: 'md',
  },
};

export const WithCustomAvatar: Story = {
  args: {
    displayName: 'Jane Smith',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616c95b2720?w=150&h=150&fit=crop&crop=face',
    size: 'md',
  },
};

export const Small: Story = {
  args: {
    displayName: 'John Doe',
    avatarUrl: null,
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    displayName: 'John Doe',
    avatarUrl: null,
    size: 'lg',
  },
};

export const WithFallback: Story = {
  args: {
    displayName: 'Test User',
    avatarUrl: 'invalid-url',
    size: 'md',
  },
};