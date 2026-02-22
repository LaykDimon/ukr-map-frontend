import React, { useState, useEffect, useCallback } from "react";
import { Person } from "../../types";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { searchPersons, clearSearchResults } from "../../store/personsSlice";

interface SearchPanelProps {
  search: string;
  maxPeopleCount: string;
  filteredPeople: Person[];
  onSearchChange: (value: string) => void;
  onMaxCountChange: (value: string) => void;
  onPersonClick: (person: Person) => void;
  onPersonHover: (person: Person | null) => void;
}

const SearchPanel: React.FC<SearchPanelProps> = React.memo(
  ({
    search,
    maxPeopleCount,
    filteredPeople,
    onSearchChange,
    onMaxCountChange,
    onPersonClick,
    onPersonHover,
  }) => {
    const dispatch = useAppDispatch();
    const searchResults = useAppSelector((s) => s.persons.searchResults);
    const searchLoading = useAppSelector((s) => s.persons.searchLoading);
    const [localSearch, setLocalSearch] = useState(search);
    const [activeIndex, setActiveIndex] = useState(-1);

    useEffect(() => {
      setLocalSearch(search);
    }, [search]);

    // Debounced dispatch to Redux filter + API fuzzy search
    useEffect(() => {
      const timer = setTimeout(() => {
        if (localSearch !== search) {
          onSearchChange(localSearch);
        }
        if (localSearch.length >= 2) {
          dispatch(searchPersons(localSearch));
        } else {
          dispatch(clearSearchResults());
        }
      }, 300);
      return () => clearTimeout(timer);
    }, [localSearch, search, onSearchChange, dispatch]);

    // Reset active index when results change
    useEffect(() => {
      setActiveIndex(-1);
    }, [searchResults, filteredPeople]);

    const clearSearch = useCallback(() => {
      setLocalSearch("");
      onSearchChange("");
      onPersonHover(null);
      dispatch(clearSearchResults());
      setActiveIndex(-1);
    }, [onSearchChange, onPersonHover, dispatch]);

    // Use API results if available, otherwise fall back to client-side filtering
    const displayResults: { person: Person; similarity?: number }[] =
      searchResults.length > 0
        ? searchResults
        : filteredPeople.slice(0, 30).map((p) => ({ person: p }));

    const handleClick = useCallback(
      (person: Person) => {
        if (person.lat && person.lng) {
          onPersonClick(person);
        }
      },
      [onPersonClick],
    );

    const handleSearchKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
          clearSearch();
          return;
        }

        if (!localSearch) return;

        if (e.key === "ArrowDown") {
          e.preventDefault();
          setActiveIndex((prev) => {
            const next = Math.min(prev + 1, displayResults.length - 1);
            const person = displayResults[next]?.person;
            if (person) onPersonHover(person);
            return next;
          });
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setActiveIndex((prev) => {
            const next = Math.max(prev - 1, 0);
            const person = displayResults[next]?.person;
            if (person) onPersonHover(person);
            return next;
          });
        } else if (e.key === "Enter" && activeIndex >= 0) {
          e.preventDefault();
          const person = displayResults[activeIndex]?.person;
          if (person) handleClick(person);
        }
      },
      [
        clearSearch,
        localSearch,
        displayResults,
        activeIndex,
        onPersonHover,
        handleClick,
      ],
    );

    return (
      <div
        className="search-panel-container"
        style={{
          position: "absolute",
          top: 16,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          borderRadius: 10,
          backgroundColor: "var(--bg-glass)",
          boxShadow: "0 4px 12px var(--shadow-heavy)",
          width: 480,
          padding: "10px 12px",
          color: "var(--text-primary)",
          backdropFilter: "blur(6px)",
          border: "1px solid var(--border-secondary)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: localSearch ? 8 : 0,
          }}
        >
          <select
            value={maxPeopleCount}
            onChange={(e) => onMaxCountChange(e.target.value)}
            style={{
              padding: "0 8px",
              borderRadius: 6,
              border: "1px solid var(--border-tertiary)",
              backgroundColor: "var(--bg-input)",
              color: "var(--text-primary)",
              fontSize: 14,
              fontFamily: "inherit",
              outline: "none",
              height: 38,
              cursor: "pointer",
            }}
          >
            <option value="all">All</option>
            <option value="100">Top 100</option>
            <option value="500">Top 500</option>
          </select>

          <div style={{ position: "relative", flex: 1 }}>
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search a famous person..."
              style={{
                width: "100%",
                padding: "8px 32px 8px 12px",
                borderRadius: 6,
                border: "1px solid var(--border-tertiary)",
                color: "var(--text-primary)",
                fontSize: 15,
                outline: "none",
                fontFamily: "inherit",
                backgroundColor: "var(--bg-input)",
                boxSizing: "border-box",
              }}
            />
            {localSearch && (
              <button
                onClick={clearSearch}
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  fontSize: 18,
                  color: "var(--text-tertiary)",
                  cursor: "pointer",
                  padding: 0,
                  lineHeight: 1,
                }}
                aria-label="Clear search"
              >
                &times;
              </button>
            )}
          </div>
        </div>

        {localSearch && (
          <ul
            className="custom-scrollbar"
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              maxHeight: 200,
              overflowY: "auto",
              borderRadius: 6,
              backgroundColor: "var(--bg-list)",
              border: "1px solid var(--border-primary)",
            }}
          >
            {searchLoading && (
              <li
                style={{ padding: "0.5rem 1rem", color: "var(--text-faint)" }}
              >
                Searching...
              </li>
            )}
            {!searchLoading &&
              displayResults.map((result, index) => {
                const hasCoords = !!(result.person.lat && result.person.lng);
                const isActive = index === activeIndex;
                return (
                  <li
                    key={result.person.id}
                    className="search-result-item"
                    onClick={() => handleClick(result.person)}
                    onMouseEnter={() => {
                      setActiveIndex(index);
                      onPersonHover(result.person);
                    }}
                    onMouseLeave={() => onPersonHover(null)}
                    style={{
                      ...(isActive
                        ? { backgroundColor: "var(--bg-hover)" }
                        : undefined),
                      ...(!hasCoords
                        ? { opacity: 0.5, cursor: "default" }
                        : undefined),
                    }}
                  >
                    <span>
                      {result.person.name}
                      {!hasCoords && (
                        <span
                          style={{
                            fontSize: 11,
                            color: "var(--text-muted)",
                            marginLeft: 6,
                          }}
                        >
                          (no location)
                        </span>
                      )}
                    </span>
                    {result.similarity != null && (
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--text-faint)",
                          marginLeft: 8,
                          flexShrink: 0,
                        }}
                      >
                        {Math.round(result.similarity * 100)}%
                      </span>
                    )}
                  </li>
                );
              })}
            {!searchLoading && displayResults.length === 0 && (
              <li
                style={{ padding: "0.5rem 1rem", color: "var(--text-faint)" }}
              >
                No results
              </li>
            )}
          </ul>
        )}
      </div>
    );
  },
);

SearchPanel.displayName = "SearchPanel";

export default SearchPanel;
