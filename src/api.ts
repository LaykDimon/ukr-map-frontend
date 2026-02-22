import axios from "axios";
import { Person, ProposedEdit, ProposedEditStatus } from "./types";
import { isTokenExpired } from "./store/tokenUtils";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

/** Lazy import to avoid circular dependency (store → api → store). */
let _store: any = null;
function getStore() {
  if (!_store) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    _store = require("./store").store;
  }
  return _store;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    // If the token has expired, proactively log out instead of sending a
    // doomed request that would return 401 anyway.
    if (isTokenExpired(token)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      try {
        const { logout } = require("./store/authSlice");
        getStore().dispatch(logout());
      } catch {
        /* store not ready yet */
      }
      return Promise.reject(
        new axios.Cancel("Session expired. Please log in again."),
      );
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      try {
        const { logout } = require("./store/authSlice");
        getStore().dispatch(logout());
      } catch {
        /* store not ready yet – fall back to reload */
        window.location.reload();
      }
    }
    return Promise.reject(error);
  },
);

export interface SearchResult {
  person: Person;
  similarity?: number;
  rank?: number;
}

export interface CreatePersonPayload {
  name: string;
  summary?: string;
  birthYear?: number;
  birthDate?: string;
  birthPlace?: string;
  lat?: number;
  lng?: number;
  imageUrl?: string;
  category?: string;
  isManual?: boolean;
}

export const personsApi = {
  getAll: () => api.get<Person[]>("/wikipedia/famous-people"),
  getPage: (offset: number, limit: number) =>
    api.get<Person[]>("/wikipedia/famous-people", {
      params: { offset, limit },
    }),
  getOne: (id: string) => api.get<Person>(`/persons/${id}`),
  create: (data: CreatePersonPayload) => api.post<Person>("/persons", data),
  update: (id: string, data: Partial<CreatePersonPayload>) =>
    api.put<Person>(`/persons/${id}`, data),
  remove: (id: string) => api.delete(`/persons/${id}`),
  search: (q: string, type = "combined", limit = 20) =>
    api.get<SearchResult[]>("/persons/search", {
      params: { q, type, limit },
    }),
  geoRadius: (lat: number, lng: number, radius: number, limit = 100) =>
    api.get<Person[]>("/persons/geo/radius", {
      params: { lat, lng, radius, limit },
    }),
};

export interface TemporalEntry {
  decade: number;
  count: number;
}
export interface GeoEntry {
  birthPlace: string;
  count: number;
}
export interface CategoryEntry {
  category: string;
  count: number;
}
export interface OverviewData {
  totalPersons: number;
  totalWithCoordinates: number;
  totalCategories: number;
  minBirthYear: number;
  maxBirthYear: number;
  avgRating: number;
}

export const statisticsApi = {
  temporal: () => api.get<TemporalEntry[]>("/statistics/temporal"),
  geo: (limit = 20) =>
    api.get<GeoEntry[]>("/statistics/geo", { params: { limit } }),
  categories: () => api.get<CategoryEntry[]>("/statistics/categories"),
  overview: () => api.get<OverviewData>("/statistics/overview"),
};

export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  register: (email: string, password: string, username: string) =>
    api.post("/auth/register", { email, password, username }),
};

export const proposedEditsApi = {
  create: (data: {
    personId: string;
    changes: Record<string, { old: any; new: any }>;
    comment?: string;
  }) => api.post<ProposedEdit>("/proposed-edits", data),
  getMine: () => api.get<ProposedEdit[]>("/proposed-edits/my"),
  getAll: (status?: ProposedEditStatus) =>
    api.get<ProposedEdit[]>("/proposed-edits", {
      params: status ? { status } : {},
    }),
  getOne: (id: string) => api.get<ProposedEdit>(`/proposed-edits/${id}`),
  review: (id: string, action: "approve" | "reject", reviewComment?: string) =>
    api.post<ProposedEdit>(`/proposed-edits/${id}/review`, {
      action,
      reviewComment,
    }),
};

export default api;
