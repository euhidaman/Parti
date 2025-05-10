import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import { useAuth, AuthProvider } from './contexts/AuthContext';
import Login from './components/auth/Login';
import ProfessorDashboard from './components/auth/ProfessorDashboard';
import StudentDashboard from './components/auth/StudentDashboard';

// Protected route component that redirects to login if not authenticated
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, hasRole } = useAuth();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    // If a specific role is required but user doesn't have it
    return <Navigate to="/" replace />;
  }

  return children;
};

// Component to route users based on their role
const RoleRouter = () => {
  const { hasRole } = useAuth();

  if (hasRole('professor')) {
    return <Navigate to="/professor" replace />;
  }

  if (hasRole('student')) {
    return <Navigate to="/student" replace />;
  }

  return <Navigate to="/login" replace />;
};

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Public route for login */}
          <Route path="/login" element={
            isAuthenticated() ? <Navigate to="/" replace /> : <Login />
          } />

          {/* Protected routes based on role */}
          <Route path="/professor" element={
            <ProtectedRoute requiredRole="professor">
              <ProfessorDashboard />
            </ProtectedRoute>
          } />

          <Route path="/student" element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          } />

          {/* Root route redirects based on auth status and role */}
          <Route path="/" element={<RoleRouter />} />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;