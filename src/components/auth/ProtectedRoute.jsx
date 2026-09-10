import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from '../../router';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  // If not logged in, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
