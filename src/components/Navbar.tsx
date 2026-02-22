import React from "react";
import { NavLink } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { useTheme } from "../store/themeContext";
import { isTokenExpired } from "../store/tokenUtils";

const Navbar: React.FC = () => {
  const userRole = useAppSelector((s) => s.auth.user?.role);
  const token = useAppSelector((s) => s.auth.token);
  const { theme, toggleTheme } = useTheme();

  const isAdmin = userRole === "admin" && !isTokenExpired(token);

  const linkStyle: React.CSSProperties = {
    color: "var(--text-tertiary)",
    textDecoration: "none",
    padding: "6px 14px",
    borderRadius: 6,
    fontSize: 14,
    transition: "all 0.2s",
  };

  const activeLinkStyle: React.CSSProperties = {
    ...linkStyle,
    color: "var(--text-primary)",
    backgroundColor: "var(--accent-bg)",
  };

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 2000,
        backgroundColor: "var(--bg-navbar)",
        borderRadius: 12,
        padding: "6px 10px",
        display: "flex",
        gap: 4,
        border: "1px solid var(--border-primary)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 4px 20px var(--shadow-heavy)",
        alignItems: "center",
      }}
    >
      <NavLink
        to="/"
        style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}
      >
        Map
      </NavLink>
      <NavLink
        to="/statistics"
        style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}
      >
        Statistics
      </NavLink>
      <NavLink
        to="/timeline"
        style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}
      >
        Timeline
      </NavLink>
      {isAdmin && (
        <NavLink
          to="/admin"
          style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}
        >
          Admin
        </NavLink>
      )}
      <button
        onClick={toggleTheme}
        title={
          theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
        }
        style={{
          background: "transparent",
          border: "1px solid var(--border-secondary)",
          borderRadius: 6,
          padding: "4px 8px",
          cursor: "pointer",
          fontSize: 16,
          lineHeight: 1,
          marginLeft: 4,
          color: "var(--text-tertiary)",
          transition: "all 0.2s",
        }}
      >
        {theme === "dark" ? "☀️" : "🌙"}
      </button>
    </nav>
  );
};

export default Navbar;
