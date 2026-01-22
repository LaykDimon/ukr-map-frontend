import { useState, useMemo, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Popup,
  CircleMarker,
  Tooltip,
  useMap,
} from "react-leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";

const ukrBounds = [
  [44, 22],
  [53, 40],
]; // lat/lng bounds of Ukraine

function JumpToPerson({ person }) {
  const map = useMap();

  useEffect(() => {
    if (person) {
      map.flyTo([person.lat, person.lng], 7);
    }
  }, [person]);

  return null;
}

function ResetViewButton() {
  const map = useMap();

  const handleReset = () => {
    map.flyToBounds(ukrBounds, { duration: 0.8 });
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 20,
        right: 20,
        zIndex: 1000,
      }}
    >
      <button
        onClick={handleReset}
        style={{
          background: "rgba(30, 30, 30, 0.85)",
          color: "white",
          border: "1px solid #555",
          borderRadius: 6,
          padding: "0.5rem 0.75rem",
          cursor: "pointer",
          fontSize: 14,
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
        }}
      >
        Reset View
      </button>
    </div>
  );
}

const teachingPrompts = [
  "Pick 3 figures on the map. Ask students to compare their historical impact.",
  "Find someone from your region. What do they symbolize?",
  "Who among the top 50 had the greatest global influence?",
  "Select two poets and discuss their themes.",
  "Explore different professions – who inspired change?",
];

const TeachingPrompt = () => {
  const [randomPrompt, setRandomPrompt] = useState(
    teachingPrompts[Math.floor(Math.random() * teachingPrompts.length)],
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRandomPrompt(
        teachingPrompts[Math.floor(Math.random() * teachingPrompts.length)],
      );
    }, 20000);

    return () => clearInterval(intervalId); // Cleanup the interval on component unmount
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 80,
        left: 20,
        padding: "0.5rem 1rem",
        fontSize: 14,
        backgroundColor: "#222",
        color: "#fff",
        border: "1px solid #555",
        borderRadius: 6,
        zIndex: 1000,
      }}
    >
      <strong>💡 Teaching idea:</strong> {randomPrompt}
    </div>
  );
};

