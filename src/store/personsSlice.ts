import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { personsApi, SearchResult } from '../api';
import { Person } from '../types';

interface PersonsState {
  items: Person[];
  removedIds: string[];
  loading: boolean;
  error: string | null;
  searchResults: SearchResult[];
  searchLoading: boolean;
}

const initialState: PersonsState = {
  items: [],
  removedIds: JSON.parse(localStorage.getItem('removedIds') || '[]'),
  loading: false,
  error: null,
  searchResults: [],
  searchLoading: false,
};

export const fetchPersons = createAsyncThunk('persons/fetchAll', async () => {
  const response = await personsApi.getAll();
  return response.data;
});

export const searchPersons = createAsyncThunk(
  'persons/search',
  async (query: string) => {
    const response = await personsApi.search(query, 'combined', 20);
    return response.data;
  },
);

const personsSlice = createSlice({
  name: 'persons',
  initialState,
  reducers: {
    removePerson(state, action: PayloadAction<string>) {
      state.removedIds.push(action.payload);
      localStorage.setItem('removedIds', JSON.stringify(state.removedIds));
    },
    restorePerson(state, action: PayloadAction<string>) {
      state.removedIds = state.removedIds.filter((id) => id !== action.payload);
      localStorage.setItem('removedIds', JSON.stringify(state.removedIds));
    },
    clearSearchResults(state) {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPersons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPersons.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPersons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch persons';
      })
      .addCase(searchPersons.pending, (state) => {
        state.searchLoading = true;
      })
      .addCase(searchPersons.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchPersons.rejected, (state) => {
        state.searchLoading = false;
        state.searchResults = [];
      });
  },
});

export const { removePerson, restorePerson, clearSearchResults } = personsSlice.actions;
export default personsSlice.reducer;
