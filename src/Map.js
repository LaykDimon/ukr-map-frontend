import { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Popup, CircleMarker, useMap } from 'react-leaflet';
import { FAMOUS_PEOPLE } from './const';
import 'leaflet/dist/leaflet.css';

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

function ResetViewButton({bounds}) {
  const map = useMap();

  const handleReset = () => {
    map.fitBounds(ukrBounds);
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

const Map = () => {
  const [search, setSearch] = useState('');
  const [maxPeopleCount, setMaxPeopleCount] = useState('all');
  const [activePerson, setActivePerson] = useState(null);
  const [hoveredPerson, setHoveredPerson] = useState(null);

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
      <div style={{
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
                backgroundColor: '#1e1e1e',
                color: '#fff',
                fontSize: 16,
                outline: 'none',
                fontFamily: 'inherit'
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
                    transition: 'background 0.2s'
                  }}>
                {p.name}
              </li>
            ))}
            {filteredPeople.length === 0 && (
              <li style={{ padding: '0.5rem 1rem', color: '#777' }}>No results</li>
            )}
          </ul>
        )}
      </div>


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
            >
              <Popup minWidth={350}>
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
                    {person.summary && (
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
    </div>
  );
}

export default Map;
