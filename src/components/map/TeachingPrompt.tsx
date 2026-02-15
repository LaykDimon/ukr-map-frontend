import React, { useState, useEffect } from 'react';

const teachingPrompts = [
  'Pick 3 figures on the map. Ask students to compare their historical impact.',
  'Find someone from your region. What do they symbolize?',
  'Who among the top 50 had the greatest global influence?',
  'Select two poets and discuss their themes.',
  'Explore different professions – who inspired change?',
];

const TeachingPrompt: React.FC = () => {
  const [randomPrompt, setRandomPrompt] = useState(
    teachingPrompts[Math.floor(Math.random() * teachingPrompts.length)],
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRandomPrompt(
        teachingPrompts[Math.floor(Math.random() * teachingPrompts.length)],
      );
    }, 20000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 80,
        left: 20,
        padding: '0.5rem 1rem',
        fontSize: 14,
        backgroundColor: '#222',
        color: '#fff',
        border: '1px solid #555',
        borderRadius: 6,
        zIndex: 1000,
      }}
    >
      <strong>💡 Teaching idea:</strong> {randomPrompt}
    </div>
  );
};

export default TeachingPrompt;
