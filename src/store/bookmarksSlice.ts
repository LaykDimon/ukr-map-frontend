import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./index";

const STORAGE_KEY = "ukr-map-bookmarks";

function loadBookmarks(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveBookmarks(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

interface BookmarksState {
  ids: string[];
}

const initialState: BookmarksState = {
  ids: loadBookmarks(),
};

const bookmarksSlice = createSlice({
  name: "bookmarks",
  initialState,
  reducers: {
    toggleBookmark(state, action: PayloadAction<string>) {
      const id = action.payload;
      const idx = state.ids.indexOf(id);
      if (idx >= 0) {
        state.ids.splice(idx, 1);
      } else {
        state.ids.push(id);
      }
      saveBookmarks(state.ids);
    },
    removeBookmark(state, action: PayloadAction<string>) {
      state.ids = state.ids.filter((id) => id !== action.payload);
      saveBookmarks(state.ids);
    },
    clearBookmarks(state) {
      state.ids = [];
      saveBookmarks(state.ids);
    },
  },
});

export const { toggleBookmark, removeBookmark, clearBookmarks } =
  bookmarksSlice.actions;

export const selectBookmarkedIds = (state: RootState) => state.bookmarks.ids;
export const selectIsBookmarked = (id: string) => (state: RootState) =>
  state.bookmarks.ids.includes(id);

export default bookmarksSlice.reducer;
