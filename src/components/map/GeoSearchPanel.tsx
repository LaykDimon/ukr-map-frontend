import React, { useState, useCallback, useRef, useEffect } from "react";
import { useMapEvents, Circle, Polygon } from "react-leaflet";
import L from "leaflet";
import { Person } from "../../types";
import { personsApi } from "../../api";

type GeoMode = "none" | "radius" | "polygon";

interface GeoSearchPanelProps {
  onResults: (persons: Person[]) => void;
  onClear: () => void;
  onPersonClick: (person: Person) => void;
}

const btnStyle: React.CSSProperties = {
  padding: "5px 10px",
  borderRadius: 4,
  border: "1px solid var(--border-tertiary)",
  backgroundColor: "var(--bg-input)",
  color: "var(--text-primary)",
  cursor: "pointer",
  fontSize: 12,
};

const activeBtnStyle: React.CSSProperties = {
  ...btnStyle,
  backgroundColor: "var(--accent)",
  color: "#fff",
};

/** Inner component that uses useMapEvents (must be inside MapContainer) */
const MapClickHandler: React.FC<{
  mode: GeoMode;
  onRadiusClick: (lat: number, lng: number) => void;
  onPolygonClick: (lat: number, lng: number) => void;
}> = ({ mode, onRadiusClick, onPolygonClick }) => {
  useMapEvents({
    click(e) {
      if (mode === "radius") {
        onRadiusClick(e.latlng.lat, e.latlng.lng);
      } else if (mode === "polygon") {
        onPolygonClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

const GeoSearchPanel: React.FC<GeoSearchPanelProps> = ({
  onResults,
  onClear,
  onPersonClick,
}) => {
  const [mode, setMode] = useState<GeoMode>("none");
  const [loading, setLoading] = useState(false);

  // Radius mode state
  const [center, setCenter] = useState<[number, number] | null>(null);
  const [radius, setRadius] = useState(50); // km

  // Polygon mode state
  const [polyPoints, setPolyPoints] = useState<[number, number][]>([]);
  const [polyClosed, setPolyClosed] = useState(false);

  // Results
  const [results, setResults] = useState<Person[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Prevent Leaflet map clicks when interacting with the panel
  const panelRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (panelRef.current) {
      L.DomEvent.disableClickPropagation(panelRef.current);
      L.DomEvent.disableScrollPropagation(panelRef.current);
    }
  }, []);
  useEffect(() => {
    if (resultsRef.current) {
      L.DomEvent.disableClickPropagation(resultsRef.current);
      L.DomEvent.disableScrollPropagation(resultsRef.current);
    }
  }, [showResults]);

  const handleRadiusClick = useCallback((lat: number, lng: number) => {
    setCenter([lat, lng]);
  }, []);

  const handlePolygonClick = useCallback(
    (lat: number, lng: number) => {
      if (polyClosed) return;
      setPolyPoints((prev) => [...prev, [lat, lng]]);
    },
    [polyClosed],
  );

  const closePolygon = useCallback(() => {
    if (polyPoints.length >= 3) {
      setPolyClosed(true);
    }
  }, [polyPoints]);

  const handleResults = useCallback(
    (data: Person[]) => {
      setResults(data);
      setShowResults(data.length > 0);
      onResults(data);
    },
    [onResults],
  );

  const searchRadius = useCallback(async () => {
    if (!center) return;
    setLoading(true);
    try {
      const res = await personsApi.geoRadius(center[0], center[1], radius, 500);
      handleResults(res.data);
    } catch (err) {
      console.error("Geo radius search failed:", err);
    } finally {
      setLoading(false);
    }
  }, [center, radius, handleResults]);

  const searchPolygon = useCallback(async () => {
    if (polyPoints.length < 3) return;
    setLoading(true);
    try {
      const ring = [...polyPoints, polyPoints[0]].map(([lat, lng]) => [
        lng,
        lat,
      ]);
      const polygon: GeoJSON.Geometry = {
        type: "Polygon",
        coordinates: [ring],
      };
      const res = await personsApi.geoPolygon(polygon, 500);
      handleResults(res.data);
    } catch (err) {
      console.error("Geo polygon search failed:", err);
    } finally {
      setLoading(false);
    }
  }, [polyPoints, handleResults]);

  const clearGeo = useCallback(() => {
    setMode("none");
    setCenter(null);
    setPolyPoints([]);
    setPolyClosed(false);
    setResults([]);
    setShowResults(false);
    onClear();
  }, [onClear]);

  const startRadius = useCallback(() => {
    setMode("radius");
    setCenter(null);
    setPolyPoints([]);
    setPolyClosed(false);
    setResults([]);
    setShowResults(false);
    onClear();
  }, [onClear]);

  const startPolygon = useCallback(() => {
    setMode("polygon");
    setCenter(null);
    setPolyPoints([]);
    setPolyClosed(false);
    setResults([]);
    setShowResults(false);
    onClear();
  }, [onClear]);

  const exportCsv = useCallback(() => {
    if (results.length === 0) return;
    const header = "Name,Category,BirthYear,BirthPlace,Lat,Lng\n";
    const rows = results
      .map(
        (p) =>
          `"${p.name}","${p.category || ""}",${p.birthYear ?? ""},"${p.birthPlace || ""}",${p.lat ?? ""},${p.lng ?? ""}`,
      )
      .join("\n");
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + header + rows], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `geo-search-${results.length}-persons.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [results]);

  return (
    <>
      {/* Map event handlers — only active when in drawing mode */}
      <MapClickHandler
        mode={mode}
        onRadiusClick={handleRadiusClick}
        onPolygonClick={handlePolygonClick}
      />

      {/* Draw circle for radius mode */}
      {mode === "radius" && center && (
        <Circle
          center={center}
          radius={radius * 1000}
          pathOptions={{
            color: "#e74c3c",
            fillColor: "#e74c3c",
            fillOpacity: 0.15,
            weight: 2,
          }}
        />
      )}

      {/* Draw polygon */}
      {mode === "polygon" && polyPoints.length >= 2 && (
        <Polygon
          positions={polyPoints}
          pathOptions={{
            color: "#9b59b6",
            fillColor: "#9b59b6",
            fillOpacity: polyClosed ? 0.15 : 0.05,
            weight: 2,
            dashArray: polyClosed ? undefined : "5 5",
          }}
        />
      )}

      {/* Control Panel — to the left of LayerSwitcher (bottomright) */}
      <div
        ref={panelRef}
        style={{
          position: "absolute",
          bottom: 24,
          right: 110,
          zIndex: 1000,
          backgroundColor: "var(--bg-glass)",
          borderRadius: 8,
          padding: "10px 12px",
          color: "var(--text-primary)",
          border: "1px solid var(--border-secondary)",
          backdropFilter: "blur(6px)",
          fontSize: 13,
          width: 240,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Geo Search</div>

        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
          <button
            onClick={startRadius}
            style={mode === "radius" ? activeBtnStyle : btnStyle}
          >
            ◎ Radius
          </button>
          <button
            onClick={startPolygon}
            style={mode === "polygon" ? activeBtnStyle : btnStyle}
          >
            ⬡ Polygon
          </button>
          {mode !== "none" && (
            <button onClick={clearGeo} style={btnStyle}>
              ✕ Clear
            </button>
          )}
        </div>

        {/* Radius mode controls */}
        {mode === "radius" && (
          <div>
            <div
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                marginBottom: 6,
              }}
            >
              {center
                ? `Center: ${center[0].toFixed(3)}, ${center[1].toFixed(3)}`
                : "Click on map to set center point"}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 6,
              }}
            >
              <label style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                Radius (km):
              </label>
              <input
                type="number"
                value={radius}
                onChange={(e) => setRadius(Math.max(1, Number(e.target.value)))}
                min={1}
                max={1000}
                style={{
                  width: 60,
                  padding: "3px 6px",
                  borderRadius: 4,
                  border: "1px solid var(--border-tertiary)",
                  backgroundColor: "var(--bg-input)",
                  color: "var(--text-primary)",
                  fontSize: 12,
                }}
              />
            </div>
            <button
              onClick={searchRadius}
              disabled={!center || loading}
              style={{
                ...btnStyle,
                width: "100%",
                opacity: !center || loading ? 0.5 : 1,
                backgroundColor: "var(--accent)",
                color: "#fff",
              }}
            >
              {loading ? "Searching…" : "Search in radius"}
            </button>
          </div>
        )}

        {/* Polygon mode controls */}
        {mode === "polygon" && (
          <div>
            <div
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                marginBottom: 6,
              }}
            >
              {polyClosed
                ? `Polygon: ${polyPoints.length} points (closed)`
                : polyPoints.length === 0
                  ? "Click on map to add polygon vertices"
                  : `${polyPoints.length} point${polyPoints.length > 1 ? "s" : ""} — click to add more`}
            </div>
            {!polyClosed && polyPoints.length >= 3 && (
              <button
                onClick={closePolygon}
                style={{ ...btnStyle, marginBottom: 6, width: "100%" }}
              >
                Close polygon ({polyPoints.length} points)
              </button>
            )}
            <button
              onClick={searchPolygon}
              disabled={polyPoints.length < 3 || loading}
              style={{
                ...btnStyle,
                width: "100%",
                opacity: polyPoints.length < 3 || loading ? 0.5 : 1,
                backgroundColor: "var(--accent)",
                color: "#fff",
              }}
            >
              {loading ? "Searching…" : "Search in polygon"}
            </button>
          </div>
        )}

        {/* Result summary */}
        {results.length > 0 && (
          <div
            style={{
              marginTop: 8,
              borderTop: "1px solid var(--border-tertiary)",
              paddingTop: 8,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 600 }}>
                {results.length} person{results.length !== 1 ? "s" : ""} found
              </span>
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  onClick={() => setShowResults((v) => !v)}
                  style={{ ...btnStyle, padding: "2px 8px", fontSize: 11 }}
                >
                  {showResults ? "Hide" : "Show"}
                </button>
                <button
                  onClick={exportCsv}
                  title="Export results as CSV"
                  style={{ ...btnStyle, padding: "2px 8px", fontSize: 11 }}
                >
                  CSV ↓
                </button>
              </div>
            </div>
            {/* Top categories breakdown */}
            {(() => {
              const cats = new Map<string, number>();
              results.forEach((p) => {
                const c = p.category || "Unknown";
                cats.set(c, (cats.get(c) || 0) + 1);
              });
              const top = Array.from(cats.entries())
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3);
              return (
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  {top.map(([cat, count]) => `${cat}: ${count}`).join(" · ")}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Results list panel — slides up above the control panel */}
      {showResults && results.length > 0 && (
        <div
          ref={resultsRef}
          style={{
            position: "absolute",
            bottom: mode !== "none" ? /* panel height varies */ 260 : 160,
            right: 110,
            zIndex: 1000,
            backgroundColor: "var(--bg-glass)",
            borderRadius: 8,
            padding: "8px 0",
            color: "var(--text-primary)",
            border: "1px solid var(--border-secondary)",
            backdropFilter: "blur(6px)",
            width: 240,
            maxHeight: 280,
            overflowY: "auto",
          }}
        >
          {results
            .sort((a, b) => b.rating - a.rating)
            .map((person) => (
              <div
                key={person.id}
                onClick={() => onPersonClick(person)}
                style={{
                  padding: "5px 10px",
                  cursor: "pointer",
                  borderBottom: "1px solid var(--border-tertiary)",
                  transition: "background-color 0.1s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--bg-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {person.name}
                </div>
                <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
                  {[person.birthYear, person.category, person.birthPlace]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
              </div>
            ))}
        </div>
      )}
    </>
  );
};

export default GeoSearchPanel;
