import React, { useState } from 'react';
import { FaStar, FaMapMarkerAlt, FaClock, FaEye, FaPhone, FaEnvelope, FaCheckCircle, FaDollarSign, FaExclamationTriangle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { formatLocation } from '../../config/locations';
import HireTaskerModal from '../tasker/HireTaskerModal';
import { getToken, parseJwt } from '../../utils/auth';

const TaskerCard = ({ 
  tasker, 
  onClick, 
  showContactInfo = false, 
  className = "",
  variant = "default", // "default", "compact", "detailed"
  showHireButton = true
}) => {
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

  // Check if tasker profile is complete
  const isProfileComplete = () => {
    if (!tasker || !tasker.taskerProfile || typeof tasker.taskerProfile !== 'object') return false;
    
    const requiredFields = [
      tasker.taskerProfile?.bio || tasker.bio, // Check both locations for bio
      tasker.taskerProfile?.hourlyRate,
      tasker.taskerProfile?.skills?.length > 0,
      tasker.taskerProfile?.experience,
      tasker.taskerProfile?.province,
      tasker.taskerProfile?.district
    ];
    
    return requiredFields.every(field => field && field !== '' && field !== null && field !== undefined);
  };

  // Check if current user is the tasker themselves
  const isOwnProfile = () => {
    const token = getToken();
    if (!token || !tasker) return false;
    
    const payload = parseJwt(token);
    const currentUserId = payload?.userId || payload?.id || payload?._id || payload?.sub;
    const taskerUserId = tasker._id || tasker.userId;
    
    return currentUserId === taskerUserId;
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

  const isCustomer = () => {
    const token = getToken();
    if (!token) return false;
    const payload = parseJwt(token);
    return payload?.role === 'customer';
  };

  const isLoggedIn = () => {
    const token = getToken();
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

  const renderCompactCard = () => (
    <div className={`bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20 cursor-pointer ${className}`}>
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {getInitials(tasker.fullName)}
          </div>
          {tasker.isOnline && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          )}
          {/* Profile completion indicator - only show for own profile */}
          {!isProfileComplete() && isOwnProfile() && (
            <div className="absolute -top-1 -left-1 w-5 h-5 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center">
              <FaExclamationTriangle className="text-white text-xs" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-slate-800 truncate">{tasker.fullName}</h3>
          <div className="flex items-center text-slate-600 text-sm mb-1">
            <FaMapMarkerAlt className="text-blue-500 mr-1" />
            <span className="truncate">{formatLocation(tasker.taskerProfile?.province, tasker.taskerProfile?.district) || 'Location not specified'}</span>
          </div>
          <div className="flex items-center space-x-4 text-sm text-slate-500">
            <span className="flex items-center">
              <FaDollarSign className="text-green-500 mr-1" />
              LKR {tasker.taskerProfile?.hourlyRate || 'N/A'}/hr
            </span>
            <span className="flex items-center">
              <FaStar className="text-yellow-400 mr-1" />
              {tasker.rating?.average ? tasker.rating.average.toFixed(1) : 'New'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDetailedCard = () => (
    <div className={`bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 cursor-pointer ${className}`}>
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
          {/* Profile completion indicator */}
          {!isProfileComplete() && (
            <div className="absolute -top-2 -left-2 w-6 h-6 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center">
              <FaExclamationTriangle className="text-white text-xs" />
            </div>
          )}
        </div>
        <div className="ml-4 flex-1">
          <h3 className="font-bold text-xl text-slate-800">
            {tasker.fullName}
          </h3>
          <div className="flex items-center text-slate-600 mb-1">
            <FaMapMarkerAlt className="text-blue-500 mr-2" />
            <span className="font-medium">{formatLocation(tasker.taskerProfile?.province, tasker.taskerProfile?.district) || 'Location not specified'}</span>
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
              LKR {tasker.taskerProfile?.hourlyRate || 'N/A'}
            </div>
            <div className="text-xs text-slate-500 font-medium">Per Hour</div>
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
        {showHireButton && (
          <button 
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold shadow-lg"
            onClick={handleHireClick}
          >
            Hire
          </button>
        )}
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

  const renderDefaultCard = () => (
    <div className={`bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 cursor-pointer ${className}`}>
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
          {/* Profile completion indicator */}
          {!isProfileComplete() && (
            <div className="absolute -top-2 -left-2 w-6 h-6 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center">
              <FaExclamationTriangle className="text-white text-xs" />
            </div>
          )}
        </div>
        <div className="ml-4 flex-1">
          <h3 className="font-bold text-xl text-slate-800">
            {tasker.fullName}
          </h3>
          <div className="flex items-center text-slate-600 mb-1">
            <FaMapMarkerAlt className="text-blue-500 mr-2" />
            <span className="font-medium">{formatLocation(tasker.taskerProfile?.province, tasker.taskerProfile?.district) || 'Location not specified'}</span>
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
              LKR {tasker.taskerProfile?.hourlyRate || 'N/A'}
            </div>
            <div className="text-xs text-slate-500 font-medium">Per Hour</div>
          </div>
        </div>
      </div>

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

  // Render based on variant
  switch (variant) {
    case 'compact':
      return renderCompactCard();
    case 'detailed':
      return renderDetailedCard();
    default:
      return renderDefaultCard();
  }
};

export default TaskerCard;
