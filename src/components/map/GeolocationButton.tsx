import React, { useState } from 'react';
import { useMap } from 'react-leaflet';

const GeolocationButton: React.FC = () => {
  const map = useMap();
  const [locating, setLocating] = useState(false);

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        map.flyTo([pos.coords.latitude, pos.coords.longitude], 10, {
          duration: 1,
        });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 60,
        right: 20,
        zIndex: 1000,
      }}
    >
      <button
        onClick={handleLocate}
        disabled={locating}
        style={{
          background: 'rgba(30, 30, 30, 0.85)',
          color: 'white',
          border: '1px solid #555',
          borderRadius: 6,
          padding: '0.5rem 0.75rem',
          cursor: locating ? 'wait' : 'pointer',
          fontSize: 14,
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          opacity: locating ? 0.6 : 1,
        }}
        title="Go to my location"
      >
        {locating ? '...' : '📍 My Location'}
      </button>
    </div>
  );
};

export default GeolocationButton;
