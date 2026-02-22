import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User, UserRole, UserPersona } from "../types";
import { isTokenExpired } from "./tokenUtils";

interface AuthState {
  user: User | null;
  token: string | null;
}

const storedToken = localStorage.getItem("token");

// Clear stale localStorage if the token has expired
if (isTokenExpired(storedToken)) {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
}

const initialState: AuthState = {
  user: isTokenExpired(storedToken)
    ? null
    : JSON.parse(localStorage.getItem("user") || "null"),
  token: isTokenExpired(storedToken) ? null : storedToken,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action: PayloadAction<{ user: User; token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem("token", action.payload.token);
    },
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
    updatePersona(state, action: PayloadAction<UserPersona>) {
      if (state.user) {
        state.user.persona = action.payload;
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },
  },
});

export const { login, logout, updatePersona } = authSlice.actions;

/**
 * Returns the user's persona for feature-gating on the map.
 * Admin users get their persona too — 'admin' only controls admin-panel access.
 * Not logged in → 'guest'.
 */
export const selectUserRole = (state: { auth: AuthState }): UserRole => {
  const user = state.auth.user;
  if (!user) return "guest";
  return user.persona || "guest";
};

/** Whether the current user has admin-panel access. */
export const selectIsAdmin = (state: { auth: AuthState }): boolean => {
  return state.auth.user?.role === "admin";
};

export const selectUserName = (state: { auth: AuthState }) =>
  state.auth.user?.username;
export default authSlice.reducer;
