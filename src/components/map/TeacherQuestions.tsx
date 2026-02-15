import React, { useState } from 'react';

const TeacherQuestions: React.FC = () => {
  const [showQuestions, setShowQuestions] = useState(false);

  return (
    <div
      style={{
        position: 'absolute',
        top: 20,
        left: 80,
        padding: '1rem 1.5rem',
        fontSize: '14px',
        backgroundColor: '#222',
        color: '#fff',
        border: '1px solid #555',
        borderRadius: '8px',
        zIndex: 1000,
        width: 'fit-content',
        boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)',
      }}
    >
      <button
        onClick={() => setShowQuestions((prev) => !prev)}
        style={{
          padding: '0.6rem 1.2rem',
          fontSize: '14px',
          backgroundColor: '#333',
          color: '#fff',
          border: '1px solid #444',
          borderRadius: '6px',
          cursor: 'pointer',
          transition: 'background-color 0.3s ease-in-out',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        {showQuestions ? '🔽 Hide Questions' : '❓ Suggested Questions'}
      </button>
      {showQuestions && (
        <ul
          style={{
            marginTop: '0.5rem',
            padding: '0.5rem 0',
            listStyleType: 'disc',
            color: '#ddd',
            marginLeft: '1.5rem',
          }}
        >
          <li style={{ marginBottom: '0.8rem' }}>
            Who on the map lived during the same era?
          </li>
          <li style={{ marginBottom: '0.8rem' }}>
            Which of these people contributed to Ukrainian independence?
          </li>
          <li style={{ marginBottom: '0.8rem' }}>
            Can you find someone born near your city?
          </li>
          <li style={{ marginBottom: '0.8rem' }}>
            Who influenced Ukrainian culture the most?
          </li>
          <li style={{ marginBottom: '0.8rem' }}>
            Which figures are linked to Ukrainian literature?
          </li>
          <li style={{ marginBottom: '0.8rem' }}>
            Who were the key figures during the Cossack Hetmanate?
          </li>
          <li>Can you find someone who contributed to Ukrainian art?</li>
        </ul>
      )}
    </div>
  );
};

export default TeacherQuestions;
