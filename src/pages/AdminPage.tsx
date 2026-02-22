import React, { useEffect, useState, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { fetchPersons } from "../store/personsSlice";
import { personsApi, proposedEditsApi, CreatePersonPayload } from "../api";
import api from "../api";
import { Person, ProposedEdit, ProposedEditStatus } from "../types";
import { isTokenExpired } from "../store/tokenUtils";

interface ImportLog {
  id: number;
  sourceUrl: string;
  recordsProcessed: number;
  status: string;
  message: string | null;
  importedAt: string;
}

const emptyForm: CreatePersonPayload = {
  name: "",
  summary: "",
  birthYear: undefined,
  birthDate: "",
  birthPlace: "",
  lat: undefined,
  lng: undefined,
  imageUrl: "",
  category: "",
  isManual: true,
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "var(--bg-card)",
  borderRadius: 10,
  padding: "1.25rem",
  border: "1px solid var(--border-primary)",
  maxWidth: 900,
  margin: "0 auto 2rem",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "6px 10px",
  borderRadius: 4,
  border: "1px solid var(--border-secondary)",
  backgroundColor: "var(--bg-input)",
  color: "var(--text-primary)",
  fontSize: 13,
  boxSizing: "border-box",
};

const btnPrimary: React.CSSProperties = {
  padding: "6px 16px",
  borderRadius: 6,
  border: "1px solid var(--accent)",
  backgroundColor: "var(--accent)",
  color: "#fff",
  cursor: "pointer",
  fontSize: 13,
};

const btnDanger: React.CSSProperties = {
  padding: "4px 10px",
  borderRadius: 4,
  border: "1px solid var(--danger)",
  backgroundColor: "transparent",
  color: "var(--danger)",
  cursor: "pointer",
  fontSize: 12,
};

const btnSecondary: React.CSSProperties = {
  padding: "6px 16px",
  borderRadius: 6,
  border: "1px solid var(--border-tertiary)",
  backgroundColor: "transparent",
  color: "var(--text-secondary)",
  cursor: "pointer",
  fontSize: 13,
};

const PERSONS_PAGE_SIZE = 20;
const LOGS_PAGE_SIZE = 10;

const AdminPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const userRole = useAppSelector((s) => s.auth.user?.role);
  const token = useAppSelector((s) => s.auth.token);
  const persons = useAppSelector((s) => s.persons.items);

  const [logs, setLogs] = useState<ImportLog[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [forceRefresh, setForceRefresh] = useState(false);

  // Proposed edits state
  const [proposedEdits, setProposedEdits] = useState<ProposedEdit[]>([]);
  const [editsFilter, setEditsFilter] = useState<ProposedEditStatus | "">(
    "pending",
  );
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewComment, setReviewComment] = useState("");

  // CRUD state
  const [filterText, setFilterText] = useState("");
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<CreatePersonPayload>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [personsPage, setPersonsPage] = useState(0);
  const [logsPage, setLogsPage] = useState(0);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const loadProposedEdits = useCallback((status?: ProposedEditStatus) => {
    proposedEditsApi
      .getAll(status)
      .then((res) => setProposedEdits(res.data))
      .catch((err) => console.error("Failed to load proposed edits:", err));
  }, []);

  useEffect(() => {
    if (userRole !== "admin" || !token) return;
    dispatch(fetchPersons());
    api
      .get("/import-logs")
      .then((res) => setLogs(res.data))
      .catch((err) => console.error("Failed to load import logs:", err));
    loadProposedEdits(editsFilter || undefined);
  }, [userRole, token, dispatch, loadProposedEdits, editsFilter]);

  // Lock body scroll while form modal is open
  useEffect(() => {
    if (formOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [formOpen]);

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await api.post("/wikipedia/sync", null, {
        params: forceRefresh ? { forceRefresh: true } : {},
      });
      setSyncResult(`Sync completed: ${JSON.stringify(res.data)}`);
      dispatch(fetchPersons());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setSyncResult(`Sync failed: ${msg}`);
    } finally {
      setSyncing(false);
    }
  };

  const openCreateForm = () => {
    setEditingPerson(null);
    setForm({ ...emptyForm });
    setFormError(null);
    setFormOpen(true);
  };

  const openEditForm = (person: Person) => {
    setEditingPerson(person);
    setForm({
      name: person.name,
      summary: person.summary || "",
      birthYear: person.birthYear,
      birthDate: person.birthDate || "",
      birthPlace: person.birthPlace || "",
      lat: person.lat,
      lng: person.lng,
      imageUrl: person.imageUrl || "",
      category: person.category || "",
      isManual: person.isManual ?? false,
    });
    setFormError(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingPerson(null);
    setFormError(null);
  };

  const handleFormChange = useCallback(
    (
      field: keyof CreatePersonPayload,
      value: string | number | boolean | undefined,
    ) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleSave = async () => {
    if (!form.name.trim()) {
      setFormError("Name is required.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const payload: CreatePersonPayload = {
        ...form,
        name: form.name.trim(),
        birthYear: form.birthYear || undefined,
        lat: form.lat || undefined,
        lng: form.lng || undefined,
      };
      if (editingPerson) {
        await personsApi.update(editingPerson.id, payload);
      } else {
        await personsApi.create(payload);
      }
      dispatch(fetchPersons());
      closeForm();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed";
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleReview = async (id: string, action: "approve" | "reject") => {
    try {
      await proposedEditsApi.review(
        id,
        action,
        reviewComment.trim() || undefined,
      );
      setReviewingId(null);
      setReviewComment("");
      loadProposedEdits(editsFilter || undefined);
      if (action === "approve") dispatch(fetchPersons());
    } catch (err) {
      console.error("Review failed:", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await personsApi.remove(id);
      dispatch(fetchPersons());
      setDeleteConfirmId(null);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const filteredPersons = persons.filter((p) =>
    p.name.toLowerCase().includes(filterText.toLowerCase()),
  );

  if (userRole !== "admin" || isTokenExpired(token)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div
      style={{
        backgroundColor: "var(--bg-page)",
        minHeight: "100vh",
        padding: "2rem",
        color: "var(--text-primary)",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>Admin Panel</h1>

      {/* Wikipedia Sync */}
      <div style={{ ...cardStyle, maxWidth: 600 }}>
        <h3 style={{ marginTop: 0 }}>Wikipedia Sync</h3>
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
          Trigger a sync from Wikipedia to update the persons database.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button
            onClick={handleSync}
            disabled={syncing}
            style={{
              ...btnPrimary,
              backgroundColor: syncing ? "var(--bg-hover)" : "var(--accent)",
              cursor: syncing ? "wait" : "pointer",
            }}
          >
            {syncing ? "Syncing..." : "Start Sync"}
          </button>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              color: "var(--text-tertiary)",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            <input
              type="checkbox"
              checked={forceRefresh}
              onChange={(e) => setForceRefresh(e.target.checked)}
            />
            Force refresh
          </label>
        </div>
        {syncResult && (
          <div
            style={{
              marginTop: 12,
              padding: "0.5rem",
              backgroundColor: "var(--bg-input)",
              borderRadius: 4,
              fontSize: 13,
              color: syncResult.includes("failed")
                ? "var(--danger)"
                : "var(--success)",
            }}
          >
            {syncResult}
          </div>
        )}
      </div>

      {/* Persons Management */}
      <div style={cardStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <h3 style={{ margin: 0 }}>Persons ({persons.length})</h3>
          <button onClick={openCreateForm} style={btnPrimary}>
            + Add Person
          </button>
        </div>

        <input
          type="text"
          placeholder="Filter by name..."
          value={filterText}
          onChange={(e) => {
            setFilterText(e.target.value);
            setPersonsPage(0);
          }}
          style={{ ...inputStyle, marginBottom: 12, maxWidth: 300 }}
        />

        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid var(--border-secondary)",
                  textAlign: "left",
                }}
              >
                <th style={{ padding: "8px 6px", color: "var(--text-muted)" }}>
                  Name
                </th>
                <th style={{ padding: "8px 6px", color: "var(--text-muted)" }}>
                  Category
                </th>
                <th style={{ padding: "8px 6px", color: "var(--text-muted)" }}>
                  Birth Year
                </th>
                <th style={{ padding: "8px 6px", color: "var(--text-muted)" }}>
                  Birth Place
                </th>
                <th
                  style={{
                    padding: "8px 6px",
                    color: "var(--text-muted)",
                    width: 100,
                  }}
                ></th>
              </tr>
            </thead>
            <tbody>
              {filteredPersons
                .slice(
                  personsPage * PERSONS_PAGE_SIZE,
                  (personsPage + 1) * PERSONS_PAGE_SIZE,
                )
                .map((p) => {
                  const isHovered = hoveredRow === p.id;
                  return (
                    <tr
                      key={p.id}
                      style={{ borderBottom: "1px solid var(--border-faint)" }}
                      onMouseEnter={() => setHoveredRow(p.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <td
                        style={{
                          padding: "8px 6px",
                          maxWidth: 220,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {p.name}
                      </td>
                      <td
                        style={{
                          padding: "8px 6px",
                          color: "var(--text-tertiary)",
                        }}
                      >
                        {p.category || "—"}
                      </td>
                      <td
                        style={{
                          padding: "8px 6px",
                          color: "var(--text-tertiary)",
                        }}
                      >
                        {p.birthYear ?? "—"}
                      </td>
                      <td
                        style={{
                          padding: "8px 6px",
                          color: "var(--text-tertiary)",
                          maxWidth: 180,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {p.birthPlace || "—"}
                      </td>
                      <td style={{ padding: "8px 6px", whiteSpace: "nowrap" }}>
                        <span
                          style={{
                            visibility: isHovered ? "visible" : "hidden",
                          }}
                        >
                          <button
                            onClick={() => openEditForm(p)}
                            style={{
                              ...btnSecondary,
                              padding: "3px 8px",
                              fontSize: 11,
                              marginRight: 4,
                            }}
                          >
                            Edit
                          </button>
                          {deleteConfirmId === p.id ? (
                            <>
                              <button
                                onClick={() => handleDelete(p.id)}
                                style={{
                                  ...btnDanger,
                                  backgroundColor: "var(--danger)",
                                  color: "#fff",
                                  padding: "3px 8px",
                                  fontSize: 11,
                                  marginRight: 4,
                                }}
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                style={{
                                  ...btnSecondary,
                                  padding: "3px 8px",
                                  fontSize: 11,
                                }}
                              >
                                No
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(p.id)}
                              style={{
                                ...btnDanger,
                                padding: "3px 8px",
                                fontSize: 11,
                              }}
                            >
                              Delete
                            </button>
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        {filteredPersons.length > PERSONS_PAGE_SIZE && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              marginTop: 12,
            }}
          >
            <button
              onClick={() => setPersonsPage((p) => Math.max(0, p - 1))}
              disabled={personsPage === 0}
              style={{
                ...btnSecondary,
                padding: "4px 12px",
                fontSize: 12,
                opacity: personsPage === 0 ? 0.4 : 1,
              }}
            >
              Prev
            </button>
            <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
              Page {personsPage + 1} of{" "}
              {Math.ceil(filteredPersons.length / PERSONS_PAGE_SIZE)} (
              {filteredPersons.length} total)
            </span>
            <button
              onClick={() =>
                setPersonsPage((p) =>
                  Math.min(
                    Math.ceil(filteredPersons.length / PERSONS_PAGE_SIZE) - 1,
                    p + 1,
                  ),
                )
              }
              disabled={
                personsPage >=
                Math.ceil(filteredPersons.length / PERSONS_PAGE_SIZE) - 1
              }
              style={{
                ...btnSecondary,
                padding: "4px 12px",
                fontSize: 12,
                opacity:
                  personsPage >=
                  Math.ceil(filteredPersons.length / PERSONS_PAGE_SIZE) - 1
                    ? 0.4
                    : 1,
              }}
            >
              Next
            </button>
          </div>
        )}
        {filteredPersons.length === 0 && (
          <p
            style={{
              color: "var(--text-faint)",
              textAlign: "center",
              padding: "1rem 0",
            }}
          >
            No persons found.
          </p>
        )}
      </div>

      {/* Create/Edit Form Modal */}
      {formOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "var(--overlay-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            overflowY: "auto",
          }}
        >
          <div
            style={{
              backgroundColor: "var(--bg-card)",
              borderRadius: 10,
              padding: "1.5rem",
              border: "1px solid var(--border-secondary)",
              width: "100%",
              maxWidth: 520,
              maxHeight: "90vh",
              overflowY: "auto",
              overscrollBehavior: "contain",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0 }}>
              {editingPerson ? `Edit: ${editingPerson.name}` : "Add New Person"}
            </h3>

            <div style={{ display: "grid", gap: 12 }}>
              <label style={{ fontSize: 13 }}>
                Name *
                <input
                  style={inputStyle}
                  value={form.name}
                  onChange={(e) => handleFormChange("name", e.target.value)}
                />
              </label>

              <label style={{ fontSize: 13 }}>
                Category
                <input
                  style={inputStyle}
                  value={form.category || ""}
                  placeholder="e.g. writer, scientist, politician"
                  onChange={(e) => handleFormChange("category", e.target.value)}
                />
              </label>

              <label style={{ fontSize: 13 }}>
                Summary
                <textarea
                  style={{ ...inputStyle, minHeight: 60, resize: "vertical" }}
                  value={form.summary || ""}
                  onChange={(e) => handleFormChange("summary", e.target.value)}
                />
              </label>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <label style={{ fontSize: 13 }}>
                  Birth Year
                  <input
                    type="number"
                    style={inputStyle}
                    value={form.birthYear ?? ""}
                    onChange={(e) =>
                      handleFormChange(
                        "birthYear",
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                  />
                </label>
                <label style={{ fontSize: 13 }}>
                  Birth Date
                  <input
                    style={inputStyle}
                    placeholder="e.g. 1814-03-09"
                    value={form.birthDate || ""}
                    onChange={(e) =>
                      handleFormChange("birthDate", e.target.value)
                    }
                  />
                </label>
              </div>

              <label style={{ fontSize: 13 }}>
                Birth Place
                <input
                  style={inputStyle}
                  value={form.birthPlace || ""}
                  onChange={(e) =>
                    handleFormChange("birthPlace", e.target.value)
                  }
                />
              </label>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <label style={{ fontSize: 13 }}>
                  Latitude
                  <input
                    type="number"
                    step="any"
                    style={inputStyle}
                    value={form.lat ?? ""}
                    onChange={(e) =>
                      handleFormChange(
                        "lat",
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                  />
                </label>
                <label style={{ fontSize: 13 }}>
                  Longitude
                  <input
                    type="number"
                    step="any"
                    style={inputStyle}
                    value={form.lng ?? ""}
                    onChange={(e) =>
                      handleFormChange(
                        "lng",
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                  />
                </label>
              </div>

              <label style={{ fontSize: 13 }}>
                Image URL
                <input
                  style={inputStyle}
                  value={form.imageUrl || ""}
                  onChange={(e) => handleFormChange("imageUrl", e.target.value)}
                />
              </label>
            </div>

            {formError && (
              <div
                style={{ color: "var(--danger)", fontSize: 13, marginTop: 12 }}
              >
                {formError}
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 16,
                justifyContent: "flex-end",
              }}
            >
              <button onClick={closeForm} style={btnSecondary}>
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  ...btnPrimary,
                  backgroundColor: saving ? "var(--bg-hover)" : "var(--accent)",
                  cursor: saving ? "wait" : "pointer",
                }}
              >
                {saving ? "Saving..." : editingPerson ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Proposed Edits Moderation */}
      <div style={cardStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <h3 style={{ margin: 0 }}>Proposed Edits</h3>
          <select
            value={editsFilter}
            onChange={(e) =>
              setEditsFilter(e.target.value as ProposedEditStatus | "")
            }
            style={{
              ...inputStyle,
              width: "auto",
              padding: "4px 8px",
            }}
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="">All</option>
          </select>
        </div>

        {proposedEdits.length === 0 ? (
          <p
            style={{
              color: "var(--text-faint)",
              textAlign: "center",
              padding: "1rem 0",
            }}
          >
            No proposed edits
            {editsFilter ? ` with status "${editsFilter}"` : ""}.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {proposedEdits.map((edit) => (
              <div
                key={edit.id}
                style={{
                  backgroundColor: "var(--bg-input)",
                  borderRadius: 8,
                  padding: "1rem",
                  border: `1px solid ${
                    edit.status === "pending"
                      ? "#555"
                      : edit.status === "approved"
                        ? "rgba(0, 196, 159, 0.3)"
                        : "rgba(255, 75, 75, 0.3)"
                  }`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 8,
                  }}
                >
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>
                      {edit.person
                        ? edit.person.name
                        : `Person #${edit.personId.slice(0, 8)}...`}
                    </span>
                    <span
                      style={{
                        marginLeft: 8,
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontSize: 11,
                        backgroundColor:
                          edit.status === "pending"
                            ? "rgba(243, 156, 18, 0.15)"
                            : edit.status === "approved"
                              ? "rgba(0, 196, 159, 0.15)"
                              : "rgba(255, 75, 75, 0.15)",
                        color:
                          edit.status === "pending"
                            ? "#f39c12"
                            : edit.status === "approved"
                              ? "#00C49F"
                              : "#ff4b4b",
                      }}
                    >
                      {edit.status}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--text-faint)" }}>
                    {new Date(edit.createdAt).toLocaleString()}
                  </span>
                </div>

                {edit.user && (
                  <p
                    style={{
                      margin: "0 0 8px",
                      fontSize: 12,
                      color: "var(--text-muted)",
                    }}
                  >
                    By: {edit.user.username} ({edit.user.email})
                  </p>
                )}

                {edit.comment && (
                  <p
                    style={{
                      margin: "0 0 8px",
                      fontSize: 12,
                      color: "var(--text-tertiary)",
                      fontStyle: "italic",
                    }}
                  >
                    "{edit.comment}"
                  </p>
                )}

                <div style={{ fontSize: 12 }}>
                  <strong style={{ color: "var(--text-muted)" }}>
                    Changes:
                  </strong>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      marginTop: 4,
                      fontSize: 12,
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          borderBottom: "1px solid var(--border-primary)",
                        }}
                      >
                        <th
                          style={{
                            padding: "4px 6px",
                            color: "var(--text-faint)",
                            textAlign: "left",
                          }}
                        >
                          Field
                        </th>
                        <th
                          style={{
                            padding: "4px 6px",
                            color: "var(--text-faint)",
                            textAlign: "left",
                          }}
                        >
                          Old
                        </th>
                        <th
                          style={{
                            padding: "4px 6px",
                            color: "var(--text-faint)",
                            textAlign: "left",
                          }}
                        >
                          New
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(edit.changes).map(
                        ([field, { old: oldVal, new: newVal }]) => (
                          <tr
                            key={field}
                            style={{
                              borderBottom: "1px solid var(--border-faint)",
                            }}
                          >
                            <td
                              style={{
                                padding: "4px 6px",
                                color: "var(--text-tertiary)",
                              }}
                            >
                              {field}
                            </td>
                            <td
                              style={{
                                padding: "4px 6px",
                                color: "var(--danger)",
                                maxWidth: 200,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {oldVal != null ? String(oldVal) : "—"}
                            </td>
                            <td
                              style={{
                                padding: "4px 6px",
                                color: "var(--success)",
                                maxWidth: 200,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {newVal != null ? String(newVal) : "—"}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>

                {edit.status === "pending" && (
                  <div style={{ marginTop: 10 }}>
                    {reviewingId === edit.id ? (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        <input
                          type="text"
                          placeholder="Review comment (optional)"
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          style={{ ...inputStyle, maxWidth: 400 }}
                        />
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => handleReview(edit.id, "approve")}
                            style={{
                              ...btnPrimary,
                              padding: "4px 12px",
                              fontSize: 12,
                              backgroundColor: "var(--success)",
                              borderColor: "var(--success)",
                            }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReview(edit.id, "reject")}
                            style={{ ...btnDanger, padding: "4px 12px" }}
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => {
                              setReviewingId(null);
                              setReviewComment("");
                            }}
                            style={{
                              ...btnSecondary,
                              padding: "4px 12px",
                              fontSize: 12,
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReviewingId(edit.id)}
                        style={{
                          ...btnPrimary,
                          padding: "4px 12px",
                          fontSize: 12,
                        }}
                      >
                        Review
                      </button>
                    )}
                  </div>
                )}

                {edit.reviewComment && edit.status !== "pending" && (
                  <p
                    style={{
                      margin: "8px 0 0",
                      fontSize: 12,
                      color: "var(--text-muted)",
                    }}
                  >
                    Review comment: {edit.reviewComment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Import Logs */}
      <div style={cardStyle}>
        <h3 style={{ marginTop: 0 }}>Import Logs</h3>
        {logs.length === 0 ? (
          <p style={{ color: "var(--text-faint)" }}>No import logs yet.</p>
        ) : (
          <>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid var(--border-secondary)",
                    textAlign: "left",
                  }}
                >
                  <th
                    style={{ padding: "8px 6px", color: "var(--text-muted)" }}
                  >
                    Date
                  </th>
                  <th
                    style={{ padding: "8px 6px", color: "var(--text-muted)" }}
                  >
                    Source
                  </th>
                  <th
                    style={{ padding: "8px 6px", color: "var(--text-muted)" }}
                  >
                    Count
                  </th>
                  <th
                    style={{ padding: "8px 6px", color: "var(--text-muted)" }}
                  >
                    Status
                  </th>
                  <th
                    style={{ padding: "8px 6px", color: "var(--text-muted)" }}
                  >
                    Message
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs
                  .slice(
                    logsPage * LOGS_PAGE_SIZE,
                    (logsPage + 1) * LOGS_PAGE_SIZE,
                  )
                  .map((log) => (
                    <tr
                      key={log.id}
                      style={{ borderBottom: "1px solid var(--border-faint)" }}
                    >
                      <td style={{ padding: "8px 6px", whiteSpace: "nowrap" }}>
                        {new Date(log.importedAt).toLocaleString()}
                      </td>
                      <td
                        style={{
                          padding: "8px 6px",
                          maxWidth: 200,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {log.sourceUrl}
                      </td>
                      <td style={{ padding: "8px 6px" }}>
                        {log.recordsProcessed}
                      </td>
                      <td style={{ padding: "8px 6px" }}>
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: 4,
                            fontSize: 11,
                            backgroundColor:
                              log.status === "success"
                                ? "rgba(0, 196, 159, 0.15)"
                                : "rgba(255, 75, 75, 0.15)",
                            color:
                              log.status === "success" ? "#00C49F" : "#ff4b4b",
                          }}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "8px 6px",
                          color: "var(--text-faint)",
                          maxWidth: 200,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {log.message || "—"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {logs.length > LOGS_PAGE_SIZE && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  marginTop: 12,
                }}
              >
                <button
                  onClick={() => setLogsPage((p) => Math.max(0, p - 1))}
                  disabled={logsPage === 0}
                  style={{
                    ...btnSecondary,
                    padding: "4px 12px",
                    fontSize: 12,
                    opacity: logsPage === 0 ? 0.4 : 1,
                  }}
                >
                  Prev
                </button>
                <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
                  Page {logsPage + 1} of{" "}
                  {Math.ceil(logs.length / LOGS_PAGE_SIZE)} ({logs.length}{" "}
                  total)
                </span>
                <button
                  onClick={() =>
                    setLogsPage((p) =>
                      Math.min(
                        Math.ceil(logs.length / LOGS_PAGE_SIZE) - 1,
                        p + 1,
                      ),
                    )
                  }
                  disabled={
                    logsPage >= Math.ceil(logs.length / LOGS_PAGE_SIZE) - 1
                  }
                  style={{
                    ...btnSecondary,
                    padding: "4px 12px",
                    fontSize: 12,
                    opacity:
                      logsPage >= Math.ceil(logs.length / LOGS_PAGE_SIZE) - 1
                        ? 0.4
                        : 1,
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
