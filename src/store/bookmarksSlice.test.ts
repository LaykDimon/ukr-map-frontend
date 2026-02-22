import bookmarksReducer, {
  toggleBookmark,
  removeBookmark,
  clearBookmarks,
  selectBookmarkedIds,
  selectIsBookmarked,
} from "./bookmarksSlice";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

beforeEach(() => {
  localStorageMock.clear();
});

describe("bookmarksSlice", () => {
  const emptyState = { ids: [] };

  describe("toggleBookmark", () => {
    it("adds a bookmark when not present", () => {
      const state = bookmarksReducer(emptyState, toggleBookmark("p1"));
      expect(state.ids).toEqual(["p1"]);
    });

    it("removes a bookmark when already present", () => {
      const state = bookmarksReducer(
        { ids: ["p1", "p2"] },
        toggleBookmark("p1"),
      );
      expect(state.ids).toEqual(["p2"]);
    });

    it("persists to localStorage", () => {
      bookmarksReducer(emptyState, toggleBookmark("p1"));
      expect(
        JSON.parse(localStorageMock.getItem("ukr-map-bookmarks")!),
      ).toEqual(["p1"]);
    });
  });

  describe("removeBookmark", () => {
    it("removes a specific bookmark", () => {
      const state = bookmarksReducer(
        { ids: ["p1", "p2", "p3"] },
        removeBookmark("p2"),
      );
      expect(state.ids).toEqual(["p1", "p3"]);
    });

    it("does nothing if id not found", () => {
      const state = bookmarksReducer({ ids: ["p1"] }, removeBookmark("p99"));
      expect(state.ids).toEqual(["p1"]);
    });
  });

  describe("clearBookmarks", () => {
    it("removes all bookmarks", () => {
      const state = bookmarksReducer(
        { ids: ["p1", "p2", "p3"] },
        clearBookmarks(),
      );
      expect(state.ids).toEqual([]);
    });
  });

  describe("selectors", () => {
    const mockState = {
      bookmarks: { ids: ["p1", "p3"] },
    } as any;

    it("selectBookmarkedIds returns the ids array", () => {
      expect(selectBookmarkedIds(mockState)).toEqual(["p1", "p3"]);
    });

    it("selectIsBookmarked returns true for bookmarked id", () => {
      expect(selectIsBookmarked("p1")(mockState)).toBe(true);
    });

    it("selectIsBookmarked returns false for non-bookmarked id", () => {
      expect(selectIsBookmarked("p2")(mockState)).toBe(false);
    });
  });
});
