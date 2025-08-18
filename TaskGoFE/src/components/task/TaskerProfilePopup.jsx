import React, { useState, useEffect } from 'react';
import { FaUser, FaStar, FaMapMarkerAlt, FaDollarSign, FaBriefcase, FaAward, FaCheckCircle, FaClock, FaPhone, FaEnvelope, FaTimes, FaSpinner, FaChartLine, FaFileAlt, FaDownload, FaEye } from 'react-icons/fa';
import Modal from '../common/Modal';
import { getTaskerProfile, getTaskerReviews } from '../../services/api/taskerService';

const TaskerProfilePopup = ({ isOpen, onClose, taskerId, taskerName }) => {
  const [tasker, setTasker] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && taskerId) {
      fetchTaskerProfile();
      fetchTaskerReviews();
    }
  }, [isOpen, taskerId]);

  const fetchTaskerProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getTaskerProfile(taskerId);
      setTasker(data.data);
    } catch (err) {
      setError('Failed to load tasker profile');
      console.error('Error fetching tasker profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskerReviews = async () => {
    try {
      const data = await getTaskerReviews(taskerId);
      setReviews(data.data || []);
      setReviewStats(data.statistics || null);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'T';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderStars = (rating) => {
    if (!rating || !rating.average) return null;
    
    const stars = [];
    const fullStars = Math.floor(rating.average);
    const hasHalfStar = rating.average % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FaStar key={`full-${i}`} className="text-yellow-400 w-4 h-4" />
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <FaStar key="half" className="text-yellow-400 w-4 h-4" style={{ clipPath: 'inset(0 50% 0 0)' }} />
      );
    }
    
    const emptyStars = 5 - Math.ceil(rating.average);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <FaStar key={`empty-${i}`} className="text-gray-300 w-4 h-4" />
      );
    }
    
    return stars;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      return `${Math.floor(diffDays / 365)} years ago`;
    } catch (_) {
      return 'Recently';
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tasker Profile"
      subtitle={taskerName || 'View tasker details'}
      icon={FaUser}
      iconColor="text-blue-600"
      iconBgColor="bg-blue-100"
      maxWidth="max-w-full"
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <FaSpinner className="animate-spin text-4xl text-blue-600" />
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <div className="text-red-600 text-lg mb-2">{error}</div>
          <button
            onClick={fetchTaskerProfile}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      ) : tasker ? (
        <div className="space-y-6 w-full">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-8">
            <div className="flex items-start space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {getInitials(tasker.fullName)}
                </div>
                {tasker.isOnline && (
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-slate-800 mb-3">{tasker.fullName}</h2>
                <div className="flex flex-wrap gap-4 text-slate-600 mb-4">
                  {tasker.area && (
                    <span className="flex items-center space-x-2">
                      <FaMapMarkerAlt className="text-blue-500" />
                      <span className="text-lg">{tasker.area}</span>
                    </span>
                  )}
                  {tasker.taskerProfile?.hourlyRate && (
                    <span className="flex items-center space-x-2">
                      <FaDollarSign className="text-green-500" />
                      <span className="text-lg">LKR {tasker.taskerProfile.hourlyRate}/hour</span>
                    </span>
                  )}
                  {tasker.statistics?.completedTasks && (
                    <span className="flex items-center space-x-2">
                      <FaCheckCircle className="text-purple-500" />
                      <span className="text-lg">{tasker.statistics.completedTasks} tasks completed</span>
                    </span>
                  )}
                </div>
                
                {/* Rating */}
                {tasker.rating && (
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      {renderStars(tasker.rating)}
                    </div>
                    <span className="text-lg text-slate-600">
                      {Number(tasker.rating.average).toFixed(1)} ({tasker.rating.count} reviews)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Two Column Layout for Better Full Screen Usage */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Bio and Experience */}
              {(tasker.bio || tasker.taskerProfile?.bio || tasker.taskerProfile?.experience) && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                    <FaBriefcase className="text-blue-600 mr-3" />
                    About & Experience
                  </h3>
                  <div className="space-y-4">
                    {tasker.taskerProfile?.bio && (
                      <div>
                        <h4 className="font-medium text-slate-700 mb-2 text-lg">Bio</h4>
                        <p className="text-slate-600 leading-relaxed text-base">{tasker.taskerProfile.bio}</p>
                      </div>
                    )}
                    {tasker.taskerProfile?.experience && (
                      <div>
                        <h4 className="font-medium text-slate-700 mb-2 text-lg">Experience</h4>
                        <p className="text-slate-600 leading-relaxed text-base">{tasker.taskerProfile.experience}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Skills */}
              {tasker.taskerProfile?.skills && tasker.taskerProfile.skills.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                    <FaAward className="text-green-600 mr-3" />
                    Skills & Expertise
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {tasker.taskerProfile.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-base font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                  <FaPhone className="text-green-600 mr-3" />
                  Contact Information
                </h3>
                <div className="space-y-4">
                  {tasker.email && (
                    <div className="flex items-center space-x-4">
                      <FaEnvelope className="text-blue-500 text-xl" />
                      <span className="text-slate-600 text-lg">{tasker.email}</span>
                    </div>
                  )}
                  {tasker.phone && (
                    <div className="flex items-center space-x-4">
                      <FaPhone className="text-green-500 text-xl" />
                      <span className="text-slate-600 text-lg">{tasker.phone}</span>
                    </div>
                  )}
                  {tasker.taskerProfile?.province && tasker.taskerProfile?.district && (
                    <div className="flex items-center space-x-4">
                      <FaMapMarkerAlt className="text-red-500 text-xl" />
                      <span className="text-slate-600 text-lg">
                        {tasker.taskerProfile.district}, {tasker.taskerProfile.province}
                      </span>
                    </div>
                  )}
                </div>
              </div>

           
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Performance Stats */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center">
                  <FaChartLine className="text-purple-600 mr-3" />
                  Performance Statistics
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {tasker.statistics?.completedTasks || 0}
                    </div>
                    <div className="text-base text-gray-600">Tasks Completed</div>
                  </div>
                  
                  {(tasker.rating || reviewStats) && (
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-600">
                        {Number(tasker.rating?.average || reviewStats?.averageRating || 0).toFixed(1)}
                      </div>
                      <div className="text-base text-gray-600">Average Rating</div>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {reviews.length}
                    </div>
                    <div className="text-base text-gray-600">Customer Reviews</div>
                  </div>

                </div>
              </div>

              {/* Recent Reviews */}
              {reviews.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                    <FaStar className="text-yellow-600 mr-3" />
                    Recent Reviews
                  </h3>
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {reviews.slice(0, 8).map((review, index) => (
                      <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1">
                              {renderStars({ average: review.rating })}
                            </div>
                            <span className="text-base font-medium text-slate-700">
                              {review.customer?.fullName || 'Anonymous'}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-slate-600 text-base leading-relaxed">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

                 {/* Qualification Documents */}
                 <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                  <FaFileAlt className="text-indigo-600 mr-3" />
                  Qualification Documents
                </h3>
                {tasker.taskerProfile?.qualificationDocuments && tasker.taskerProfile.qualificationDocuments.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      {tasker.taskerProfile.qualificationDocuments.map((docPath, index) => {
                        // Extract filename from path
                        const fileName = docPath.split('/').pop() || `Document ${index + 1}`;
                        // Determine file type from extension
                        const fileExtension = fileName.split('.').pop()?.toLowerCase();
                        const fileType = fileExtension === 'pdf' ? 'PDF Document' : 
                                       fileExtension === 'jpg' || fileExtension === 'jpeg' ? 'Image File' :
                                       fileExtension === 'png' ? 'Image File' :
                                       fileExtension === 'doc' || fileExtension === 'docx' ? 'Word Document' :
                                       'Document File';
                        
                        // Construct full URL (assuming the backend serves files from a base URL)
                        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                        const fullUrl = `${baseUrl}/${docPath}`;
                        
                        return (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center space-x-3">
                              <FaFileAlt className="text-indigo-500 text-lg" />
                              <div>
                                <p className="font-medium text-slate-700">
                                  {fileName}
                                </p>
                                <p className="text-sm text-slate-500">
                                  {fileType}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => window.open(fullUrl, '_blank')}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Document"
                              >
                                <FaEye className="text-lg" />
                              </button>
                              <button
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = fullUrl;
                                  link.download = fileName;
                                  link.click();
                                }}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Download Document"
                              >
                                <FaDownload className="text-lg" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <FaCheckCircle className="inline mr-2 text-blue-600" />
                        These documents have been verified by our team
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <FaFileAlt className="text-4xl text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 text-lg">No qualification documents uploaded</p>
                    <p className="text-sm text-gray-500 mt-1">This tasker hasn't uploaded any qualification documents yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};

export default TaskerProfilePopup;
