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
    // Redirect to their dashboard if role does not match
    return <Navigate to={roleToDashboard[userRole] || '/'} replace />;
  }
  
  // Do not enforce tasker approval here. Approval is validated via TaskerApprovalCheck to avoid stale token issues.
  
  return <Outlet />;
};

export default PrivateRoute; 
