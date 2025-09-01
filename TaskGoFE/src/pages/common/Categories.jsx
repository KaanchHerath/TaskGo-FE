import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaTools, FaWrench, FaBroom, FaCog, FaPlug, FaHammer, FaLeaf, FaTree, FaLock } from 'react-icons/fa';
import { getCategoryStats } from '../../services/api/taskService';
import { getToken } from '../../utils/auth';

// This is now a general categories page - will redirect based on user role
const Categories = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Get user role from centralized auth util
    const token = getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userRole = payload.role;
        
        // Redirect based on user role
        if (userRole === 'customer') {
          navigate('/customer/categories', { replace: true });
        } else if (userRole === 'tasker') {
          navigate('/tasker/categories', { replace: true });
        } else {
          // Default to customer categories for guests
          navigate('/customer/categories', { replace: true });
        }
      } catch (error) {
        // If token parsing fails, default to customer categories
        navigate('/customer/categories', { replace: true });
      }
    } else {
      // No token, default to customer categories
      navigate('/customer/categories', { replace: true });
    }
  }, [navigate]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500/80 border-t-transparent mx-auto mb-4"></div>
        <p className="text-slate-600">Redirecting...</p>
      </div>
    </div>
  );
};

export default Categories;