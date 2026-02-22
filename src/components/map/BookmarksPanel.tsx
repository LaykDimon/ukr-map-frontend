import React, { useState } from "react";
import { Person } from "../../types";

interface BookmarksPanelProps {
  bookmarkedPeople: Person[];
  onRemoveBookmark: (person: Person) => void;
  onPersonClick: (person: Person) => void;
}

const BookmarksPanel: React.FC<BookmarksPanelProps> = ({
  bookmarkedPeople,
  onRemoveBookmark,
  onPersonClick,
}) => {
  const [showList, setShowList] = useState(false);

  if (bookmarkedPeople.length === 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 120,
        left: 20,
        zIndex: 1000,
        width: showList ? 300 : 50,
        height: showList ? "auto" : 50,
        maxHeight: "60vh",
        overflow: "hidden",
        transition: "all 0.3s ease",
        backgroundColor: "var(--bg-glass)",
        borderRadius: 8,
        boxShadow: "0 2px 10px var(--shadow)",
        backdropFilter: "blur(6px)",
        border: "1px solid var(--border-secondary)",
      }}
    >
      {/* Header / toggle */}
      <div
        onClick={() => setShowList(!showList)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.6rem",
          cursor: "pointer",
          backgroundColor: showList ? "var(--bg-hover)" : "transparent",
          borderBottom: showList ? "1px solid var(--border-primary)" : "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 6,
              background: "rgba(255, 193, 7, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 16 }}>★</span>
          </div>
          {showList && (
            <span
              style={{
                fontWeight: "500",
                fontSize: 14,
                color: "var(--text-primary)",
              }}
            >
              Bookmarks ({bookmarkedPeople.length})
            </span>
          )}
        </div>
        {showList && (
          <span
            style={{ fontSize: 12, color: "var(--text-muted)", marginRight: 4 }}
          >
            ▼
          </span>
        )}
      </div>

      {/* List */}
      {showList && (
        <div
          style={{
            padding: "4px 0",
            overflowY: "auto",
            maxHeight: "calc(50vh - 50px)",
          }}
        >
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {bookmarkedPeople.map((person) => (
              <li
                key={person.id}
                style={{
                  padding: "8px 12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottom: "1px solid var(--border-primary)",
                  transition: "background-color 0.2s",
                  cursor: "pointer",
                }}
                onClick={() => onPersonClick(person)}
                title="Fly to on map"
              >
                <div
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: 180,
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      color: "var(--text-secondary)",
                    }}
                  >
                    {person.name}
                  </span>
                  {person.birthYear && (
                    <span
                      style={{
                        fontSize: 11,
                        color: "var(--text-muted)",
                        marginLeft: 4,
                      }}
                    >
                      ({person.birthYear})
                    </span>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveBookmark(person);
                  }}
                  style={{
                    background: "rgba(255, 75, 75, 0.1)",
                    border: "1px solid rgba(255, 75, 75, 0.3)",
                    color: "var(--danger)",
                    borderRadius: 4,
                    padding: "4px 8px",
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    flexShrink: 0,
                  }}
                  title="Remove bookmark"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BookmarksPanel;
