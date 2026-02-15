import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FiltersState {
  search: string;
  maxCount: string;
  category: string;
  birthPlace: string;
  birthYearRange: [number | null, number | null];
}

const initialState: FiltersState = {
  search: '',
  maxCount: 'all',
  category: '',
  birthPlace: '',
  birthYearRange: [null, null],
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    setMaxCount(state, action: PayloadAction<string>) {
      state.maxCount = action.payload;
    },
    setCategory(state, action: PayloadAction<string>) {
      state.category = action.payload;
    },
    setBirthPlace(state, action: PayloadAction<string>) {
      state.birthPlace = action.payload;
    },
    setBirthYearRange(
      state,
      action: PayloadAction<[number | null, number | null]>,
    ) {
      state.birthYearRange = action.payload;
    },
    resetFilters() {
      return initialState;
    },
  },
});

export const {
  setSearch,
  setMaxCount,
  setCategory,
  setBirthPlace,
  setBirthYearRange,
  resetFilters,
} = filtersSlice.actions;
export default filtersSlice.reducer;
