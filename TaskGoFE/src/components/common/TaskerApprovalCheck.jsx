import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getApprovalStatus } from '../../services/api/userService';

const TaskerApprovalCheck = () => {
  const [checking, setChecking] = useState(true);
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getApprovalStatus();
        if (mounted) {
          setIsApproved(res?.data?.approvalStatus === 'approved');
        }
      } catch (_) {
        if (mounted) setIsApproved(false);
      } finally {
        if (mounted) setChecking(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (checking) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-gray-600 text-sm">
        Checking approval...
      </div>
    );
  }

  if (!isApproved) {
    return <Navigate to="/tasker/waiting-approval" replace />;
  }

  return <Outlet />;
};

export default TaskerApprovalCheck;
