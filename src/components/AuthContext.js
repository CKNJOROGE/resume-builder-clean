import React, { createContext, useState, useContext } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('token'));
  
  // The user state now holds an object with user details, including credits
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
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
        
        // Create a user object with the email and new credits value from the backend
        const userData = {
          email: email,
          credits: data.credits,
        };

        setAuthToken(data.access);
        setUser(userData);

        localStorage.setItem('token', data.access);
        localStorage.setItem('user', JSON.stringify(userData)); // Store the entire user object

        // Guest resume migration logic remains the same
        const pendingGuestResumeId = localStorage.getItem('pendingGuestResumeId');
        if (pendingGuestResumeId) {
          const guestResumeJSON = localStorage.getItem(pendingGuestResumeId);
          if (guestResumeJSON) {
            const guestResume = JSON.parse(guestResumeJSON);
            
            const saveRes = await fetch(`${process.env.REACT_APP_API_URL}/api/resumes/`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${data.access}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                template: guestResume.template,
                title: guestResume.title.replace('Guest ', ''),
                data: guestResume.data,
              }),
            });

            if (saveRes.ok) {
              const savedResume = await saveRes.json();
              localStorage.removeItem(pendingGuestResumeId);
              localStorage.removeItem('pendingGuestResumeId');
              return { success: true, resumeId: savedResume.id };
            }
          }
        }

        return { success: true, resumeId: null };
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
      return res.ok;
    } catch (err) {
      console.error('Signup error:', err);
      return false;
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // New function to allow components to update the credit balance in the context
  const updateUserCredits = (newCreditAmount) => {
    if (user) {
      const updatedUser = { ...user, credits: newCreditAmount };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const contextValue = {
    authToken,
    user, // The user object now contains credits: user.credits
    login,
    logout,
    signup,
    updateUserCredits, // Provide the new function to the app
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);