const Map = ({ userRole, userName, onLoginClick, onLogoutClick }) => {
  const [people, setPeople] = useState([]);
  const [search, setSearch] = useState("");
  const [maxPeopleCount, setMaxPeopleCount] = useState("all");
  const [activePerson, setActivePerson] = useState(null);
  const [hoveredPerson, setHoveredPerson] = useState(null);
  const [showQuestions, setShowQuestions] = useState(false);
  const [removedPeople, setRemovedPeople] = useState(() => {
    const saved = localStorage.getItem("removedPeople");
    return saved ? JSON.parse(saved) : [];
  });
  const [showRemovedList, setShowRemovedList] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8000";
        const response = await axios.get(`${apiUrl}/wikipedia/famous-people`);
        setPeople(response.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  const handleRemovePerson = (person) => {
    const updatedRemoved = [...removedPeople, person];
    setRemovedPeople(updatedRemoved);
    localStorage.setItem("removedPeople", JSON.stringify(updatedRemoved));
    setActivePerson(null);
  };

  const handleRestorePerson = (person) => {
    const updatedRemoved = removedPeople.filter((p) => p.id !== person.id);
    setRemovedPeople(updatedRemoved);
    localStorage.setItem("removedPeople", JSON.stringify(updatedRemoved));
    setActivePerson(person);
  };

  const roleEmoji = (role) => {
    switch (role) {
      case "researcher":
        return "🧑‍🔬";
      case "student":
        return "🎓";
      case "teacher":
        return "🧑‍🏫";
      case "guest":
        return "👀";
      default:
        return "";
    }
  };

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const filteredPeople = useMemo(() => {
    const sourceList = people;
    const list =
      maxPeopleCount !== "all"
        ? sourceList.slice(0, parseInt(maxPeopleCount))
        : sourceList;

    const result = list
      .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
      .filter((p) => !removedPeople.some((rp) => rp.id === p.id));

    const sorted = result.sort((a, b) => b.rating - a.rating);
    return sorted;
  }, [search, maxPeopleCount, removedPeople, people]);

  const clearSearch = () => {
    setSearch("");
    setHoveredPerson(null);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Escape") clearSearch();
  };

  return (
    <div style={{ position: "relative", height: "100vh" }}>
      {userRole !== "guest" && (
        <div
          style={{
            position: "absolute",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            borderRadius: 10,
            backgroundColor: "rgba(30, 30, 30, 0.9)",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
            width: 510,
            padding: "1rem",
            color: "white",
            backdropFilter: "blur(6px)",
          }}
        >
          {/* Dropdown + Search */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: search ? "0.75rem" : 0,
            }}
          >
            <select
              value={maxPeopleCount}
              onChange={(e) => setMaxPeopleCount(e.target.value)}
              style={{
                padding: "0.6rem 0.75rem",
                borderRadius: 6,
                border: "1px solid #555",
                backgroundColor: "#1e1e1e",
                color: "#fff",
                fontSize: 14,
                fontFamily: "inherit",
                outline: "none",
                minWidth: 100,
                height: 42,
              }}
            >
              <option value="all">All</option>
              <option value="10">Top 10</option>
              <option value="50">Top 50</option>
            </select>

            <div style={{ position: "relative", flexGrow: 1 }}>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="🔍 Search a famous person..."
                style={{
                  width: "85%",
                  padding: "0.6rem 2.5rem 0.6rem 1rem",
                  borderRadius: 6,
                  border: "1px solid #555",
                  color: "#fff",
                  fontSize: 16,
                  outline: "none",
                  fontFamily: "inherit",
                  backgroundColor: "rgba(30, 30, 30, 0.9)",
                  boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
                }}
              />
              {search && (
                <button
                  onClick={clearSearch}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    fontSize: 18,
                    color: "#aaa",
                    cursor: "pointer",
                    padding: 0,
                    lineHeight: 1,
                  }}
                  aria-label="Clear search"
                >
                  &times;
                </button>
              )}
            </div>
          </div>

          {/* Search result list */}
          {search && (
            <ul
              className="custom-scrollbar"
              style={{
                listStyle: "none",
                padding: 0,
                maxHeight: 200,
                overflowY: "auto",
                borderRadius: 6,
                backgroundColor: "#111",
                border: "1px solid #333",
              }}
            >
              {filteredPeople.map((p, idx) => (
                <li
                  key={idx}
                  onClick={() => setActivePerson(p)}
                  onMouseEnter={() => setHoveredPerson(p)}
                  onMouseLeave={() => setHoveredPerson(null)}
                  style={{
                    padding: "0.6rem 1rem",
                    cursor: "pointer",
                    borderBottom: "1px solid #222",
                    color: "#eee",
                    background: hoveredPerson === p ? "#222" : "transparent",
                    transition:
                      "background-color 0.3s ease, transform 0.2s ease",
                  }}
                >
                  {p.name}
                </li>
              ))}
              {filteredPeople.length === 0 && (
                <li style={{ padding: "0.5rem 1rem", color: "#777" }}>
                  No results
                </li>
              )}
            </ul>
          )}
        </div>
      )}

      <div
        style={{
          position: "absolute",
          top: 20,
          right: 140,
          zIndex: 1000,
          display: "flex",
          gap: "10px",
        }}
      >
        {userRole !== "guest" ? (
          <div
            style={{
              background: "rgba(30,30,30,0.9)",
              padding: "0.4rem 1rem",
              borderRadius: 6,
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              border: "1px solid #555",
              backdropFilter: "blur(4px)",
            }}
          >
            <span style={{ fontSize: 14 }}>
              👤 {userName} ({userRole})
            </span>
            <button
              onClick={onLogoutClick}
              style={{
                background: "#c62828",
                border: "none",
                color: "white",
                borderRadius: 4,
                cursor: "pointer",
                padding: "4px 8px",
                fontSize: 12,
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={onLoginClick}
            style={{
              background: "#1565c0",
              color: "white",
              border: "1px solid #0d47a1",
              borderRadius: 6,
              padding: "0.5rem 1rem",
              cursor: "pointer",
              fontSize: 14,
              boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            }}
          >
            Log In
          </button>
        )}
      </div>

      <div style={{ width: "100%", height: "100vh" }}>
        <MapContainer
          bounds={ukrBounds}
          style={{ height: "100vh", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {filteredPeople.map((person, idx) => {
            if (!person.lat || !person.lng) return null;
            return (
              <CircleMarker
                key={idx}
                center={[person.lat, person.lng]}
                radius={
                  (hoveredPerson === person ? 6 : 2.5) +
                  Math.sqrt(person.rating)
                } // adjust size based on rating
                fillColor={hoveredPerson === person ? "orange" : "blue"}
                color="white"
                fillOpacity={0.8}
                style={{ transition: "all 0.3s ease" }}
                eventHandlers={{
                  mouseover: (e) =>
                    e.target.setStyle({ fillColor: "yellow", radius: 5 }),
                  mouseout: (e) =>
                    e.target.setStyle({
                      fillColor: "blue",
                      radius: 2.5 + Math.sqrt(person.rating),
                    }),
                }}
              >
                {/* Tooltip for hover */}
                <Tooltip direction="top" offset={[-10, -10]} opacity={1}>
                  <div style={{ fontSize: "14px", textAlign: "left" }}>
                    <strong>{person.name}</strong>
                    <br />
                    {person.birthdate && (
                      <span style={{ fontSize: "12px", color: "#ccc" }}>
                        Born: {person.birthdate}
                      </span>
                    )}
                    <br />
                    {person.birthPlace && (
                      <span style={{ fontSize: "12px", color: "#ccc" }}>
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
                        <button
                          onClick={() => handleRemovePerson(person)}
                          style={{
                            background: "rgba(255, 75, 75, 0.1)",
                            border: "1px solid rgba(255, 75, 75, 0.3)",
                            color: "#ff4b4b",
                            borderRadius: "4px",
                            padding: "4px 8px",
                            fontSize: "12px",
                            fontWeight: 500,
                            cursor: "pointer",
                            transition: "all 0.2s",
                            flexShrink: 0,
                            ":hover": {
                              background: "rgba(255, 75, 75, 0.2)",
                              borderColor: "rgba(255, 75, 75, 0.5)",
                            },
                          }}
                          title="Remove from map"
                        >
                          × Remove
                        </button>
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
                            color: "#888",
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
                            color: "#888",
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
                            color: "#666",
                          }}
                        >
                          👀 {person.views} views
                        </p>
                      )}
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
          {activePerson && <JumpToPerson person={activePerson} />}
          <ResetViewButton />
        </MapContainer>
      </div>

      {userRole === "researcher" && filteredPeople.length > 0 && (
        <button
          title="Export filtered people data as JSON"
          onClick={() => {
            const dataStr =
              "data:text/json;charset=utf-8," +
              encodeURIComponent(JSON.stringify(filteredPeople, null, 2));
            const downloadAnchor = document.createElement("a");
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", "notable-people.json");
            downloadAnchor.click();
          }}
          style={{
            position: "absolute",
            top: 20,
            left: 80,
            padding: "0.5rem 1rem",
            fontSize: 14,
            backgroundColor: "#222",
            color: "#fff",
            border: "1px solid #555",
            borderRadius: 6,
            cursor: "pointer",
            zIndex: 1000,
          }}
        >
          📄 Export JSON
        </button>
      )}

      {userRole === "teacher" && <TeachingPrompt />}
      {userRole === "teacher" && (
        <div
          style={{
            position: "absolute",
            top: 20,
            left: 80,
            padding: "1rem 1.5rem",
            fontSize: "14px",
            backgroundColor: "#222",
            color: "#fff",
            border: "1px solid #555",
            borderRadius: "8px",
            zIndex: 1000,
            width: "fit-content",
            boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
          }}
        >
          <button
            onClick={() => setShowQuestions((prev) => !prev)}
            style={{
              padding: "0.6rem 1.2rem",
              fontSize: "14px",
              backgroundColor: "#333",
              color: "#fff",
              border: "1px solid #444",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "background-color 0.3s ease-in-out",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
          >
            {showQuestions ? "🔽 Hide Questions" : "❓ Suggested Questions"}
          </button>
          {showQuestions && (
            <ul
              style={{
                marginTop: "0.5rem",
                padding: "0.5rem 0",
                listStyleType: "disc",
                color: "#ddd",
                marginLeft: "1.5rem",
              }}
            >
              <li style={{ marginBottom: "0.8rem" }}>
                Who on the map lived during the same era?
              </li>
              <li style={{ marginBottom: "0.8rem" }}>
                Which of these people contributed to Ukrainian independence?
              </li>
              <li style={{ marginBottom: "0.8rem" }}>
                Can you find someone born near your city?
              </li>
              <li style={{ marginBottom: "0.8rem" }}>
                Who influenced Ukrainian culture the most?
              </li>
              <li style={{ marginBottom: "0.8rem" }}>
                Which figures are linked to Ukrainian literature?
              </li>
              <li style={{ marginBottom: "0.8rem" }}>
                Who were the key figures during the Cossack Hetmanate?
              </li>
              <li>Can you find someone who contributed to Ukrainian art?</li>
            </ul>
          )}
        </div>
      )}

      {/* Removed People Panel */}
      {userRole !== "guest" && removedPeople.length > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: 40,
            right: 20,
            zIndex: 1000,
            width: showRemovedList ? 300 : 50,
            height: showRemovedList ? "auto" : 50,
            maxHeight: "60vh",
            overflow: "hidden",
            transition: "all 0.3s ease",
            backgroundColor: "rgba(40, 40, 40, 0.9)",
            borderRadius: 8,
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
            backdropFilter: "blur(6px)",
            border: "1px solid #444",
          }}
        >
          <div
            onClick={() => setShowRemovedList(!showRemovedList)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.6rem",
              cursor: "pointer",
              backgroundColor: showRemovedList ? "#2d2d2d" : "transparent",
              borderBottom: showRemovedList ? "1px solid #3a3a3a" : "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8" }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 6,
                  background: "rgba(255, 75, 75, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: 16 }}>🗑️</span>
              </div>
              {showRemovedList && (
                <span
                  style={{ fontWeight: "500", fontSize: 14, color: "#eee" }}
                >
                  Hidden ({removedPeople.length})
                </span>
              )}
            </div>
            {showRemovedList && (
              <span style={{ fontSize: 12, color: "#999", marginRight: 4 }}>
                {showRemovedList ? "▼" : "▲"}
              </span>
            )}
          </div>

          {showRemovedList && (
            <div
              style={{
                padding: "4px 0",
                overflowY: "auto",
                maxHeight: "calc(50vh - 50px)",
              }}
            >
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                }}
              >
                {removedPeople.map((person, idx) => (
                  <li
                    key={idx}
                    style={{
                      padding: "8px 12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderBottom: "1px solid #333",
                      transition: "background-color 0.2s",
                      ":hover": {
                        backgroundColor: "#2d2d2d",
                      },
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        color: "#ddd",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 180,
                      }}
                    >
                      {person.name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRestorePerson(person);
                      }}
                      style={{
                        background: "rgba(74, 144, 226, 0.1)",
                        border: "1px solid rgba(74, 144, 226, 0.3)",
                        color: "#4a90e2",
                        borderRadius: 4,
                        padding: "4px 8px",
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        ":hover": {
                          background: "rgba(74, 144, 226, 0.2)",
                          borderColor: "rgba(74, 144, 226, 0.5)",
                        },
                      }}
                    >
                      Restore
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Map;
