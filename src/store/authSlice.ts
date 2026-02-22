import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User, UserRole } from "../types";
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
  },
});

export const { login, logout } = authSlice.actions;
export const selectUserRole = (state: { auth: AuthState }): UserRole =>
  state.auth.user?.role || "guest";
export const selectUserName = (state: { auth: AuthState }) =>
  state.auth.user?.username;
export default authSlice.reducer;
