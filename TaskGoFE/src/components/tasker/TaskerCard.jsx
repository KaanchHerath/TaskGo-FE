import React, { useState } from 'react';
import { FaStar, FaMapMarkerAlt, FaClock, FaEye, FaPhone, FaEnvelope, FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import HireTaskerModal from './HireTaskerModal';

const TaskerCard = ({ tasker, onClick, showContactInfo = false, className = "" }) => {
  const navigate = useNavigate();
  const [showHireModal, setShowHireModal] = useState(false);
  const [hireSuccess, setHireSuccess] = useState(false);

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatResponseTime = (hours) => {
    if (hours < 1) return '< 1 hour';
    if (hours === 1) return '1 hour';
    if (hours < 24) return `${hours} hour(s)`;
    const days = Math.ceil(hours / 24);
    return `${days} day(s)`;
  };

  const handleHireSuccess = () => {
    setHireSuccess(true);
    setTimeout(() => {
      setHireSuccess(false);
    }, 3000);
  };

  // Helper function to parse JWT token
  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  const isCustomer = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    const payload = parseJwt(token);
    return payload?.role === 'customer';
  };

  const isLoggedIn = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    const payload = parseJwt(token);
    return !!payload && !!payload.userId;
  };

  const handleHireClick = (e) => {
    e.stopPropagation();
    if (isLoggedIn() && isCustomer()) {
      setShowHireModal(true);
    } else {
      navigate('/login');
    }
  };

  return (
    <div 
      className={`bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 cursor-pointer ${className}`}
      onClick={() => onClick && onClick(tasker)}
    >
      {/* Header with Avatar and Info */}
      <div className="flex items-center mb-6">
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
            {getInitials(tasker.fullName)}
          </div>
          {tasker.isOnline && (
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
          )}
        </div>
        <div className="ml-4 flex-1">
          <h3 className="font-bold text-xl text-slate-800">
            {tasker.fullName}
          </h3>
          <div className="flex items-center text-slate-600 mb-1">
            <FaMapMarkerAlt className="text-blue-500 mr-2" />
            <span className="font-medium">{tasker.taskerProfile?.area || 'Location not specified'}</span>
          </div>
          <div className="text-sm text-slate-500 font-medium">
            {tasker.completedTasks || 0} tasks completed
            {tasker.taskerProfile?.experience && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">
                {tasker.taskerProfile.experience} exp
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Skills */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {tasker.taskerProfile?.skills?.slice(0, 3).map(skill => (
            <span key={skill} className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-4 py-2 rounded-xl text-sm font-semibold border border-blue-200">
              {skill}
            </span>
          ))}
          {tasker.taskerProfile?.skills?.length > 3 && (
            <span className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200">
              +{tasker.taskerProfile.skills.length - 3} more
            </span>
          )}
        </div>
      </div>
      
      {/* Stats */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 rounded-xl p-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <FaStar className="text-yellow-400 mr-1" />
              <span className="font-bold text-lg text-slate-800">
                {tasker.rating?.average ? tasker.rating.average.toFixed(1) : 'New'}
              </span>
              {tasker.rating?.count > 0 && (
                <span className="text-slate-600 ml-1 text-sm">({tasker.rating.count})</span>
              )}
            </div>
            <div className="text-xs text-slate-500 font-medium">Rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-2">
              LKR {tasker.taskerProfile?.advancePaymentAmount || 0}
            </div>
            <div className="text-xs text-slate-500 font-medium">Advance Payment</div>
          </div>
        </div>
      </div>

      {/* Contact Info (if shown) */}
      {showContactInfo && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <div className="space-y-2">
            {tasker.phone && (
              <div className="flex items-center text-slate-600">
                <FaPhone className="text-blue-500 mr-3" />
                <span className="text-sm">{tasker.phone}</span>
              </div>
            )}
            {tasker.email && (
              <div className="flex items-center text-slate-600">
                <FaEnvelope className="text-blue-500 mr-3" />
                <span className="text-sm">{tasker.email}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button 
          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold shadow-lg"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/taskers/${tasker._id}`);
          }}
        >
          View
        </button>
      </div>

      {/* Success Message */}
      {hireSuccess && (
        <div className="mt-3 bg-green-100 border border-green-300 text-green-700 px-3 py-2 rounded-lg text-sm text-center">
          Task sent successfully!
        </div>
      )}

      {/* Hire Modal */}
      <HireTaskerModal
        isOpen={showHireModal}
        onClose={() => setShowHireModal(false)}
        tasker={tasker}
        onSuccess={handleHireSuccess}
      />
    </div>
  );
};

export default TaskerCard; 