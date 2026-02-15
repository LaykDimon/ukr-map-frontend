import type { Meta, StoryObj } from '@storybook/react';
import UserBar from './UserBar';

const meta: Meta<typeof UserBar> = {
  title: 'Map/UserBar',
  component: UserBar,
  args: {
    onLoginClick: () => {},
    onLogoutClick: () => {},
  },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', height: 100, background: '#1a1a2e' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof UserBar>;

export const Guest: Story = {
  args: {
    userRole: 'guest',
  },
};

export const Student: Story = {
  args: {
    userRole: 'student',
    userName: 'John Doe',
  },
};

export const Teacher: Story = {
  args: {
    userRole: 'teacher',
    userName: 'Professor Smith',
  },
};

export const Admin: Story = {
  args: {
    userRole: 'admin',
    userName: 'Admin User',
  },
};
