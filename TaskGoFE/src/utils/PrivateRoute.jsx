import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { parseJwt, roleToDashboard, getToken } from './auth';

const PrivateRoute = ({ allowedRoles }) => {
  const location = useLocation();
  const token = getToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  const payload = parseJwt(token);
  const userRole = payload?.role;
  
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to={roleToDashboard[userRole] || '/'} replace />;
  }
  return <Outlet />;
};

export default PrivateRoute; 
