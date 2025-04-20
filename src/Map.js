import { MapContainer, TileLayer, Popup, CircleMarker } from 'react-leaflet';
import { FAMOUS_PEOPLE } from './const';
import 'leaflet/dist/leaflet.css';

const ukrBounds = [[44, 22], [53, 40]]; // lat/lng bounds of Ukraine

const Map = () => {
  return (
    <MapContainer bounds={ukrBounds} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      {FAMOUS_PEOPLE.map((person, idx) => {
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
    </MapContainer>
  );
}

export default Map;
