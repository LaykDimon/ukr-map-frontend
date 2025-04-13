import React, { useState } from 'react';
import axios from 'axios';

const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLoginMode) {
        const response = await axios.post(`${apiUrl}/auth/login`, { email, password });
        const { token } = response.data;
        localStorage.setItem('jwt', token);
        onLoginSuccess();
      } else {
        try {
          await axios.post(`${apiUrl}/auth/register`, {
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password,
          });
        
          alert('Registration successful!');
          onClose();
        } catch (error) {
          console.error('Error during registration:', error.response?.data);
          alert('Registration error: ' + JSON.stringify(error.response?.data?.message || 'Unknown error'));
        }
        
      }
      onClose();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || 'Something went wrong.'));
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ width: '400px', background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)' }}>
        <h2>{isLoginMode ? 'Log In' : 'Register'}</h2>
        <form style={{ display: 'flex', flexDirection: 'column' }} onSubmit={handleSubmit}>
          {!isLoginMode && (
            <>
              <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required style={{ width: 'auto', marginBottom: '10px', padding: '10px' }} />
              <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required style={{ width: 'auto', marginBottom: '10px', padding: '10px' }} />
            </>
          )}
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: 'auto', marginBottom: '10px', padding: '10px' }} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: 'auto', marginBottom: '10px', padding: '10px' }} />
          <button type="submit" style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>{isLoginMode ? 'Log In' : 'Register'}</button>
        </form>
        <button onClick={() => setIsLoginMode(!isLoginMode)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>{isLoginMode ? 'Switch to Register' : 'Switch to Log In'}</button>
        <button onClick={onClose} style={{ width: '100%', padding: '10px' }}>Close</button>
      </div>
    </div>
  );
};

export default AuthModal;
