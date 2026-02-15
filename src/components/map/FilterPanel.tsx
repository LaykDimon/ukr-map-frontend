import React, { useMemo } from 'react';
import { Person } from '../../types';

interface FilterPanelProps {
  persons: Person[];
  category: string;
  birthPlace: string;
  birthYearRange: [number | null, number | null];
  onCategoryChange: (category: string) => void;
  onBirthPlaceChange: (birthPlace: string) => void;
  onBirthYearRangeChange: (range: [number | null, number | null]) => void;
  onReset: () => void;
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '6px 8px',
  borderRadius: 4,
  border: '1px solid #555',
  backgroundColor: '#1e1e1e',
  color: '#fff',
  fontSize: 13,
  boxSizing: 'border-box',
};

const yearInputStyle: React.CSSProperties = {
  ...selectStyle,
  // Hide number spinners
  MozAppearance: 'textfield',
  appearance: 'textfield' as any,
};

const FilterPanel: React.FC<FilterPanelProps> = ({
  persons,
  category,
  birthPlace,
  birthYearRange,
  onCategoryChange,
  onBirthPlaceChange,
  onBirthYearRangeChange,
  onReset,
}) => {
  const categories = useMemo(() => {
    const cats = new Set<string>();
    persons.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats).sort();
  }, [persons]);

  const hasFilters = category !== '' || birthPlace !== '' || birthYearRange[0] !== null || birthYearRange[1] !== null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 72,
        left: 16,
        zIndex: 1000,
        backgroundColor: 'rgba(30, 30, 30, 0.92)',
        borderRadius: 8,
        padding: '10px 12px',
        color: 'white',
        border: '1px solid #444',
        backdropFilter: 'blur(6px)',
        width: 210,
        fontSize: 13,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Filters</div>

      <label style={{ display: 'block', marginBottom: 4, color: '#aaa', fontSize: 12 }}>
        Category
      </label>
      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        style={{ ...selectStyle, marginBottom: 10 }}
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <label style={{ display: 'block', marginBottom: 4, color: '#aaa', fontSize: 12 }}>
        Birth place
      </label>
      <input
        type="text"
        placeholder="e.g. Київ"
        value={birthPlace}
        onChange={(e) => onBirthPlaceChange(e.target.value)}
        style={{ ...selectStyle, marginBottom: 10 }}
      />

      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: 4, color: '#aaa', fontSize: 12 }}>
            Year from
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="1800"
            value={birthYearRange[0] ?? ''}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9-]/g, '');
              onBirthYearRangeChange([
                val ? parseInt(val) : null,
                birthYearRange[1],
              ]);
            }}
            style={yearInputStyle}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: 4, color: '#aaa', fontSize: 12 }}>
            Year to
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="1900"
            value={birthYearRange[1] ?? ''}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9-]/g, '');
              onBirthYearRangeChange([
                birthYearRange[0],
                val ? parseInt(val) : null,
              ]);
            }}
            style={yearInputStyle}
          />
        </div>
      </div>

      {hasFilters && (
        <button
          onClick={onReset}
          style={{
            width: '100%',
            padding: '6px',
            borderRadius: 4,
            border: '1px solid #555',
            backgroundColor: 'transparent',
            color: '#aaa',
            fontSize: 12,
            cursor: 'pointer',
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#aaa'; }}
        >
          Reset filters
        </button>
      )}
    </div>
  );
};

export default FilterPanel;
