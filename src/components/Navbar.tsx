import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

const linkStyle: React.CSSProperties = {
  color: '#aaa',
  textDecoration: 'none',
  padding: '6px 14px',
  borderRadius: 6,
  fontSize: 14,
  transition: 'all 0.2s',
};

const activeLinkStyle: React.CSSProperties = {
  ...linkStyle,
  color: '#fff',
  backgroundColor: 'rgba(0, 136, 254, 0.2)',
};

const Navbar: React.FC = () => {
  const userRole = useAppSelector((s) => s.auth.user?.role);

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 2000,
        backgroundColor: 'rgba(20, 20, 20, 0.95)',
        borderRadius: 12,
        padding: '6px 10px',
        display: 'flex',
        gap: 4,
        border: '1px solid #333',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
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
      {userRole === 'admin' && (
        <NavLink
          to="/admin"
          style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}
        >
          Admin
        </NavLink>
      )}
    </nav>
  );
};

export default Navbar;
