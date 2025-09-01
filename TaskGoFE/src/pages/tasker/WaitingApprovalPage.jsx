import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WaitingApproval from '../../components/tasker/WaitingApproval';
import { getToken } from '../../utils/auth';

const WaitingApprovalPage = () => {
  const navigate = useNavigate();
  const [isTasker, setIsTasker] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is a tasker
    const checkUserRole = () => {
      const token = getToken();
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role !== 'tasker') {
          // If not a tasker, redirect to appropriate dashboard
          if (payload.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/customer/dashboard');
          }
          return;
        }
        
        setIsTasker(true);
      } catch (error) {
        console.error('Error parsing token:', error);
        navigate('/login');
        return;
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50/40 to-teal-50/30 flex items-center justify-center">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            <span className="text-slate-700 font-medium">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isTasker) {
    return null; // Will redirect in useEffect
  }

  return <WaitingApproval />;
};

export default WaitingApprovalPage; 