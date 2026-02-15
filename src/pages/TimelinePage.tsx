import React, { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchPersons } from '../store/personsSlice';
import { Person } from '../types';

const TimelinePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const persons = useAppSelector((s) => s.persons.items);
  const [selectedCentury, setSelectedCentury] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(100);

  useEffect(() => {
    if (persons.length === 0) dispatch(fetchPersons());
  }, [dispatch, persons.length]);

  const personsByYear = useMemo(() => {
    return persons
      .filter((p) => p.birthYear != null)
      .sort((a, b) => (a.birthYear ?? 0) - (b.birthYear ?? 0));
  }, [persons]);

  const centuries = useMemo(() => {
    const map = new Map<number, Person[]>();
    personsByYear.forEach((p) => {
      const century = Math.floor((p.birthYear ?? 0) / 100) + 1;
      if (!map.has(century)) map.set(century, []);
      map.get(century)!.push(p);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a - b);
  }, [personsByYear]);

  const displayedPersons = useMemo(() => {
    if (selectedCentury === null) return personsByYear;
    return personsByYear.filter((p) => {
      const century = Math.floor((p.birthYear ?? 0) / 100) + 1;
      return century === selectedCentury;
    });
  }, [selectedCentury, personsByYear]);

  return (
    <div
      style={{
        backgroundColor: '#111',
        minHeight: '100vh',
        padding: '2rem',
        color: '#eee',
      }}
    >
      <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>
        Historical Timeline
      </h1>

      {/* Century buttons */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '2rem',
        }}
      >
        <button
          onClick={() => { setSelectedCentury(null); setVisibleCount(100); }}
          style={{
            padding: '6px 14px',
            borderRadius: 6,
            border: '1px solid #555',
            backgroundColor: selectedCentury === null ? '#0088FE' : '#222',
            color: '#fff',
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          All ({personsByYear.length})
        </button>
        {centuries.map(([century, people]) => (
          <button
            key={century}
            onClick={() => { setSelectedCentury(century); setVisibleCount(100); }}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: '1px solid #555',
              backgroundColor:
                selectedCentury === century ? '#0088FE' : '#222',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            {century}th c. ({people.length})
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div
        style={{
          position: 'relative',
          maxWidth: 800,
          margin: '0 auto',
          paddingLeft: 30,
          borderLeft: '2px solid #333',
        }}
      >
        {displayedPersons.slice(0, visibleCount).map((person) => {
          const wikiUrl = person.wikiPageId
            ? `https://uk.wikipedia.org/?curid=${person.wikiPageId}`
            : null;

          return (
            <div
              key={person.id}
              style={{
                position: 'relative',
                marginBottom: 16,
                paddingLeft: 24,
              }}
            >
              {/* Dot */}
              <div
                style={{
                  position: 'absolute',
                  left: -8,
                  top: 6,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: '#0088FE',
                  border: '2px solid #111',
                }}
              />
              <div
                style={{
                  backgroundColor: '#1e1e1e',
                  border: '1px solid #333',
                  borderRadius: 8,
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                {person.imageUrl && (
                  <img
                    src={person.imageUrl}
                    alt={person.name}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 6,
                      objectFit: 'cover',
                      flexShrink: 0,
                    }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    {wikiUrl ? (
                      <a
                        href={wikiUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#4dabf7', textDecoration: 'none' }}
                      >
                        {person.name}
                      </a>
                    ) : (
                      person.name
                    )}
                  </div>
                  <div style={{ color: '#888', fontSize: 12 }}>
                    {person.birthYear}
                    {person.birthPlace && ` — ${person.birthPlace}`}
                    {person.category && (
                      <span
                        style={{
                          marginLeft: 8,
                          backgroundColor: '#333',
                          padding: '1px 6px',
                          borderRadius: 4,
                          fontSize: 11,
                        }}
                      >
                        {person.category}
                      </span>
                    )}
                  </div>
                </div>
                {person.views > 0 && (
                  <div
                    style={{
                      color: '#555',
                      fontSize: 11,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {person.views.toLocaleString()} views
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {displayedPersons.length > visibleCount && (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ color: '#666', fontSize: 13, marginBottom: 8 }}>
              Showing {visibleCount} of {displayedPersons.length} persons
            </div>
            <button
              onClick={() => setVisibleCount((c) => c + 100)}
              style={{
                padding: '8px 24px',
                borderRadius: 6,
                border: '1px solid #555',
                backgroundColor: '#222',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelinePage;
