// src/components/authFetch.js

import { AuthContext } from './AuthContext'; // We'll need access to the context functions

// This function will wrap the standard browser fetch
const authFetch = async (url, options = {}) => {
  let token = localStorage.getItem('token');
  
  // Add the Authorization header to the request
  options.headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Make the initial request
  let response = await fetch(url, options);

  // If the response is 401 (Unauthorized), it means the token expired
  if (response.status === 401) {
    console.log("Access token expired. Attempting to refresh...");
    
    // Get the refresh token from where your AuthContext might store it
    // For this to work, we'd need to adjust AuthContext to also store the refresh token.
    // Let's assume for now it's stored. A full implementation would require editing AuthContext.
    const refreshToken = localStorage.getItem('refreshToken'); // You'll need to save this on login

    // Make a request to the refresh endpoint
    const refreshResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (refreshResponse.ok) {
      const data = await refreshResponse.json();
      
      // Save the new tokens
      localStorage.setItem('token', data.access);
      localStorage.setItem('refreshToken', data.refresh); // Save the new rotated refresh token
      
      // Update the header with the new access token
      options.headers['Authorization'] = `Bearer ${data.access}`;
      
      // Retry the original request with the new token
      console.log("Token refreshed. Retrying original request...");
      response = await fetch(url, options);
    } else {
      // If refresh fails, log the user out
      // This part would ideally call the logout function from AuthContext
      console.log("Refresh token failed. Logging out.");
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login'; // Force redirect
    }
  }

  return response;
};

export default authFetch;
