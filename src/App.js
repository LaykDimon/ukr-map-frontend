import { useState } from "react";
import Map from "./Map";
import AuthModal from "./AuthModal";
import "./index.css";

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  const handleLogin = (userData) => {
    setUser(userData);
    setAuthModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <div className="App">
      <Map
        userRole={user?.role || "guest"}
        userName={user?.username}
        onLoginClick={() => setAuthModalOpen(true)}
        onLogoutClick={handleLogout}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLogin={handleLogin}
      />
    </div>
  );
}

export default App;
