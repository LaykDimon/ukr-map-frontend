import React, { useState, useEffect, FormEvent, MouseEvent } from "react";
import axios from "axios";
import "./AuthModal.css";
import { User } from "./types";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User, token: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Body scroll lock is handled via CSS class in useEffect below

  const handleSubmit = async (e: FormEvent) => {
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
      onLogin(user, accessToken);
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message
        : undefined;
      setError(
        Array.isArray(msg) ? msg.join(", ") : msg || "Something went wrong",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
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
