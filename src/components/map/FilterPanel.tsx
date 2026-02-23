import React, { useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Person } from "../../types";
import { useTheme } from "../../store/themeContext";

const toRoman = (num: number): string => {
  const pairs: [number, string][] = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let result = "";
  for (const [value, symbol] of pairs) {
    while (num >= value) {
      result += symbol;
      num -= value;
    }
  }
  return result;
};

interface FilterPanelProps {
  persons: Person[];
  category: string;
  birthPlace: string;
  birthYearRange: [number | null, number | null];
  birthDate: string;
  markerColor: string;
  onCategoryChange: (category: string) => void;
  onBirthPlaceChange: (birthPlace: string) => void;
  onBirthYearRangeChange: (range: [number | null, number | null]) => void;
  onBirthDateChange: (date: string) => void;
  onMarkerColorChange: (color: string) => void;
  onReset: () => void;
}

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "6px 8px",
  borderRadius: 4,
  border: "1px solid var(--border-tertiary)",
  backgroundColor: "var(--bg-input)",
  color: "var(--text-primary)",
  fontSize: 13,
  boxSizing: "border-box",
};

const yearInputStyle: React.CSSProperties = {
  ...selectStyle,
  // Hide number spinners
  MozAppearance: "textfield",
  appearance: "textfield" as any,
};

