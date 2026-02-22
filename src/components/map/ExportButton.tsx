import React from "react";
import { Person } from "../../types";

interface ExportButtonProps {
  data: Person[];
}

const ExportButton: React.FC<ExportButtonProps> = ({ data }) => {
  const handleExport = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "notable-people.json");
    downloadAnchor.click();
  };

  return (
    <button
      title="Export filtered people data as JSON"
      onClick={handleExport}
      style={{
        position: "absolute",
        top: 20,
        left: 300,
        padding: "0.5rem 1rem",
        fontSize: 14,
        backgroundColor: "var(--bg-glass)",
        color: "var(--text-primary)",
        border: "1px solid var(--border-secondary)",
        borderRadius: 8,
        cursor: "pointer",
        zIndex: 1000,
        backdropFilter: "blur(6px)",
        boxShadow: "0 2px 8px var(--shadow)",
        transition: "background 0.15s",
      }}
    >
      📄 Export JSON
    </button>
  );
};

export default ExportButton;
