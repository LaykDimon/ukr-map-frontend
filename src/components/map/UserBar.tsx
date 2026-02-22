import React from "react";
import { UserRole } from "../../types";

interface UserBarProps {
  userRole: UserRole;
  userName?: string;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}

const UserBar: React.FC<UserBarProps> = ({
  userRole,
  userName,
  onLoginClick,
  onLogoutClick,
}) => {
  return (
    <div
      className="user-bar-container"
      style={{
        position: "absolute",
        top: 16,
        right: 16,
        zIndex: 1000,
      }}
    >
      {userRole !== "guest" ? (
        <div
          style={{
            background: "var(--bg-glass)",
            padding: "8px 14px",
            borderRadius: 8,
            color: "var(--text-primary)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            border: "1px solid var(--border-secondary)",
            backdropFilter: "blur(6px)",
            boxShadow: "0 2px 8px var(--shadow)",
          }}
        >
          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            {userName}
          </span>
          <span
            style={{
              fontSize: 11,
              padding: "2px 8px",
              borderRadius: 4,
              backgroundColor: "var(--accent-bg)",
              color: "var(--text-link)",
            }}
          >
            {userRole}
          </span>
          <button
            onClick={onLogoutClick}
            style={{
              background: "transparent",
              border: "1px solid var(--border-tertiary)",
              color: "var(--text-tertiary)",
              borderRadius: 4,
              cursor: "pointer",
              padding: "4px 10px",
              fontSize: 12,
              transition: "color 0.15s, border-color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--danger)";
              e.currentTarget.style.borderColor = "var(--danger)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-tertiary)";
              e.currentTarget.style.borderColor = "var(--border-tertiary)";
            }}
          >
            Log out
          </button>
        </div>
      ) : (
        <button
          onClick={onLoginClick}
          style={{
            background: "var(--bg-glass)",
            color: "var(--text-link)",
            border: "1px solid var(--border-secondary)",
            borderRadius: 8,
            padding: "8px 18px",
            cursor: "pointer",
            fontSize: 14,
            backdropFilter: "blur(6px)",
            boxShadow: "0 2px 8px var(--shadow)",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--bg-glass-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--bg-glass)";
          }}
        >
          Log In
        </button>
      )}
    </div>
  );
};

export default UserBar;
