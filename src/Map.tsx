import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { MapContainer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Person, UserRole } from './types';
import { useAppDispatch, useAppSelector } from './store/hooks';
import {
  fetchPersons,
  removePerson,
  restorePerson,
} from './store/personsSlice';
import {
  setSearch,
  setMaxCount,
  setCategory,
  setBirthPlace,
  setBirthYearRange,
  resetFilters,
} from './store/filtersSlice';
import ResetViewButton, { ukrBounds } from './components/map/ResetViewButton';
import JumpToPerson from './components/map/JumpToPerson';
import TeachingPrompt from './components/map/TeachingPrompt';
import SearchPanel from './components/map/SearchPanel';
import ClusteredMarkers from './components/map/ClusteredMarkers';
import RemovedPeoplePanel from './components/map/RemovedPeoplePanel';
import UserBar from './components/map/UserBar';
import TeacherQuestions from './components/map/TeacherQuestions';
import ExportButton from './components/map/ExportButton';
import LayerSwitcher from './components/map/LayerSwitcher';
import GeolocationButton from './components/map/GeolocationButton';
import FilterPanel from './components/map/FilterPanel';

interface MapProps {
  userRole: UserRole;
  userName?: string;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}

const MapView: React.FC<MapProps> = ({
  userRole,
  userName,
  onLoginClick,
  onLogoutClick,
}) => {
  const dispatch = useAppDispatch();
  const persons = useAppSelector((s) => s.persons.items);
  const removedIds = useAppSelector((s) => s.persons.removedIds);
  const searchResults = useAppSelector((s) => s.persons.searchResults);
  const search = useAppSelector((s) => s.filters.search);
  const maxCount = useAppSelector((s) => s.filters.maxCount);
  const category = useAppSelector((s) => s.filters.category);
  const birthPlace = useAppSelector((s) => s.filters.birthPlace);
  const birthYearRange = useAppSelector((s) => s.filters.birthYearRange);

  const [activePerson, setActivePerson] = useState<Person | null>(null);
  const [hoveredPerson, setHoveredPerson] = useState<Person | null>(null);
  const hoveredPersonRef = useRef<Person | null>(null);

  // Stable callback that updates ref (for ClusteredMarkers) and state only when needed
  const handlePersonHover = useCallback((person: Person | null) => {
    hoveredPersonRef.current = person;
    setHoveredPerson(person);
  }, []);

  const handleSearchChange = useCallback((v: string) => dispatch(setSearch(v)), [dispatch]);
  const handleMaxCountChange = useCallback((v: string) => dispatch(setMaxCount(v)), [dispatch]);

  useEffect(() => {
    dispatch(fetchPersons());
  }, [dispatch]);

  const removedPeople = useMemo(
    () => persons.filter((p) => removedIds.includes(p.id)),
    [persons, removedIds],
  );

  const filteredPeople = useMemo(() => {
    const list =
      maxCount !== 'all' ? persons.slice(0, parseInt(maxCount)) : persons;

    return list
      .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
      .filter((p) => !removedIds.includes(p.id))
      .filter((p) => (category ? p.category === category : true))
      .filter((p) =>
        birthPlace
          ? p.birthPlace?.toLowerCase().includes(birthPlace.toLowerCase())
          : true,
      )
      .filter((p) => {
        if (birthYearRange[0] != null && p.birthYear != null && p.birthYear < birthYearRange[0]) return false;
        if (birthYearRange[1] != null && p.birthYear != null && p.birthYear > birthYearRange[1]) return false;
        return true;
      })
      .sort((a, b) => b.rating - a.rating);
  }, [search, maxCount, removedIds, persons, category, birthPlace, birthYearRange]);

  // Merge fuzzy search results into map markers so they're always visible
  const displayPeople = useMemo(() => {
    if (searchResults.length === 0) return filteredPeople;
    const ids = new Set(filteredPeople.map((p) => p.id));
    const extras = searchResults
      .map((r) => r.person)
      .filter((p) => p.lat && p.lng && !ids.has(p.id));
    return extras.length > 0 ? [...filteredPeople, ...extras] : filteredPeople;
  }, [filteredPeople, searchResults]);

  const handleRemovePerson = (person: Person) => {
    dispatch(removePerson(person.id));
    setActivePerson(null);
  };

  const handleRestorePerson = (person: Person) => {
    dispatch(restorePerson(person.id));
    setActivePerson(person);
  };

  return (
    <div style={{ position: 'relative', height: '100vh' }}>
      <SearchPanel
        search={search}
        maxPeopleCount={maxCount}
        filteredPeople={filteredPeople}
        onSearchChange={handleSearchChange}
        onMaxCountChange={handleMaxCountChange}
        onPersonClick={setActivePerson}
        onPersonHover={handlePersonHover}
      />

      <UserBar
        userRole={userRole}
        userName={userName}
        onLoginClick={onLoginClick}
        onLogoutClick={onLogoutClick}
      />

      {userRole !== 'guest' && (
        <FilterPanel
          persons={persons}
          category={category}
          birthPlace={birthPlace}
          birthYearRange={birthYearRange}
          onCategoryChange={(v) => dispatch(setCategory(v))}
          onBirthPlaceChange={(v) => dispatch(setBirthPlace(v))}
          onBirthYearRangeChange={(v) => dispatch(setBirthYearRange(v))}
          onReset={() => dispatch(resetFilters())}
        />
      )}

      <div style={{ width: '100%', height: '100vh' }}>
        <MapContainer
          bounds={ukrBounds}
          style={{ height: '100vh', width: '100%' }}
        >
          <LayerSwitcher />
          <ClusteredMarkers
            people={displayPeople}
            hoveredPerson={hoveredPerson}
            userRole={userRole}
            onRemove={handleRemovePerson}
          />
          {activePerson && <JumpToPerson person={activePerson} />}
          <ResetViewButton />
          <GeolocationButton />
        </MapContainer>
      </div>

      {userRole === 'researcher' && filteredPeople.length > 0 && (
        <ExportButton data={filteredPeople} />
      )}

      {userRole === 'teacher' && <TeachingPrompt />}
      {userRole === 'teacher' && <TeacherQuestions />}

      {userRole !== 'guest' && (
        <RemovedPeoplePanel
          removedPeople={removedPeople}
          onRestore={handleRestorePerson}
        />
      )}
    </div>
  );
};

export default MapView;
