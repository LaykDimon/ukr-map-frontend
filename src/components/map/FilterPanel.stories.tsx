import type { Meta, StoryObj } from '@storybook/react';
import FilterPanel from './FilterPanel';
import { Person } from '../../types';

const samplePersons: Person[] = [
  { id: 1, name: 'Taras Shevchenko', category: 'writer', birthPlace: 'Moryntsi', birthYear: 1814, views: 100000, rating: 99 },
  { id: 2, name: 'Lesya Ukrainka', category: 'writer', birthPlace: 'Novohrad-Volynskyi', birthYear: 1871, views: 80000, rating: 95 },
  { id: 3, name: 'Hryhorii Skovoroda', category: 'philosopher', birthPlace: 'Chornukhy', birthYear: 1722, views: 50000, rating: 90 },
  { id: 4, name: 'Mykola Lysenko', category: 'composer', birthPlace: 'Hrynky', birthYear: 1842, views: 30000, rating: 80 },
];

const meta: Meta<typeof FilterPanel> = {
  title: 'Map/FilterPanel',
  component: FilterPanel,
  args: {
    persons: samplePersons,
    category: '',
    birthPlace: '',
    birthYearRange: [null, null],
    onCategoryChange: () => {},
    onBirthPlaceChange: () => {},
    onBirthYearRangeChange: () => {},
    onReset: () => {},
  },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', height: 400, background: '#1a1a2e' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof FilterPanel>;

export const Default: Story = {};

export const WithActiveFilters: Story = {
  args: {
    category: 'writer',
    birthPlace: 'Kyiv',
    birthYearRange: [1800, 1900],
  },
};

export const CategoryOnly: Story = {
  args: {
    category: 'philosopher',
  },
};
