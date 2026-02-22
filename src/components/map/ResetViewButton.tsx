import React from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

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
        position: "absolute",
        top: 120,
        right: 16,
        zIndex: 1000,
      }}
    >
      <button
        onClick={handleReset}
        style={{
          background: "var(--bg-glass)",
          color: "var(--text-primary)",
          border: "1px solid var(--border-secondary)",
          borderRadius: 8,
          padding: "6px 14px",
          cursor: "pointer",
          fontSize: 13,
          backdropFilter: "blur(6px)",
          boxShadow: "0 2px 8px var(--shadow)",
        }}
      >
        Reset View
      </button>
    </div>
  );
};

export default ResetViewButton;
export { ukrBounds };
