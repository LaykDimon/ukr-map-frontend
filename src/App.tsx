import { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MapView from "./Map";
import AuthModal from "./AuthModal";
import Navbar from "./components/Navbar";
import "./index.css";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import {
  login,
  logout,
  selectUserRole,
  selectUserName,
} from "./store/authSlice";
import { User } from "./types";
import api from "./api";
import { ThemeProvider } from "./store/themeContext";
import { isTokenExpired, msUntilExpiry } from "./store/tokenUtils";

const StatisticsPage = lazy(() => import("./pages/StatisticsPage"));
const TimelinePage = lazy(() => import("./pages/TimelinePage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));

const PageLoader = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      backgroundColor: "var(--bg-page)",
      color: "var(--text-muted)",
    }}
  >
    Loading...
  </div>
);

function App() {
  const dispatch = useAppDispatch();
  const userRole = useAppSelector(selectUserRole);
  const userName = useAppSelector(selectUserName);
  const token = useAppSelector((s) => s.auth.token);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  // Validate stored token on app init — logout if expired/invalid
  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) return;
    if (isTokenExpired(t)) {
      dispatch(logout());
      return;
    }
    api.get("/auth/profile").catch(() => {
      dispatch(logout());
    });
  }, [dispatch]);

  // Periodically check token expiry while the user is logged in.
  // Schedules a check either when the token is about to expire or every 60 s.
  useEffect(() => {
    if (!token) return;
    const check = () => {
      if (isTokenExpired(token)) {
        dispatch(logout());
      }
    };
    const remaining = msUntilExpiry(token);
    // Check every 60 s or right when the token expires, whichever is sooner
    const interval = Math.min(remaining + 1000, 60_000);
    const id = setInterval(check, interval);
    return () => clearInterval(id);
  }, [token, dispatch]);

  const handleLogin = (userData: User, token: string) => {
    dispatch(login({ user: userData, token }));
    setAuthModalOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="App">
          <Routes>
            <Route
              path="/"
              element={
                <MapView
                  userRole={userRole}
                  userName={userName}
                  onLoginClick={() => setAuthModalOpen(true)}
                  onLogoutClick={handleLogout}
                />
              }
            />
            <Route
              path="/statistics"
              element={
                <Suspense fallback={<PageLoader />}>
                  <StatisticsPage />
                </Suspense>
              }
            />
            <Route
              path="/timeline"
              element={
                <Suspense fallback={<PageLoader />}>
                  <TimelinePage />
                </Suspense>
              }
            />
            <Route
              path="/admin"
              element={
                <Suspense fallback={<PageLoader />}>
                  <AdminPage />
                </Suspense>
              }
            />
          </Routes>

          <Navbar />

          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setAuthModalOpen(false)}
            onLogin={handleLogin}
          />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
