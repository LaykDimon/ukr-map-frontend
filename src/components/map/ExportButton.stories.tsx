import type { Meta, StoryObj } from '@storybook/react';
import ExportButton from './ExportButton';

const meta: Meta<typeof ExportButton> = {
  title: 'Map/ExportButton',
  component: ExportButton,
  args: {
    data: [
      { id: 1, name: 'Taras Shevchenko', views: 100000, rating: 99 },
      { id: 2, name: 'Lesya Ukrainka', views: 80000, rating: 95 },
    ],
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
type Story = StoryObj<typeof ExportButton>;

export const Default: Story = {};
