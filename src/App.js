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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<LoginForm onSwitch={() => window.location.href = '/signup'} />} />
          <Route path="/signup" element={<SignupForm onSwitch={() => window.location.href = '/login'} />} />

          {/* These routes are now public to allow for the guest flow */}
          <Route path="/select-template" element={<SelectTemplate />} />
          <Route path="/editor/:resumeId" element={<Editor />} />

          <Route path="/paywall" element={<Paywall />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;