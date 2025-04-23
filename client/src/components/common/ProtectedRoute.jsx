import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, canAccessDashboard } from '../../utils/auth';

const ProtectedRoute = ({ children, isAllowed = true, requiredRole = null }) => {
  const location = useLocation();
  
  // Check if user is authenticated
  if (!isAuthenticated()) {
    // Redirect to login page with a return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Check if user has required permissions - support both isAllowed and requiredRole props
  if (requiredRole && !canAccessDashboard(requiredRole)) {
    return <Navigate to="/" replace />;
  }
  
  if (!isAllowed && !requiredRole) {
    return <Navigate to="/" replace />;
  }
  
  // If authenticated and authorized, render the children
  return children;
};

export default ProtectedRoute;
