import React, { useState, useMemo, useCallback } from 'react';
import { useMap, useMapEvents, CircleMarker, Tooltip } from 'react-leaflet';
import Supercluster from 'supercluster';
import { Person, UserRole } from '../../types';
import PersonMarker from './PersonMarker';

interface ClusteredMarkersProps {
  people: Person[];
  hoveredPerson: Person | null;
  userRole: UserRole;
  onRemove: (person: Person) => void;
}

const ClusteredMarkers: React.FC<ClusteredMarkersProps> = ({
  people,
  hoveredPerson,
  userRole,
  onRemove,
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
      radius: 60,
      maxZoom: 17,
      minZoom: 0,
    });

    const filtered = people.filter((p) => p.lat && p.lng);

    // Count how many people share exact same coordinates
    const coordCounts = new Map<string, number>();
    const coordIndices = new Map<string, number>();
    for (const p of filtered) {
      const key = `${p.lat},${p.lng}`;
      coordCounts.set(key, (coordCounts.get(key) || 0) + 1);
    }

    const points: Supercluster.PointFeature<{ person: Person }>[] = filtered
      .map((person) => {
        let lat = person.lat!;
        let lng = person.lng!;
        const key = `${person.lat},${person.lng}`;
        const total = coordCounts.get(key)!;

        // Spread overlapping markers in a circle
        if (total > 1) {
          const idx = coordIndices.get(key) || 0;
          coordIndices.set(key, idx + 1);
          const angle = (2 * Math.PI * idx) / total;
          const offset = 0.003; // ~300m offset
          lat += offset * Math.cos(angle);
          lng += offset * Math.sin(angle);
        }

        return {
          type: 'Feature' as const,
          properties: { person },
          geometry: {
            type: 'Point' as const,
            coordinates: [lng, lat],
          },
        };
      });

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

  return (
    <>
      {clusters.map((feature) => {
        const [lng, lat] = feature.geometry.coordinates;
        const props = feature.properties;

        if (props.cluster) {
          const count = props.point_count;
          const size = 20 + Math.min(count, 200) * 0.15;

          return (
            <CircleMarker
              key={`cluster-${feature.id}`}
              center={[lat, lng]}
              radius={size}
              fillColor={count > 50 ? '#e74c3c' : count > 10 ? '#f39c12' : '#3498db'}
              color="white"
              weight={2}
              fillOpacity={0.8}
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
            onRemove={onRemove}
          />
        );
      })}
    </>
  );
};

export default ClusteredMarkers;
