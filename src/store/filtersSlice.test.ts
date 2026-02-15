import filtersReducer, {
  setSearch,
  setMaxCount,
  setCategory,
  setBirthPlace,
  setBirthYearRange,
  resetFilters,
} from './filtersSlice';

const initialState = {
  search: '',
  maxCount: 'all',
  category: '',
  birthPlace: '',
  birthYearRange: [null, null] as [number | null, number | null],
};

describe('filtersSlice', () => {
  it('should return the initial state', () => {
    expect(filtersReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setSearch', () => {
    const state = filtersReducer(initialState, setSearch('Taras'));
    expect(state.search).toBe('Taras');
  });

  it('should handle setMaxCount', () => {
    const state = filtersReducer(initialState, setMaxCount('100'));
    expect(state.maxCount).toBe('100');
  });

  it('should handle setCategory', () => {
    const state = filtersReducer(initialState, setCategory('writer'));
    expect(state.category).toBe('writer');
  });

  it('should handle setBirthPlace', () => {
    const state = filtersReducer(initialState, setBirthPlace('Kyiv'));
    expect(state.birthPlace).toBe('Kyiv');
  });

  it('should handle setBirthYearRange', () => {
    const state = filtersReducer(initialState, setBirthYearRange([1800, 1900]));
    expect(state.birthYearRange).toEqual([1800, 1900]);
  });

  it('should handle resetFilters', () => {
    const modified = {
      search: 'test',
      maxCount: '50',
      category: 'writer',
      birthPlace: 'Kyiv',
      birthYearRange: [1800, 1900] as [number | null, number | null],
    };
    const state = filtersReducer(modified, resetFilters());
    expect(state).toEqual(initialState);
  });
});
