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
      {FAMOUS_PEOPLE.map((person, idx) => (
        <CircleMarker
          key={idx}
          center={[person.birthplace.lat, person.birthplace.lng]}
          radius={Math.sqrt(person.rating) * 2} // adjust size based on rating
          fillColor="blue"
          color="white"
          fillOpacity={0.7}
        >
          <Popup>
            <b>{person.name}</b>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}

export default Map;
