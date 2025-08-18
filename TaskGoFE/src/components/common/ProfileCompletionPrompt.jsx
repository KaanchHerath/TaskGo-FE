import React from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaUser, FaEdit, FaCheckCircle } from 'react-icons/fa';
import { getToken, parseJwt } from '../../utils/auth';

const ProfileCompletionPrompt = ({ userProfile, className = "" }) => {
  // Check if the current user is viewing their own profile
  const isOwnProfile = () => {
    const token = getToken();
    if (!token || !userProfile) return false;
    
    const payload = parseJwt(token);
    const currentUserId = payload?.userId || payload?.id || payload?._id || payload?.sub;
    const profileUserId = userProfile._id || userProfile.userId;
    
    return currentUserId === profileUserId;
  };


  
  // Check if profile is complete
  const isProfileComplete = () => {
    if (!userProfile || !userProfile.taskerProfile || typeof userProfile.taskerProfile !== 'object') return false;
    
    const requiredFields = [
      userProfile.taskerProfile?.bio || userProfile.bio, // Check both locations for bio
      userProfile.taskerProfile?.hourlyRate,
      userProfile.taskerProfile?.skills?.length > 0,
      userProfile.taskerProfile?.experience,
      userProfile.taskerProfile?.province,
      userProfile.taskerProfile?.district
    ];
    

    
    return requiredFields.every(field => {
      if (!field || field === '' || field === null || field === undefined) return false;
      if (typeof field === 'string' && field.trim() === '') return false;
      return true;
    });
  };

  // Get completion percentage
  const getCompletionPercentage = () => {
    if (!userProfile || !userProfile.taskerProfile || typeof userProfile.taskerProfile !== 'object') return 0;
    
    const fields = [
      userProfile.taskerProfile?.bio || userProfile.bio, // Check both locations for bio
      userProfile.taskerProfile?.hourlyRate,
      userProfile.taskerProfile?.skills?.length > 0,
      userProfile.taskerProfile?.experience,
      userProfile.taskerProfile?.province,
      userProfile.taskerProfile?.district
    ];
    
    const completedFields = fields.filter(field => {
      if (!field || field === '' || field === null || field === undefined) return false;
      if (typeof field === 'string' && field.trim() === '') return false;
      return true;
    }).length;
    return Math.round((completedFields / fields.length) * 100);
  };

  // Get missing fields
  const getMissingFields = () => {
    if (!userProfile || !userProfile.taskerProfile || typeof userProfile.taskerProfile !== 'object') return [];
    
    const missing = [];
    
    const bioValue = userProfile.taskerProfile?.bio || userProfile.bio;
    
    if (!bioValue || bioValue === '' || (typeof bioValue === 'string' && bioValue.trim() === '')) missing.push('Bio/About');
    if (!userProfile.taskerProfile?.hourlyRate) missing.push('Hourly Rate');
    if (!userProfile.taskerProfile?.skills?.length) missing.push('Skills');
    if (!userProfile.taskerProfile?.experience) missing.push('Experience');
    if (!userProfile.taskerProfile?.province) missing.push('Province');
    if (!userProfile.taskerProfile?.district) missing.push('District');
    

    return missing;
  };

  // If profile is complete, no valid data, or not viewing own profile, don't show anything
  if (isProfileComplete() || !userProfile || !userProfile.taskerProfile || typeof userProfile.taskerProfile !== 'object' || !isOwnProfile()) {
    return null;
  }

  const completionPercentage = getCompletionPercentage();
  const missingFields = getMissingFields();

  return (
    <div className={`bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 shadow-lg ${className}`}>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
            <FaExclamationTriangle className="text-white text-xl" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-amber-800">
              Complete Your Profile
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-amber-700">
                {completionPercentage}% Complete
              </span>
              <div className="w-20 h-2 bg-amber-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <p className="text-amber-700 mb-4">
            Complete your profile to increase your chances of getting hired. Customers prefer taskers with complete profiles.
          </p>
          
          {missingFields.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-amber-700 mb-2">Missing information:</p>
              <div className="flex flex-wrap gap-2">
                {missingFields.map((field, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium border border-amber-200"
                  >
                    <FaEdit className="w-3 h-3 mr-1" />
                    {field}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/tasker/profile"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-300 shadow-lg transform hover:scale-105"
            >
              <FaUser className="mr-2" />
              Complete Profile
            </Link>
            
            <Link
              to="/browse-jobs"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-amber-700 font-semibold rounded-xl border-2 border-amber-300 hover:bg-amber-50 transition-all duration-300"
            >
              Browse Tasks Anyway
            </Link>
          </div>
        </div>
      </div>
      
      {/* Benefits of completing profile */}
      <div className="mt-6 pt-6 border-t border-amber-200">
        <h4 className="text-sm font-semibold text-amber-800 mb-3">Why complete your profile?</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <FaCheckCircle className="text-amber-600 flex-shrink-0" />
            <span className="text-sm text-amber-700">Higher visibility in search results</span>
          </div>
          <div className="flex items-center space-x-2">
            <FaCheckCircle className="text-amber-600 flex-shrink-0" />
            <span className="text-sm text-amber-700">More customer trust and confidence</span>
          </div>
          <div className="flex items-center space-x-2">
            <FaCheckCircle className="text-amber-600 flex-shrink-0" />
            <span className="text-sm text-amber-700">Better chances of getting hired</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionPrompt;
