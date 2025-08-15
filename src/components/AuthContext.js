import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
      return localStorage.getItem('user') || null;
    }
  });
  const [premium, setPremium] = useState(() => {
    return localStorage.getItem('premium') === 'true';
  });

  const login = async (email, password) => {
    try {
      const res = await fetch('${process.env.REACT_APP_API_URL}/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log('Login successful:', data);

        setAuthToken(data.access);
        setUser(email);
        setPremium(data.premium);

        localStorage.setItem('token', data.access);
        localStorage.setItem('user', JSON.stringify(email));
        localStorage.setItem('premium', data.premium.toString());

        return true;
      } else {
        console.error('Login failed:', res.status);
        return false;
      }
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  const signup = async (username, email, password) => {
    try {
      const res = await fetch('${process.env.REACT_APP_API_URL}/api/signup/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      return res.ok;
    } catch (err) {
      console.error('Signup error:', err);
      return false;
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    setPremium(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('premium');
  };

  return (
    <AuthContext.Provider value={{ authToken, user, premium, login, logout, signup, setPremium }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);
