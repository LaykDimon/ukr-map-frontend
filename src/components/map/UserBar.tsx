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
            background: "rgba(30, 30, 30, 0.92)",
            padding: "8px 14px",
            borderRadius: 8,
            color: "white",
            display: "flex",
            alignItems: "center",
            gap: 12,
            border: "1px solid #444",
            backdropFilter: "blur(6px)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
        >
          <span style={{ fontSize: 13, color: "#ccc" }}>{userName}</span>
          <span
            style={{
              fontSize: 11,
              padding: "2px 8px",
              borderRadius: 4,
              backgroundColor: "rgba(0, 136, 254, 0.15)",
              color: "#4dabf7",
            }}
          >
            {userRole}
          </span>
          <button
            onClick={onLogoutClick}
            style={{
              background: "transparent",
              border: "1px solid #555",
              color: "#aaa",
              borderRadius: 4,
              cursor: "pointer",
              padding: "4px 10px",
              fontSize: 12,
              transition: "color 0.15s, border-color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#ff6b6b";
              e.currentTarget.style.borderColor = "#ff6b6b";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#aaa";
              e.currentTarget.style.borderColor = "#555";
            }}
          >
            Log out
          </button>
        </div>
      ) : (
        <button
          onClick={onLoginClick}
          style={{
            background: "rgba(30, 30, 30, 0.92)",
            color: "#4dabf7",
            border: "1px solid #444",
            borderRadius: 8,
            padding: "8px 18px",
            cursor: "pointer",
            fontSize: 14,
            backdropFilter: "blur(6px)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(50, 50, 50, 0.95)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(30, 30, 30, 0.92)";
          }}
        >
          Log In
        </button>
      )}
    </div>
  );
};

export default UserBar;