const FilterPanel: React.FC<FilterPanelProps> = ({
  persons,
  category,
  birthPlace,
  birthYearRange,
  birthDate,
  markerColor,
  onCategoryChange,
  onBirthPlaceChange,
  onBirthYearRangeChange,
  onBirthDateChange,
  onMarkerColorChange,
  onReset,
}) => {
  const { theme } = useTheme();
  const [showCenturies, setShowCenturies] = useState(false);
  const categories = useMemo(() => {
    const cats = new Set<string>();
    persons.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats).sort();
  }, [persons]);

  const hasFilters =
    category !== "" ||
    birthPlace !== "" ||
    birthDate !== "" ||
    markerColor !== "#3388ff" ||
    birthYearRange[0] !== null ||
    birthYearRange[1] !== null;

  return (
    <div
      className="filter-panel-container"
      style={{
        position: "absolute",
        top: 16,
        left: 50,
        zIndex: 1000,
        backgroundColor: "var(--bg-glass)",
        borderRadius: 8,
        padding: "10px 12px",
        color: "var(--text-primary)",
        border: "1px solid var(--border-secondary)",
        backdropFilter: "blur(6px)",
        width: 210,
        fontSize: 13,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Filters</div>

      <label
        style={{
          display: "block",
          marginBottom: 4,
          color: "var(--text-tertiary)",
          fontSize: 12,
        }}
      >
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

      <label
        style={{
          display: "block",
          marginBottom: 4,
          color: "var(--text-tertiary)",
          fontSize: 12,
        }}
      >
        Birth place
      </label>
      <input
        type="text"
        placeholder="e.g. Київ"
        value={birthPlace}
        onChange={(e) => onBirthPlaceChange(e.target.value)}
        style={{ ...selectStyle, marginBottom: 10 }}
      />

      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <div style={{ flex: 1 }}>
          <label
            style={{
              display: "block",
              marginBottom: 4,
              color: "var(--text-tertiary)",
              fontSize: 12,
            }}
          >
            Year from
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="1800"
            value={birthYearRange[0] ?? ""}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9-]/g, "");
              onBirthYearRangeChange([
                val ? parseInt(val) : null,
                birthYearRange[1],
              ]);
            }}
            style={yearInputStyle}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label
            style={{
              display: "block",
              marginBottom: 4,
              color: "var(--text-tertiary)",
              fontSize: 12,
            }}
          >
            Year to
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="1900"
            value={birthYearRange[1] ?? ""}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9-]/g, "");
              onBirthYearRangeChange([
                birthYearRange[0],
                val ? parseInt(val) : null,
              ]);
            }}
            style={yearInputStyle}
          />
        </div>
      </div>

      {/* Century quick-select */}
      <div style={{ marginBottom: 10 }}>
        <button
          onClick={() => setShowCenturies((v) => !v)}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-tertiary)",
            fontSize: 11,
            cursor: "pointer",
            padding: 0,
            marginBottom: 4,
            textDecoration: "underline",
          }}
        >
          {showCenturies ? "▾ Hide centuries" : "▸ Quick century select"}
        </button>
        {showCenturies && (
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {(() => {
              const years = persons
                .map((p) => p.birthYear)
                .filter((y): y is number => y != null);
              if (years.length === 0) return [];
              const minCentIdx = Math.floor(Math.min(...years) / 100);
              const maxCentIdx = Math.floor(Math.max(...years) / 100);
              const centuries: { label: string; from: number; to: number }[] =
                [];
              for (let i = minCentIdx; i <= maxCentIdx; i++) {
                centuries.push({
                  label: toRoman(i + 1),
                  from: i * 100,
                  to: i * 100 + 99,
                });
              }
              return centuries;
            })().map((c) => {
              const isActive =
                birthYearRange[0] === c.from && birthYearRange[1] === c.to;
              return (
                <button
                  key={c.label}
                  onClick={() => {
                    if (isActive) {
                      onBirthYearRangeChange([null, null]);
                    } else {
                      onBirthYearRangeChange([c.from, c.to]);
                    }
                  }}
                  style={{
                    padding: "3px 8px",
                    borderRadius: 4,
                    border: "1px solid var(--border-tertiary)",
                    backgroundColor: isActive
                      ? "var(--accent)"
                      : "var(--bg-input)",
                    color: isActive ? "#fff" : "var(--text-primary)",
                    cursor: "pointer",
                    fontSize: 11,
                    transition: "background-color 0.15s",
                  }}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <label
        style={{
          display: "block",
          marginBottom: 4,
          color: "var(--text-tertiary)",
          fontSize: 12,
        }}
      >
        Birth date
      </label>
      <DatePicker
        selected={birthDate ? new Date(birthDate + "T00:00:00") : null}
        onChange={(date: Date | null) => {
          if (date) {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, "0");
            const d = String(date.getDate()).padStart(2, "0");
            onBirthDateChange(`${y}-${m}-${d}`);
          } else {
            onBirthDateChange("");
          }
        }}
        openToDate={
          birthDate ? new Date(birthDate + "T00:00:00") : new Date(1900, 0, 1)
        }
        minDate={new Date(1000, 0, 1)}
        maxDate={new Date(new Date().getFullYear(), 11, 31)}
        dateFormat="dd.MM.yyyy"
        placeholderText="dd.mm.yyyy"
        isClearable
        showYearDropdown
        showMonthDropdown
        dropdownMode="select"
        className={`filter-datepicker ${theme === "dark" ? "filter-datepicker-dark" : ""}`}
      />
      {birthDate && (
        <div
          style={{
            fontSize: 11,
            color: "var(--text-muted)",
            marginBottom: 10,
            marginTop: 2,
          }}
        >
          Matches dates containing{" "}
          {new Date(birthDate + "T00:00:00").toLocaleDateString("uk-UA", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      )}
      {!birthDate && <div style={{ marginBottom: 10 }} />}

      <label
        style={{
          display: "block",
          marginBottom: 4,
          color: "var(--text-tertiary)",
          fontSize: 12,
        }}
      >
        Map color theme
      </label>
      <div
        style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}
      >
        {["#3388ff", "#e74c3c", "#2ecc71", "#9b59b6", "#f39c12", "#1abc9c"].map(
          (c) => (
            <button
              key={c}
              onClick={() => onMarkerColorChange(c)}
              title={c}
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                border:
                  markerColor === c
                    ? "3px solid var(--text-primary)"
                    : "2px solid var(--border-tertiary)",
                backgroundColor: c,
                cursor: "pointer",
                padding: 0,
                boxSizing: "border-box",
                transition: "border 0.15s",
              }}
            />
          ),
        )}
        <input
          type="color"
          value={markerColor}
          onChange={(e) => onMarkerColorChange(e.target.value)}
          title="Custom color"
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            border: "2px solid var(--border-tertiary)",
            padding: 0,
            cursor: "pointer",
            backgroundColor: "transparent",
          }}
        />
      </div>

      {hasFilters && (
        <button
          onClick={onReset}
          style={{
            width: "100%",
            padding: "6px",
            borderRadius: 4,
            border: "1px solid var(--border-tertiary)",
            backgroundColor: "transparent",
            color: "var(--text-tertiary)",
            fontSize: 12,
            cursor: "pointer",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-tertiary)";
          }}
        >
          Reset filters
        </button>
      )}
    </div>
  );
};

export default FilterPanel;
