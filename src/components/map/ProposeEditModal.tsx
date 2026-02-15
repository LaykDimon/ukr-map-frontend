import React, { useState } from 'react';
import { Person } from '../../types';
import { proposedEditsApi } from '../../api';

interface ProposeEditModalProps {
  person: Person;
  onClose: () => void;
}

const editableFields: { key: keyof Person; label: string; type: 'text' | 'number' }[] = [
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'summary', label: 'Summary', type: 'text' },
  { key: 'birthDate', label: 'Birth Date', type: 'text' },
  { key: 'birthYear', label: 'Birth Year', type: 'number' },
  { key: 'birthPlace', label: 'Birth Place', type: 'text' },
  { key: 'lat', label: 'Latitude', type: 'number' },
  { key: 'lng', label: 'Longitude', type: 'number' },
  { key: 'category', label: 'Category', type: 'text' },
  { key: 'imageUrl', label: 'Image URL', type: 'text' },
];

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '5px 8px',
  borderRadius: 4,
  border: '1px solid #444',
  backgroundColor: '#222',
  color: '#eee',
  fontSize: 12,
  boxSizing: 'border-box',
};

const ProposeEditModal: React.FC<ProposeEditModalProps> = ({ person, onClose }) => {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const f of editableFields) {
      init[f.key] = person[f.key] != null ? String(person[f.key]) : '';
    }
    return init;
  });
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    const changes: Record<string, { old: any; new: any }> = {};
    for (const f of editableFields) {
      const oldVal = person[f.key] != null ? String(person[f.key]) : '';
      const newVal = values[f.key] || '';
      if (oldVal !== newVal) {
        const parsedOld = f.type === 'number' && oldVal ? Number(oldVal) : oldVal || null;
        const parsedNew = f.type === 'number' && newVal ? Number(newVal) : newVal || null;
        changes[f.key] = { old: parsedOld, new: parsedNew };
      }
    }

    if (Object.keys(changes).length === 0) {
      setError('No changes detected. Modify at least one field.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await proposedEditsApi.create({
        personId: person.id,
        changes,
        comment: comment.trim() || undefined,
      });
      setSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
        }}
        onClick={onClose}
      >
        <div
          style={{
            backgroundColor: '#1e1e1e',
            borderRadius: 10,
            padding: '1.5rem',
            border: '1px solid #444',
            maxWidth: 400,
            textAlign: 'center',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <p style={{ color: '#00C49F', fontSize: 16, margin: '0 0 12px' }}>
            Edit proposed successfully!
          </p>
          <p style={{ color: '#888', fontSize: 13, margin: '0 0 16px' }}>
            An admin will review your suggestion.
          </p>
          <button
            onClick={onClose}
            style={{
              padding: '6px 20px',
              borderRadius: 6,
              border: '1px solid #0088FE',
              backgroundColor: '#0088FE',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            OK
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: '#1e1e1e',
          borderRadius: 10,
          padding: '1.5rem',
          border: '1px solid #444',
          width: '100%',
          maxWidth: 480,
          maxHeight: '90vh',
          overflowY: 'auto',
          color: '#eee',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginTop: 0, marginBottom: 4 }}>Propose Edit</h3>
        <p style={{ color: '#888', fontSize: 12, marginTop: 0, marginBottom: 16 }}>
          Suggest changes to <strong>{person.name}</strong>. Only modified fields will be submitted.
        </p>

        <div style={{ display: 'grid', gap: 10 }}>
          {editableFields.map((f) => (
            <label key={f.key} style={{ fontSize: 12 }}>
              <span style={{ color: '#aaa' }}>{f.label}</span>
              {f.key === 'summary' ? (
                <textarea
                  style={{ ...inputStyle, minHeight: 50, resize: 'vertical' }}
                  value={values[f.key]}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [f.key]: e.target.value }))
                  }
                />
              ) : (
                <input
                  type={f.type === 'number' ? 'number' : 'text'}
                  step={f.type === 'number' ? 'any' : undefined}
                  style={inputStyle}
                  value={values[f.key]}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [f.key]: e.target.value }))
                  }
                />
              )}
            </label>
          ))}

          <label style={{ fontSize: 12 }}>
            <span style={{ color: '#aaa' }}>Comment (optional)</span>
            <textarea
              style={{ ...inputStyle, minHeight: 40, resize: 'vertical' }}
              placeholder="Why are you suggesting this change?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </label>
        </div>

        {error && (
          <div style={{ color: '#ff4b4b', fontSize: 12, marginTop: 10 }}>
            {error}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            gap: 10,
            marginTop: 16,
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '6px 16px',
              borderRadius: 6,
              border: '1px solid #555',
              backgroundColor: 'transparent',
              color: '#ccc',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              padding: '6px 16px',
              borderRadius: 6,
              border: '1px solid #0088FE',
              backgroundColor: submitting ? '#333' : '#0088FE',
              color: '#fff',
              cursor: submitting ? 'wait' : 'pointer',
              fontSize: 13,
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Proposal'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProposeEditModal;
