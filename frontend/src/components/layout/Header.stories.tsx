import type { Meta, StoryObj } from '@storybook/react';
import { Header } from './Header';

// Mock the stores and router for Storybook
const mockAuthStore = {
  status: 'unauthenticated',
  signOut: () => Promise.resolve(),
  user: null,
};

const mockAuthModalStore = {
  openModal: (type: string, options?: Record<string, unknown>) => console.log('Open modal:', type, options),
};

// Mock next/navigation router
const mockRouter = {
  push: (path: string) => console.log('Navigate to:', path),
};

// Mock Firebase auth
const mockAuth = {};

const meta: Meta<typeof Header> = {
  title: 'Components/Layout/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'The main navigation header component that appears on all pages, showing different buttons based on authentication state.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ minHeight: '100px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Note: These stories show the visual appearance but won't have full functionality
// due to the complex dependencies (Firebase, Zustand stores, Next.js router)

export const Unauthenticated: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Header shown to users who are not logged in. Shows Sign In and Sign Up buttons.',
      },
    },
  },
};

export const Anonymous: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Header shown to anonymous users. Shows Upgrade Account button.',
      },
    },
  },
};

export const Authenticated: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Header shown to authenticated users. Shows Account link, user info, and Sign Out button.',
      },
    },
  },
};

export const Loading: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Header in loading state when authenticating.',
      },
    },
  },
};