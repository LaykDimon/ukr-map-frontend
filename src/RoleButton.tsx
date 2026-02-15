import React from 'react';
import { UserRole } from './types';

interface RoleButtonProps {
  role: UserRole;
  onClick: (role: UserRole) => void;
}

const emojis: Record<UserRole, string> = {
  researcher: '🧑‍🔬',
  student: '🎓',
  teacher: '🧑‍🏫',
  guest: '👀',
  admin: '🔧',
};

export const RoleButton: React.FC<RoleButtonProps> = ({ role, onClick }) => {
  return (
    <button
      onClick={() => onClick(role)}
      style={{
        padding: '0.7rem 1.2rem',
        fontSize: '1rem',
        borderRadius: 12,
        background: 'linear-gradient(to right, #3a3a3a, #2a2a2a)',
        border: '1px solid #555',
        color: '#fff',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontFamily: 'inherit',
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = '#444')
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.background =
          'linear-gradient(to right, #3a3a3a, #2a2a2a)')
      }
    >
      {emojis[role]} {role.charAt(0).toUpperCase() + role.slice(1)}
    </button>
  );
};
