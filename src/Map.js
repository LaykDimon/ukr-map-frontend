import { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Popup, CircleMarker, useMap } from 'react-leaflet';
import { FAMOUS_PEOPLE } from './const';
import 'leaflet/dist/leaflet.css';

const ukrBounds = [[44, 22], [53, 40]]; // lat/lng bounds of Ukraine


function FlyToPerson({person}) {
  const map = useMap();

  useEffect(() => {
    if (person) {
      map.flyTo([person.birthplace.lat, person.birthplace.lng], 7);
    }
  }, [person]);

  return null;
}

const Map = () => {
  const [search, setSearch] = useState('');
  const [activePerson, setActivePerson] = useState(null);

  const filteredPeople = useMemo(() => {
    return FAMOUS_PEOPLE.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') {
      setSearch('');
    }
  };
  
  return (
    <div style={{ position: 'relative', height: '100vh' }}>
      {/* Search box */}
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
        backdropFilter: 'blur(6px)'
      }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="🔍 Search a famous person..."
            style={{
              width: '90%',
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
              onClick={() => setSearch('')}
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

        {search && (
            <ul className='custom-scrollbar' style={{
              listStyle: 'none',
              padding: 0,
              marginTop: 10,
              maxHeight: 200,
              overflowY: 'auto',
              borderRadius: 6,
              backgroundColor: '#111',
              border: '1px solid #333'
            }}>
              {filteredPeople.map((p, idx) => (
                <li key={idx}
                    onClick={() => setActivePerson(p)}
                    style={{
                      padding: '0.6rem 1rem',
                      cursor: 'pointer',
                      borderBottom: '1px solid #222',
                      color: '#eee',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#222'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  {p.name}
                </li>
              ))}
              {filteredPeople.length === 0 && <li style={{ padding: '0.5rem 1rem', color: '#777' }}>No results</li>}
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
              radius={2.5 + Math.sqrt(person.rating)} // adjust size based on rating
              fillColor="blue"
              color="white"
              fillOpacity={0.7}
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
          {activePerson && <FlyToPerson person={activePerson} />}
        </MapContainer>
      </div>
    </div>
  );
}

export default Map;
