import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FormField } from './FormField';

const meta: Meta<typeof FormField> = {
  title: 'UI/FormField',
  component: FormField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A reusable form field component with built-in validation, error handling, and accessibility features.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'url'],
    },
    required: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
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

// Interactive wrapper for stories that need state
function InteractiveFormField(props: Partial<React.ComponentProps<typeof FormField>>) {
  const [value, setValue] = useState(props.value || '');
  return <FormField 
    label={props.label || 'Field'}
    id={props.id || 'field'}
    {...props} 
    value={value} 
    onChange={setValue} 
  />;
}

export const Default: Story = {
  render: (args) => <InteractiveFormField {...args} />,
  args: {
    label: 'Display Name',
    id: 'displayName',
    placeholder: 'Enter your display name',
  },
};

export const Required: Story = {
  render: (args) => <InteractiveFormField {...args} />,
  args: {
    label: 'Email Address',
    id: 'email',
    type: 'email',
    placeholder: 'your@email.com',
    required: true,
  },
};

export const WithHelperText: Story = {
  render: (args) => <InteractiveFormField {...args} />,
  args: {
    label: 'Avatar URL',
    id: 'avatarUrl',
    type: 'url',
    placeholder: 'https://example.com/avatar.jpg',
    helperText: 'Optional: Provide a URL for your profile picture',
  },
};

export const WithCharacterLimit: Story = {
  render: (args) => <InteractiveFormField {...args} />,
  args: {
    label: 'Bio',
    id: 'bio',
    placeholder: 'Tell us about yourself',
    maxLength: 100,
    helperText: 'Brief description about yourself',
  },
};

export const WithError: Story = {
  render: (args) => <InteractiveFormField {...args} />,
  args: {
    label: 'Email Address',
    id: 'email-error',
    type: 'email',
    value: 'invalid-email',
    placeholder: 'your@email.com',
    error: 'Please enter a valid email address',
  },
};

export const Disabled: Story = {
  render: (args) => <InteractiveFormField {...args} />,
  args: {
    label: 'Username',
    id: 'username',
    value: 'john_doe',
    placeholder: 'Username',
    disabled: true,
    helperText: 'Username cannot be changed',
  },
};

export const LongContent: Story = {
  render: (args) => <InteractiveFormField {...args} />,
  args: {
    label: 'Display Name',
    id: 'longName',
    value: 'This is a very long display name that exceeds normal length',
    maxLength: 60,
  },
};