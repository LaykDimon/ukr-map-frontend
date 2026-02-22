jest.mock('../api', () => ({
  personsApi: {
    getAll: jest.fn(),
    search: jest.fn(),
  },
}));

import personsReducer, {
  removePerson,
  restorePerson,
  clearSearchResults,
} from './personsSlice';

const initialState = {
  items: [],
  removedIds: [] as string[],
  loading: false,
  loadingProgress: null,
  error: null,
  searchResults: [],
  searchLoading: false,
};

describe('personsSlice', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return the initial state', () => {
    expect(personsReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('removePerson', () => {
    it('should add id to removedIds', () => {
      const state = personsReducer(initialState, removePerson('test-uuid-1'));
      expect(state.removedIds).toContain('test-uuid-1');
    });

    it('should persist removedIds to localStorage', () => {
      personsReducer(initialState, removePerson('test-uuid-1'));
      expect(JSON.parse(localStorage.getItem('removedIds') || '[]')).toContain('test-uuid-1');
    });
  });

  describe('restorePerson', () => {
    it('should remove id from removedIds', () => {
      const stateWithRemoved = { ...initialState, removedIds: ['test-uuid-1', 'test-uuid-2', 'test-uuid-3'] };
      const state = personsReducer(stateWithRemoved, restorePerson('test-uuid-2'));
      expect(state.removedIds).toEqual(['test-uuid-1', 'test-uuid-3']);
    });
  });

  describe('clearSearchResults', () => {
    it('should clear search results', () => {
      const stateWithResults = {
        ...initialState,
        searchResults: [{ person: { id: 'test-uuid-1' } as any }],
      };
      const state = personsReducer(stateWithResults, clearSearchResults());
      expect(state.searchResults).toEqual([]);
    });
  });
});
