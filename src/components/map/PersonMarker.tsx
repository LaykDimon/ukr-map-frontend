import React, { useState } from "react";
import { CircleMarker, Tooltip, Popup } from "react-leaflet";
import { Person, UserRole } from "../../types";
import ProposeEditModal from "./ProposeEditModal";

interface PersonMarkerProps {
  person: Person;
  displayLat?: number;
  displayLng?: number;
  isHovered: boolean;
  userRole: UserRole;
  onRemove: (person: Person) => void;
}

const PersonMarker: React.FC<PersonMarkerProps> = ({
  person,
  displayLat,
  displayLng,
  isHovered,
  userRole,
  onRemove,
}) => {
  const [showProposeEdit, setShowProposeEdit] = useState(false);
  if (!person.lat || !person.lng) return null;

  const lat = displayLat ?? person.lat;
  const lng = displayLng ?? person.lng;

  return (
    <>
      <CircleMarker
        center={[lat, lng]}
        radius={(isHovered ? 6 : 2.5) + Math.sqrt(person.rating)}
        fillColor={isHovered ? "orange" : "blue"}
        color="white"
        fillOpacity={0.8}
        eventHandlers={{
          mouseover: (e) =>
            e.target.setStyle({
              fillColor: "yellow",
              radius: 6 + Math.sqrt(person.rating),
            }),
          mouseout: (e) =>
            e.target.setStyle({
              fillColor: isHovered ? "orange" : "blue",
              radius: (isHovered ? 6 : 2.5) + Math.sqrt(person.rating),
            }),
        }}
      >
        <Tooltip direction="top" offset={[-10, -10]} opacity={1}>
          <div style={{ fontSize: "14px", textAlign: "left" }}>
            <strong>{person.name}</strong>
            <br />
            {person.birthDate && (
              <span
                style={{ fontSize: "12px", color: "var(--text-secondary)" }}
              >
                Born: {person.birthDate}
              </span>
            )}
            <br />
            {person.birthPlace && (
              <span
                style={{ fontSize: "12px", color: "var(--text-secondary)" }}
              >
                Place: {person.birthPlace}
              </span>
            )}
          </div>
        </Tooltip>

        <Popup minWidth={350} className="popup-fade">
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
            }}
          >
            {person.imageUrl && (
              <img
                src={person.imageUrl}
                alt={person.name}
                style={{
                  width: 100,
                  height: 100,
                  objectFit: "cover",
                  borderRadius: 6,
                  marginRight: 10,
                }}
              />
            )}
            <div>
              <h3 style={{ margin: "0 0 5px 0" }}>
                <a
                  href={`https://uk.wikipedia.org/?curid=${person.wikiPageId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: "none" }}
                >
                  {person.name}
                </a>
              </h3>
              {userRole !== "guest" && (
                <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                  <button
                    onClick={() => setShowProposeEdit(true)}
                    style={{
                      background: "rgba(0, 136, 254, 0.1)",
                      border: "1px solid rgba(0, 136, 254, 0.3)",
                      color: "var(--accent)",
                      borderRadius: "4px",
                      padding: "4px 8px",
                      fontSize: "12px",
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      flexShrink: 0,
                    }}
                    title="Suggest an edit"
                  >
                    Propose Edit
                  </button>
                  <button
                    onClick={() => onRemove(person)}
                    style={{
                      background: "rgba(255, 75, 75, 0.1)",
                      border: "1px solid rgba(255, 75, 75, 0.3)",
                      color: "var(--danger)",
                      borderRadius: "4px",
                      padding: "4px 8px",
                      fontSize: "12px",
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      flexShrink: 0,
                    }}
                    title="Remove from map"
                  >
                    × Remove
                  </button>
                </div>
              )}
              {person.summary && (
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.9em",
                    lineHeight: 1.4,
                  }}
                >
                  {person.summary.length > 550
                    ? person.summary.slice(0, 550) + "..."
                    : person.summary}
                </p>
              )}
              {person.birthDate && (
                <p
                  style={{
                    margin: "5px 0 0 0",
                    fontSize: "0.8em",
                    color: "var(--text-muted)",
                  }}
                >
                  Birthdate: {person.birthDate}
                </p>
              )}
              {person.birthPlace && (
                <p
                  style={{
                    margin: "5px 0 0 0",
                    fontSize: "0.8em",
                    color: "var(--text-muted)",
                  }}
                >
                  Birthplace: {person.birthPlace}
                </p>
              )}
              {person.views > 0 && (
                <p
                  style={{
                    margin: "5px 0 0 0",
                    fontSize: "0.8em",
                    color: "var(--text-faint)",
                  }}
                >
                  👀 {person.views} views
                </p>
              )}
            </div>
          </div>
        </Popup>
      </CircleMarker>
      {showProposeEdit && (
        <ProposeEditModal
          person={person}
          onClose={() => setShowProposeEdit(false)}
        />
      )}
    </>
  );
};

export default PersonMarker;
