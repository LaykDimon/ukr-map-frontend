import React from "react";
import { UserRole } from "./types";

interface RoleButtonProps {
  role: UserRole;
  onClick: (role: UserRole) => void;
}

const emojis: Record<UserRole, string> = {
  researcher: "🧑‍🔬",
  student: "🎓",
  teacher: "🧑‍🏫",
  guest: "👀",
  admin: "🔧",
};

export const RoleButton: React.FC<RoleButtonProps> = ({ role, onClick }) => {
  return (
    <button
      onClick={() => onClick(role)}
      style={{
        padding: "0.7rem 1.2rem",
        fontSize: "1rem",
        borderRadius: 12,
        background: "var(--bg-card)",
        border: "1px solid var(--border-tertiary)",
        color: "var(--text-primary)",
        cursor: "pointer",
        transition: "all 0.2s ease",
        fontFamily: "inherit",
        boxShadow: "var(--shadow)",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "var(--bg-hover)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.background = "var(--bg-card)")
      }
    >
      {emojis[role]} {role.charAt(0).toUpperCase() + role.slice(1)}
    </button>
  );
};
