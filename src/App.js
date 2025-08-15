import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import { AuthProvider, useAuth } from './components/AuthContext';
import Homepage from './components/Homepage';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import SelectTemplate from './components/SelectTemplate';
import Editor from './components/Editor';
import Paywall from './components/Paywall';



const ProtectedRoute = ({ children }) => {
  const { authToken, premium } = useAuth();

  if (!authToken) {
    return <Navigate to="/login" />;
  }

  // This ProtectedRoute now explicitly checks for premium status.
  // If access to 'select-template' or 'editor' requires premium, this is correct.
  // If not, you might need a different ProtectedRoute or check within components.
  if (!premium) {
    return <Navigate to="/paywall" />;
  }

  return children;
};


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          {/* 1. Public landing page */}
          <Route path="/" element={<Homepage />} />

          {/* Login Route */}
          <Route
            path="/login"
            element={
              <LoginForm
                onSuccess={() => window.location.href = '/select-template'}
                onSwitch={() => window.location.href = '/signup'}
              />
            }
          />

          {/* Signup Route */}
          <Route
            path="/signup"
            element={
              <SignupForm
                onSuccess={() => window.location.href = '/select-template'}
                onSwitch={() => window.location.href = '/login'}
              />
            }
          />

          {/* Select Template Route - Protected */}
          <Route
            path="/select-template"
            element={
              <ProtectedRoute>
                <SelectTemplate />
              </ProtectedRoute>
            }
          />

          {/* Editor Route - Now uses a specific path with a dynamic parameter */}
          <Route
            path="/editor/:resumeId" // Editor should have a unique path
            element={
              <ProtectedRoute>
                <Editor />
              </ProtectedRoute>
            }
          />

          {/* Paywall Route */}
          <Route path="/paywall" element={<Paywall />} />

          {/* Optional: Catch-all for undefined routes, redirects to home */}
          {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;