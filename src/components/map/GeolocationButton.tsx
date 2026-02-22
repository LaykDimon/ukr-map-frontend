import React, { useState } from "react";
import { useMap } from "react-leaflet";

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
        position: "absolute",
        top: 160,
        right: 16,
        zIndex: 1000,
      }}
    >
      <button
        onClick={handleLocate}
        disabled={locating}
        style={{
          background: "var(--bg-glass)",
          color: "var(--text-primary)",
          border: "1px solid var(--border-secondary)",
          borderRadius: 8,
          padding: "6px 14px",
          cursor: locating ? "wait" : "pointer",
          fontSize: 13,
          backdropFilter: "blur(6px)",
          boxShadow: "0 2px 8px var(--shadow)",
          opacity: locating ? 0.6 : 1,
        }}
        title="Go to my location"
      >
        {locating ? "..." : "📍 My Location"}
      </button>
    </div>
  );
};

export default GeolocationButton;
