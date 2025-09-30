import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';

import { AuthProvider } from './components/AuthContext';
import Homepage from './components/Homepage';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import SelectTemplate from './components/SelectTemplate';
import Editor from './components/Editor';
import Paywall from './components/Paywall';

// We will create these two new components in the next steps
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />
          
          {/* Add the new routes for the password reset flow */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:uidb64/:token" element={<ResetPassword />} />

          <Route path="/select-template" element={<SelectTemplate />} />
          <Route path="/editor/:resumeId" element={<Editor />} />
          <Route path="/paywall" element={<Paywall />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;