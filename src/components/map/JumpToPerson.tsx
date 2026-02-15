import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { Person } from '../../types';

interface JumpToPersonProps {
  person: Person;
}

const JumpToPerson: React.FC<JumpToPersonProps> = ({ person }) => {
  const map = useMap();

  useEffect(() => {
    if (person && person.lat && person.lng) {
      map.flyTo([person.lat, person.lng], 7);
    }
  }, [person, map]);

  return null;
};

export default JumpToPerson;
