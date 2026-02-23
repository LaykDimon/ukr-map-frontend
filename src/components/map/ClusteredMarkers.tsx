import React, { useState, useMemo, useCallback } from "react";
import { useMap, useMapEvents, CircleMarker, Tooltip } from "react-leaflet";
import Supercluster from "supercluster";
import { Person, UserRole } from "../../types";
import PersonMarker from "./PersonMarker";

// Seeded PRNG for deterministic jitter (same layout on every render)
function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Parse a hex colour (#rgb or #rrggbb) into [r,g,b].
 */
function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number) {
  return (
    "#" +
    [r, g, b]
      .map((c) =>
        Math.max(0, Math.min(255, Math.round(c)))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

/**
 * Derive 3 cluster colours (low / medium / high density) from a base colour.
 * When the default marker colour is used, return the original blue / yellow / red
 * palette. Otherwise derive shades from the chosen colour.
 */
const DEFAULT_MARKER = "#3388ff";
const DEFAULT_CLUSTER: [string, string, string] = [
  "#3498db",
  "#f39c12",
  "#e74c3c",
];

function clusterColors(base: string): [string, string, string] {
  if (base === DEFAULT_MARKER) return DEFAULT_CLUSTER;
  const [r, g, b] = hexToRgb(base);
  const low = rgbToHex(r, g, b);
  const mid = rgbToHex(r * 0.8, g * 0.7, b * 0.5);
  const high = rgbToHex(Math.min(255, r * 0.9 + 60), g * 0.35, b * 0.3);
  return [low, mid, high];
}

interface ClusteredMarkersProps {
  people: Person[];
  hoveredPerson: Person | null;
  userRole: UserRole;
  bookmarkedIds?: string[];
  markerColor?: string;
  onRemove: (person: Person) => void;
  onToggleBookmark?: (person: Person) => void;
  showMarkers?: boolean;
}

const ClusteredMarkers: React.FC<ClusteredMarkersProps> = ({
  people,
  hoveredPerson,
  userRole,
  bookmarkedIds = [],
  markerColor = "#3388ff",
  onRemove,
  onToggleBookmark,
  showMarkers = true,
}) => {
  const map = useMap();
  const [bounds, setBounds] = useState(map.getBounds());
  const [zoom, setZoom] = useState(map.getZoom());

  const updateView = useCallback(() => {
    setBounds(map.getBounds());
    setZoom(map.getZoom());
  }, [map]);

  useMapEvents({
    moveend: updateView,
    zoomend: updateView,
  });

  const index = useMemo(() => {
    const sc = new Supercluster({
      radius: 120,
      maxZoom: 17,
      minZoom: 0,
      minPoints: 3,
    });

    const filtered = people.filter((p) => p.lat && p.lng);

    // Deduplicate by person ID to prevent duplicate-key React warnings
    const seen = new Set<string>();
    const unique = filtered.filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });

    // Count how many people share exact same coordinates
    const coordCounts = new Map<string, number>();
    const coordIndices = new Map<string, number>();
    for (const p of unique) {
      const key = `${p.lat},${p.lng}`;
      coordCounts.set(key, (coordCounts.get(key) || 0) + 1);
    }

    const points: Supercluster.PointFeature<{ person: Person }>[] = unique.map(
      (person) => {
        let lat = person.lat!;
        let lng = person.lng!;
        const key = `${person.lat},${person.lng}`;
        const total = coordCounts.get(key)!;

        // Spread overlapping markers using randomised spiral for natural dispersion
        if (total > 1) {
          const idx = coordIndices.get(key) || 0;
          coordIndices.set(key, idx + 1);
          const rng = seededRandom(
            person.wikiPageId || person.lat! * 1e5 + person.lng! * 1e3 + idx,
          );

          if (total <= 20) {
            // Small group: circle layout with slight random wobble
            const angle = (2 * Math.PI * idx) / total + (rng() - 0.5) * 0.3;
            const radius = 0.004 + rng() * 0.002;
            lat += radius * Math.cos(angle);
            lng += radius * Math.sin(angle);
          } else {
            // Large group (e.g. 1000+ in Kyiv): Archimedean spiral + random jitter
            const turns = 0.5 + idx * 0.15;
            const angle = turns * 2 * Math.PI;
            const spiralRadius = 0.002 + 0.0008 * Math.sqrt(idx);
            lat += spiralRadius * Math.cos(angle) + (rng() - 0.5) * 0.003;
            lng += spiralRadius * Math.sin(angle) + (rng() - 0.5) * 0.003;
          }
        }

        return {
          type: "Feature" as const,
          properties: { person },
          geometry: {
            type: "Point" as const,
            coordinates: [lng, lat],
          },
        };
      },
    );

    sc.load(points);
    return sc;
  }, [people]);

  const clusters = useMemo(() => {
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    return index.getClusters(
      [sw.lng, sw.lat, ne.lng, ne.lat],
      Math.round(zoom),
    );
  }, [index, bounds, zoom]);

  if (!showMarkers) return null;

  const [clrLow, clrMid, clrHigh] = clusterColors(markerColor);

  return (
    <>
      {clusters.map((feature) => {
        const [lng, lat] = feature.geometry.coordinates;
        const props = feature.properties;

        if (props.cluster) {
          const count = props.point_count;
          // Log-based sizing: keeps circles compact to avoid visual overlap
          const size = 16 + Math.min(Math.log2(count) * 4, 40);

          return (
            <CircleMarker
              key={`cluster-${feature.id}`}
              center={[lat, lng]}
              radius={size}
              pathOptions={{
                fillColor: count > 100 ? clrHigh : count > 20 ? clrMid : clrLow,
                color: "white",
                weight: 2,
                fillOpacity: 0.8,
              }}
              eventHandlers={{
                click: () => {
                  const expansionZoom = Math.min(
                    index.getClusterExpansionZoom(feature.id as number),
                    17,
                  );
                  map.flyTo([lat, lng], expansionZoom);
                },
              }}
            >
              <Tooltip direction="top" offset={[0, -size]} opacity={1}>
                <span>{count} people in this area</span>
              </Tooltip>
            </CircleMarker>
          );
        }

        const person: Person = (props as { person: Person }).person;
        return (
          <PersonMarker
            key={person.id}
            person={person}
            displayLat={lat}
            displayLng={lng}
            isHovered={hoveredPerson === person}
            userRole={userRole}
            isBookmarked={bookmarkedIds.includes(person.id)}
            markerColor={markerColor}
            onRemove={onRemove}
            onToggleBookmark={onToggleBookmark}
          />
        );
      })}
    </>
  );
};

export default ClusteredMarkers;
