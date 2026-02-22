import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { personsApi, SearchResult } from "../api";
import { Person } from "../types";

const BATCH_SIZE = 2000;

interface PersonsState {
  items: Person[];
  removedIds: string[];
  loading: boolean;
  loadingProgress: number | null; // percentage 0-100
  error: string | null;
  searchResults: SearchResult[];
  searchLoading: boolean;
}

const initialState: PersonsState = {
  items: [],
  removedIds: JSON.parse(localStorage.getItem("removedIds") || "[]"),
  loading: false,
  loadingProgress: null,
  error: null,
  searchResults: [],
  searchLoading: false,
};

export const fetchPersons = createAsyncThunk(
  "persons/fetchAll",
  async (_, { dispatch }) => {
    // Load first batch quickly so the user sees data fast
    const first = await personsApi.getPage(0, BATCH_SIZE);
    const firstBatch = first.data;
    if (firstBatch.length < BATCH_SIZE) {
      // All data fits in one batch
      return firstBatch;
    }
    // Dispatch first batch immediately, then load remaining
    dispatch(personsSlice.actions.appendBatch(firstBatch));

    let offset = BATCH_SIZE;
    let allItems = [...firstBatch];
    while (true) {
      const res = await personsApi.getPage(offset, BATCH_SIZE);
      const batch = res.data;
      if (batch.length === 0) break;
      allItems = [...allItems, ...batch];
      dispatch(personsSlice.actions.appendBatch(allItems));
      if (batch.length < BATCH_SIZE) break;
      offset += BATCH_SIZE;
    }
    return allItems;
  },
);

export const searchPersons = createAsyncThunk(
  "persons/search",
  async (query: string) => {
    const response = await personsApi.search(query, "combined", 20);
    return response.data;
  },
);

const personsSlice = createSlice({
  name: "persons",
  initialState,
  reducers: {
    removePerson(state, action: PayloadAction<string>) {
      state.removedIds.push(action.payload);
      localStorage.setItem("removedIds", JSON.stringify(state.removedIds));
    },
    restorePerson(state, action: PayloadAction<string>) {
      state.removedIds = state.removedIds.filter((id) => id !== action.payload);
      localStorage.setItem("removedIds", JSON.stringify(state.removedIds));
    },
    clearSearchResults(state) {
      state.searchResults = [];
    },
    appendBatch(state, action: PayloadAction<Person[]>) {
      state.items = action.payload;
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
        state.error = action.error.message || "Failed to fetch persons";
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

export const { removePerson, restorePerson, clearSearchResults } =
  personsSlice.actions;
export default personsSlice.reducer;
