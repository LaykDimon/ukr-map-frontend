import type { Meta, StoryObj } from '@storybook/react';
import RemovedPeoplePanel from './RemovedPeoplePanel';
import { Person } from '../../types';

const removedPeople: Person[] = [
  { id: 1, name: 'Taras Shevchenko', views: 100000, rating: 99 },
  { id: 2, name: 'Lesya Ukrainka', views: 80000, rating: 95 },
  { id: 3, name: 'Hryhorii Skovoroda', views: 50000, rating: 90 },
];

const meta: Meta<typeof RemovedPeoplePanel> = {
  title: 'Map/RemovedPeoplePanel',
  component: RemovedPeoplePanel,
  args: {
    onRestore: () => {},
  },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', height: 400, width: 400, background: '#1a1a2e' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof RemovedPeoplePanel>;

export const Empty: Story = {
  args: {
    removedPeople: [],
  },
};

export const WithRemovedPeople: Story = {
  args: {
    removedPeople,
  },
};

export const SinglePerson: Story = {
  args: {
    removedPeople: [removedPeople[0]],
  },
};
