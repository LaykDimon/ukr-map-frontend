import { useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MapView from './Map';
import AuthModal from './AuthModal';
import Navbar from './components/Navbar';
import './index.css';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { login, logout, selectUserRole, selectUserName } from './store/authSlice';
import { User } from './types';

const StatisticsPage = lazy(() => import('./pages/StatisticsPage'));
const TimelinePage = lazy(() => import('./pages/TimelinePage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

const PageLoader = () => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '100vh', backgroundColor: '#1a1a2e', color: '#ccc',
  }}>
    Loading...
  </div>
);

function App() {
  const dispatch = useAppDispatch();
  const userRole = useAppSelector(selectUserRole);
  const userName = useAppSelector(selectUserName);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  const handleLogin = (userData: User, token: string) => {
    dispatch(login({ user: userData, token }));
    setAuthModalOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
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
          <Route path="/statistics" element={<Suspense fallback={<PageLoader />}><StatisticsPage /></Suspense>} />
          <Route path="/timeline" element={<Suspense fallback={<PageLoader />}><TimelinePage /></Suspense>} />
          <Route path="/admin" element={<Suspense fallback={<PageLoader />}><AdminPage /></Suspense>} />
        </Routes>

        <Navbar />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onLogin={handleLogin}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
