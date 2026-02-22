import React, { useState } from "react";
import { Person } from "../../types";

interface RemovedPeoplePanelProps {
  removedPeople: Person[];
  onRestore: (person: Person) => void;
}

const RemovedPeoplePanel: React.FC<RemovedPeoplePanelProps> = ({
  removedPeople,
  onRestore,
}) => {
  const [showList, setShowList] = useState(false);

  if (removedPeople.length === 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 40,
        right: 20,
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
              background: "rgba(255, 75, 75, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 16 }}>🗑️</span>
          </div>
          {showList && (
            <span
              style={{
                fontWeight: "500",
                fontSize: 14,
                color: "var(--text-primary)",
              }}
            >
              Hidden ({removedPeople.length})
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

      {showList && (
        <div
          style={{
            padding: "4px 0",
            overflowY: "auto",
            maxHeight: "calc(50vh - 50px)",
          }}
        >
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {removedPeople.map((person) => (
              <li
                key={person.id}
                style={{
                  padding: "8px 12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottom: "1px solid var(--border-primary)",
                  transition: "background-color 0.2s",
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: 180,
                  }}
                >
                  {person.name}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRestore(person);
                  }}
                  style={{
                    background: "rgba(74, 144, 226, 0.1)",
                    border: "1px solid rgba(74, 144, 226, 0.3)",
                    color: "var(--accent)",
                    borderRadius: 4,
                    padding: "4px 8px",
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  Restore
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RemovedPeoplePanel;
