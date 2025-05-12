import { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Popup, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import { FAMOUS_PEOPLE } from './const';
import 'leaflet/dist/leaflet.css';
import { RoleButton } from './RoleButton';

const ukrBounds = [[44, 22], [53, 40]]; // lat/lng bounds of Ukraine


function JumpToPerson({person}) {
  const map = useMap();

  useEffect(() => {
    if (person) {
      map.flyTo([person.birthplace.lat, person.birthplace.lng], 7);
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
    <div style={{
      position: 'absolute',
      top: 20,
      right: 20,
      zIndex: 1000
    }}>
      <button
        onClick={handleReset}
        style={{
          background: 'rgba(30, 30, 30, 0.85)',
          color: 'white',
          border: '1px solid #555',
          borderRadius: 6,
          padding: '0.5rem 0.75rem',
          cursor: 'pointer',
          fontSize: 14,
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
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
  "Explore different professions – who inspired change?"
];

const TeachingPrompt = () => {
  const [randomPrompt, setRandomPrompt] = useState(
    teachingPrompts[Math.floor(Math.random() * teachingPrompts.length)]
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRandomPrompt(teachingPrompts[Math.floor(Math.random() * teachingPrompts.length)]);
    }, 20000);

    return () => clearInterval(intervalId); // Cleanup the interval on component unmount
  }, []);

  return (
    <div style={{position: 'absolute',
      top: 20,
      left: 80,
      padding: '0.5rem 1rem',
      fontSize: 14,
      backgroundColor: '#222',
      color: '#fff',
      border: '1px solid #555',
      borderRadius: 6,
      zIndex: 1000
    }}>
      <strong>💡 Teaching idea:</strong> {randomPrompt}
    </div>
  );
};

const Map = () => {
  const [search, setSearch] = useState('');
  const [maxPeopleCount, setMaxPeopleCount] = useState('all');
  const [activePerson, setActivePerson] = useState(null);
  const [hoveredPerson, setHoveredPerson] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('userRole');
    saved ? setUserRole(saved) : setShowRoleModal(true);
  }, []);

  const handleSelectRole = (role) => {
    localStorage.setItem('userRole', role);
    setUserRole(role);
    setShowRoleModal(false);
  };

  const roleEmoji = (role) => {
    switch (role) {
      case 'researcher': return '🧑‍🔬';
      case 'student': return '🎓';
      case 'teacher': return '🧑‍🏫';
      case 'guest': return '👀';
      default: return '';
    }
  };
  
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const filteredPeople = useMemo(() => {
    const people = maxPeopleCount !== 'all' ? FAMOUS_PEOPLE.slice(0, parseInt(maxPeopleCount)) : FAMOUS_PEOPLE;
    const result = people.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    const sorted = result.sort((a, b) => b.rating - a.rating);
    return sorted;
  }, [search, maxPeopleCount]);

  const clearSearch = () => {
    setSearch('');
    setHoveredPerson(null);
  }

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape')
      clearSearch();
  };
  
  return (
    <div style={{ position: 'relative', height: '100vh' }}>
      {userRole !== 'guest' && <div style={{
        position: 'absolute',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        borderRadius: 10,
        backgroundColor: 'rgba(30, 30, 30, 0.9)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
        width: 510,
        padding: '1rem',
        color: 'white',
        backdropFilter: 'blur(6px)',
      }}>

        {/* Dropdown + Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: search ? '0.75rem' : 0 }}>
          <select
            value={maxPeopleCount}
            onChange={(e) => setMaxPeopleCount(e.target.value)}
            style={{
              padding: '0.6rem 0.75rem',
              borderRadius: 6,
              border: '1px solid #555',
              backgroundColor: '#1e1e1e',
              color: '#fff',
              fontSize: 14,
              fontFamily: 'inherit',
              outline: 'none',
              minWidth: 100,
              height: 42
            }}
          >
            <option value="all">All</option>
            <option value="10">Top 10</option>
            <option value="50">Top 50</option>
          </select>

          <div style={{ position: 'relative', flexGrow: 1 }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="🔍 Search a famous person..."
              style={{
                width: '85%',
                padding: '0.6rem 2.5rem 0.6rem 1rem',
                borderRadius: 6,
                border: '1px solid #555',
                color: '#fff',
                fontSize: 16,
                outline: 'none',
                fontFamily: 'inherit',
                backgroundColor: 'rgba(30, 30, 30, 0.9)',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
              }}
            />
            {search && (
              <button
                onClick={clearSearch}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  fontSize: 18,
                  color: '#aaa',
                  cursor: 'pointer',
                  padding: 0,
                  lineHeight: 1
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
          <ul className="custom-scrollbar" style={{
            listStyle: 'none',
            padding: 0,
            maxHeight: 200,
            overflowY: 'auto',
            borderRadius: 6,
            backgroundColor: '#111',
            border: '1px solid #333'
          }}>
            {filteredPeople.map((p, idx) => (
              <li key={idx}
                  onClick={() => setActivePerson(p)}
                  onMouseEnter={() => setHoveredPerson(p)}
                  onMouseLeave={() => setHoveredPerson(null)}
                  style={{
                    padding: '0.6rem 1rem',
                    cursor: 'pointer',
                    borderBottom: '1px solid #222',
                    color: '#eee',
                    background: hoveredPerson === p ? '#222' : 'transparent',
                    transition: 'background-color 0.3s ease, transform 0.2s ease'
                  }}>
                {p.name}
              </li>
            ))}
            {filteredPeople.length === 0 && (
              <li style={{ padding: '0.5rem 1rem', color: '#777' }}>No results</li>
            )}
          </ul>
        )}
      </div>}


      <div style={{ width: '100%', height: '100vh' }}>
        <MapContainer bounds={ukrBounds} style={{ height: '100vh', width: '100%' }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          {filteredPeople.map((person, idx) => {
            if (person.birthplace.lat === undefined || person.birthplace.lng === undefined)
              return null;
            return (
            <CircleMarker
              key={idx}
              center={[person.birthplace.lat, person.birthplace.lng]}
              radius={(hoveredPerson === person ? 6 : 2.5) + Math.sqrt(person.rating)} // adjust size based on rating
              fillColor={hoveredPerson === person ? 'orange' : 'blue'}
              color="white"
              fillOpacity={0.8}
              style={{ transition: 'all 0.3s ease' }}
              eventHandlers={{
                mouseover: (e) => e.target.setStyle({ fillColor: 'yellow', radius: 5 }),
                mouseout: (e) => e.target.setStyle({ fillColor: 'blue', radius: 2.5 + Math.sqrt(person.rating) })
              }}
            >
              {/* Tooltip for hover */}
              <Tooltip direction="top" offset={[-10, -10]} opacity={1}>
                <div style={{ fontSize: '14px', textAlign: 'left' }}>
                  <strong>{person.name}</strong><br />
                  {person.birthdate && (
                    <span style={{ fontSize: '12px', color: '#ccc' }}>
                      Born: {person.birthdate}
                    </span>
                  )}
                  <br />
                  {person.birthplace?.birthplace && (
                    <span style={{ fontSize: '12px', color: '#ccc' }}>
                      Place: {person.birthplace.birthplace}
                    </span>
                  )}
                </div>
              </Tooltip>

              <Popup minWidth={350} className="popup-fade">
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
                  {person.image && (
                    <img
                      src={person.image}
                      alt={person.name}
                      style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 6, marginRight: 10 }}
                    />
                  )}
                  <div>
                    <h3 style={{ margin: '0 0 5px 0' }}>
                      <a
                        href={`https://uk.wikipedia.org/?curid=${person.id}`}
                        target='_blank'
                        rel='noopener noreferrer'
                        style={{ textDecoration: 'none' }}
                      >
                        {person.name}
                      </a>
                    </h3>
                    {userRole !== 'guest' && person.summary && (
                      <p style={{ margin: 0, fontSize: '0.9em', lineHeight: 1.4 }}>{person.summary.length > 550 ? person.summary.slice(0, 550) + '...' : person.summary}</p>
                    )}
                    {person.birthdate && (
                      <p style={{ margin: '5px 0 0 0', fontSize: '0.8em', color: '#888' }}>
                        Birthdate: {person.birthdate}
                      </p>
                    )}
                    {person.birthplace.birthplace && (
                      <p style={{ margin: '5px 0 0 0', fontSize: '0.8em', color: '#888' }}>
                        Birthplace: {person.birthplace.birthplace}
                      </p>
                    )}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          )})}
          {activePerson && <JumpToPerson person={activePerson} />}
          <ResetViewButton/>
        </MapContainer>
      </div>

      {showRoleModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'linear-gradient(145deg, #1c1c1c, #292929)',
            color: 'white',
            padding: '2rem',
            borderRadius: 16,
            boxShadow: '0 12px 24px rgba(0,0,0,0.5)',
            textAlign: 'center',
            minWidth: 320,
            maxWidth: '90%',
            animation: 'fadeIn 0.3s ease-in-out'
          }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.4rem' }}>👋 Who are you?</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <RoleButton role="researcher" onClick={handleSelectRole}>🧑‍🔬 Researcher</RoleButton>
              <RoleButton role="teacher" onClick={handleSelectRole}>🧑‍🏫 Teacher</RoleButton>
              <RoleButton role="student" onClick={handleSelectRole}>🎓 Student</RoleButton>
              <RoleButton role="guest" onClick={handleSelectRole}>👀 Guest</RoleButton>
            </div>
          </div>
        </div>
      )}

      {userRole && (
        <div style={{
          position: 'fixed',
          bottom: 12,
          left: 12,
          background: '#1c1c1c',
          color: '#fff',
          padding: '0.5rem 1rem',
          borderRadius: 10,
          fontSize: 14,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
          border: '1px solid #333'
        }}>
          <span style={{ opacity: 0.9 }}>Role: {roleEmoji(userRole)} {capitalize(userRole)}</span>
          <button onClick={() => setShowRoleModal(true)} style={{
            background: '#2d2d2d',
            border: '1px solid #444',
            color: '#ccc',
            padding: '0.25rem 0.6rem',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 12,
            transition: 'all 0.2s ease'
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#444'}
            onMouseLeave={e => e.currentTarget.style.background = '#2d2d2d'}
          >
            Change
          </button>
        </div>
      )}

      {userRole === 'researcher' && filteredPeople.length > 0 && (
        <button
          title='Export filtered people data as JSON'
          onClick={() => {
            const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredPeople, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute('href', dataStr);
            downloadAnchor.setAttribute('download', 'notable-people.json');
            downloadAnchor.click();
          }}
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
      )}

      {userRole === 'teacher' && <TeachingPrompt />}
      {userRole === 'teacher' && (
        <div style={{position: 'absolute',
          top: 70,
          left: 80,
          padding: '1rem 1.5rem',
          fontSize: '14px',
          backgroundColor: '#222',
          color: '#fff',
          border: '1px solid #555',
          borderRadius: '8px',
          zIndex: 1000,
          width: 'fit-content',
          boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)',
        }}>
          <button onClick={() => setShowQuestions(prev => !prev)}
            style={{
              padding: '0.6rem 1.2rem',
              fontSize: '14px',
              backgroundColor: '#333', 
              color: '#fff',
              border: '1px solid #444',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease-in-out',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            {showQuestions ? '🔽 Hide Questions' : '❓ Suggested Questions'}
          </button>
          {showQuestions && (
            <ul style={{
              marginTop: '0.5rem',
              padding: '0.5rem 0',
              listStyleType: 'disc',
              color: '#ddd',
              marginLeft: '1.5rem',
            }}>
              <li style={{ marginBottom: '0.8rem' }}>Who on the map lived during the same era?</li>
              <li style={{ marginBottom: '0.8rem' }}>Which of these people contributed to Ukrainian independence?</li>
              <li style={{ marginBottom: '0.8rem' }}>Can you find someone born near your city?</li>
              <li style={{ marginBottom: '0.8rem' }}>Who influenced Ukrainian culture the most?</li>
              <li style={{ marginBottom: '0.8rem' }}>Which figures are linked to Ukrainian literature?</li>
              <li style={{ marginBottom: '0.8rem' }}>Who were the key figures during the Cossack Hetmanate?</li>
              <li>Can you find someone who contributed to Ukrainian art?</li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default Map;
