import { useState } from "react";
import axios from "axios";
import "./AuthModal.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const AuthModal = ({ isOpen, onClose, onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const endpoint = isRegistering ? "/auth/register" : "/auth/login";
    const payload = isRegistering
      ? { email, password, username }
      : { email, password };

    try {
      const response = await axios.post(`${API_URL}${endpoint}`, payload);
      if (response.data.error) {
        setError(response.data.error);
        return;
      }

      const { accessToken, user } = response.data;
      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      onLogin(user);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(
        Array.isArray(msg) ? msg.join(", ") : msg || "Something went wrong",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>{isRegistering ? "Створити акаунт" : "Вхід"}</h2>
          <button className="close-x-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <div className="form-group">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          )}
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading
              ? "Processing..."
              : isRegistering
                ? "Зареєструватися"
                : "Увійти"}
          </button>
        </form>

        <div className="modal-footer">
          <button
            className="switch-btn"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError("");
            }}
            disabled={isLoading}
          >
            {isRegistering
              ? "Вже є акаунт? Увійти"
              : "Немає акаунту? Реєстрація"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
