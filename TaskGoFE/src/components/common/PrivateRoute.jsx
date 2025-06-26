import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// Helper to decode JWT (simple base64 decode, not secure for production)
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

const roleToDashboard = {
  customer: '/customer-dashboard',
  tasker: '/tasker-dashboard',
  admin: '/admin-dashboard',
};

const PrivateRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  const payload = parseJwt(token);
  const userRole = payload?.role;
  if (!allowedRoles.includes(userRole)) {
    // Redirect to their dashboard if role does not match
    return <Navigate to={roleToDashboard[userRole] || '/'} replace />;
  }
  return <Outlet />;
};

export default PrivateRoute; 