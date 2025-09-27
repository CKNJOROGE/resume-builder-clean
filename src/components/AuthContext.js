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
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        
        setAuthToken(data.access);
        setUser(email);
        setPremium(data.premium);

        localStorage.setItem('token', data.access);
        localStorage.setItem('user', JSON.stringify(email));
        localStorage.setItem('premium', data.premium.toString());

        // --- NEW: Check for and save a pending guest resume ---
        const pendingGuestResumeId = localStorage.getItem('pendingGuestResumeId');
        if (pendingGuestResumeId) {
          const guestResumeJSON = localStorage.getItem(pendingGuestResumeId);
          if (guestResumeJSON) {
            const guestResume = JSON.parse(guestResumeJSON);
            
            // Save the guest resume to the server under the new user's account
            const saveRes = await fetch(`${process.env.REACT_APP_API_URL}/api/resumes/`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${data.access}`, // Use the new token
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                template: guestResume.template,
                title: guestResume.title.replace('Guest ', ''), // Clean up the title
                data: guestResume.data,
              }),
            });

            if (saveRes.ok) {
              const savedResume = await saveRes.json();
              // Clean up localStorage
              localStorage.removeItem(pendingGuestResumeId);
              localStorage.removeItem('pendingGuestResumeId');
              // Return success and the new, permanent resume ID
              return { success: true, resumeId: savedResume.id };
            }
          }
        }
        // End of new logic

        return { success: true, resumeId: null }; // Normal login, no guest resume found
      } else {
        console.error('Login failed:', res.status);
        return { success: false };
      }
    } catch (err) {
      console.error('Login error:', err);
      return { success: false };
    }
  };

  const signup = async (username, email, password) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/signup/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      // Return true on success to signal that we can now log the user in
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