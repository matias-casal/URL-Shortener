import React, { useContext, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * Props for the ProtectedRoute component
 */
interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Protected route component that restricts access to authenticated users
 * Redirects to login page if user is not authenticated
 * Shows loading state while checking authentication
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  
  if (loading) {
    // You could return a loading spinner here
    return <div className="loading">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute; 