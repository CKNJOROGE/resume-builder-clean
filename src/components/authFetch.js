// src/components/authFetch.js

const authFetch = async (url, options = {}) => {
  let token = localStorage.getItem('token');
  
  // --- THIS IS THE MODIFIED SECTION ---
  // Initialize headers if they don't exist
  options.headers = options.headers || {};
  options.headers['Authorization'] = `Bearer ${token}`;

  // Do NOT set Content-Type if the body is FormData; the browser will do it.
  if (!(options.body instanceof FormData)) {
    options.headers['Content-Type'] = 'application/json';
  }
  // --- END OF MODIFIED SECTION ---

  // Make the initial request
  let response = await fetch(url, options);

  // If the response is 401 (Unauthorized), it means the token expired
  if (response.status === 401) {
    console.log("Access token expired. Attempting to refresh...");
    const refreshToken = localStorage.getItem('refreshToken');

    if (refreshToken) {
        const refreshResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            
            localStorage.setItem('token', data.access);
            localStorage.setItem('refreshToken', data.refresh);
            
            options.headers['Authorization'] = `Bearer ${data.access}`;
            
            console.log("Token refreshed. Retrying original request...");
            response = await fetch(url, options);
        } else {
            console.log("Refresh token failed. Logging out.");
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
    } else {
        // No refresh token found, log out
        console.log("No refresh token. Logging out.");
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }
  }

  return response;
};

export default authFetch;
