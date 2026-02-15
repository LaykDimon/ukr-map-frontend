import React from 'react';
import { Person } from '../../types';

interface ExportButtonProps {
  data: Person[];
}

const ExportButton: React.FC<ExportButtonProps> = ({ data }) => {
  const handleExport = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'notable-people.json');
    downloadAnchor.click();
  };

  return (
    <button
      title="Export filtered people data as JSON"
      onClick={handleExport}
      style={{
        position: 'absolute',
        top: 20,
        left: 80,
        padding: '0.5rem 1rem',
        fontSize: 14,
        backgroundColor: '#222',
        color: '#fff',
        border: '1px solid #555',
        borderRadius: 6,
        cursor: 'pointer',
        zIndex: 1000,
      }}
    >
      📄 Export JSON
    </button>
  );
};

export default ExportButton;
