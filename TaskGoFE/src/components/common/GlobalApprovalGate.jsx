import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getToken, parseJwt } from '../../utils/auth';
import { getApprovalStatus } from '../../services/api/userService';

// Gate that redirects any logged-in, unapproved tasker to the waiting page
const GlobalApprovalGate = () => {
  const location = useLocation();
  const token = getToken();

  const [checking, setChecking] = useState(false);
  const [isAllowed, setIsAllowed] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkApproval = async () => {
      // Not logged in → allow navigation
      if (!token) {
        if (mounted) setIsAllowed(true);
        return;
      }

      const payload = parseJwt(token);
      const role = payload?.role;

      // Only gate taskers
      if (role !== 'tasker') {
        if (mounted) setIsAllowed(true);
        return;
      }

      // Always allow the waiting page to prevent redirect loops
      if (location.pathname.startsWith('/tasker/waiting-approval')) {
        if (mounted) setIsAllowed(true);
        return;
      }

      setChecking(true);
      try {
        const res = await getApprovalStatus();
        const approved = res?.data?.approvalStatus === 'approved';
        if (mounted) setIsAllowed(approved);
      } catch (_) {
        // If API fails, treat as not approved to be safe
        if (mounted) setIsAllowed(false);
      } finally {
        if (mounted) setChecking(false);
      }
    };

    checkApproval();
    return () => { mounted = false; };
  }, [token, location.pathname]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 text-sm">
        Checking account approval...
      </div>
    );
  }

  if (!isAllowed) {
    return <Navigate to="/tasker/waiting-approval" replace />;
  }

  return <Outlet />;
};

export default GlobalApprovalGate;


