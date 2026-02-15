import type { Meta, StoryObj } from '@storybook/react';
import AuthModal from './AuthModal';

const meta: Meta<typeof AuthModal> = {
  title: 'Auth/AuthModal',
  component: AuthModal,
  args: {
    isOpen: true,
    onClose: () => {},
    onLogin: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof AuthModal>;

export const LoginMode: Story = {};

export const Closed: Story = {
  args: {
    isOpen: false,
  },
};
