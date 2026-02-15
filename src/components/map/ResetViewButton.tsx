import React from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const ukrBounds: L.LatLngBoundsExpression = [
  [44, 22],
  [53, 40],
];

const ResetViewButton: React.FC = () => {
  const map = useMap();

  const handleReset = () => {
    map.flyToBounds(ukrBounds, { duration: 0.8 });
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 1000,
      }}
    >
      <button
        onClick={handleReset}
        style={{
          background: 'rgba(30, 30, 30, 0.85)',
          color: 'white',
          border: '1px solid #555',
          borderRadius: 6,
          padding: '0.5rem 0.75rem',
          cursor: 'pointer',
          fontSize: 14,
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        }}
      >
        Reset View
      </button>
    </div>
  );
};

export default ResetViewButton;
export { ukrBounds };
