import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaUser, 
  FaStar, 
  FaMapMarkerAlt, 
  FaDollarSign, 
  FaBriefcase, 
  FaAward, 
  FaCheckCircle, 
  FaPhone,
  FaEnvelope,
  FaUserTie,
  FaDownload,
  FaEye
} from 'react-icons/fa';
import HireTaskerModal from '../components/tasker/HireTaskerModal';
import { getToken, parseJwt } from '../utils/auth';
import { getTaskerProfile, getTaskerReviews } from '../services/api/taskerService';
import { APP_CONFIG } from '../config/appConfig';

const TaskerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [tasker, setTasker] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHireModal, setShowHireModal] = useState(false);
  const [hireSuccess, setHireSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTaskerProfile();
      fetchTaskerReviews();
    }
  }, [id]);

  const fetchTaskerProfile = async () => {
    try {
      setLoading(true);
      const data = await getTaskerProfile(id);
      setTasker(data.data);
    } catch (err) {
      setError('Failed to load tasker profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskerReviews = async () => {
    try {
      setReviewsLoading(true);
      const data = await getTaskerReviews(id);
      setReviews(data.data || []);
    } catch (err) {
      // Error fetching reviews
    } finally {
      setReviewsLoading(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Recently';
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour(s) ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} weeks ago`;
  };

  const handleHireSuccess = () => {
    setHireSuccess(true);
    setTimeout(() => {
      setHireSuccess(false);
    }, 5000);
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

  const getCurrentUser = () => {
    const token = getToken();
    if (!token) return null;
    const payload = parseJwt(token);
    return payload;
  };

  // Helper function to construct document URLs
  const getDocumentUrl = (docPath) => {
    // Handle both absolute and relative paths
    return docPath.includes('uploads/') 
      ? `${APP_CONFIG.API.BASE_URL}/${docPath}`
      : `${APP_CONFIG.API.BASE_URL}/uploads/tasker-docs/${docPath.split(/[\\\/]/).pop()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            <span className="text-slate-700 font-medium">Loading tasker profile...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !tasker) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 text-center max-w-md">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Tasker Not Found</h2>
          <p className="text-slate-600 mb-6">{error || 'The tasker you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/taskers')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg transform hover:scale-105 flex items-center space-x-2 mx-auto"
          >
            <FaArrowLeft />
            <span>Back to Taskers</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Back Button */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/taskers')}
            className="bg-white/70 backdrop-blur-sm border border-white/30 text-slate-700 px-4 py-2 rounded-xl hover:bg-white/90 transition-all duration-300 flex items-center font-medium shadow-lg"
          >
            <FaArrowLeft className="mr-2" />
            Back to Taskers
          </button>
        </div>



        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
              <div className="flex items-start space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                    {tasker.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  {tasker.isOnline && (
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-slate-800 mb-2">{tasker.fullName}</h1>
                  <div className="flex flex-wrap gap-4 text-slate-600 mb-4">
                    {tasker.area && (
                      <span className="flex items-center space-x-1">
                        <FaMapMarkerAlt className="text-blue-500" />
                        <span>{tasker.area}</span>
                      </span>
                    )}
                    {tasker.taskerProfile?.hourlyRate && (
                      <span className="flex items-center space-x-1">
                        <FaDollarSign className="text-green-500" />
                        <span>LKR {tasker.taskerProfile.hourlyRate}/hour</span>
                      </span>
                    )}
                    {tasker.statistics?.completedTasks && (
                      <span className="flex items-center space-x-1">
                        <FaCheckCircle className="text-purple-500" />
                        <span>{tasker.statistics.completedTasks} tasks completed</span>
                      </span>
                    )}
                  </div>
                  
                  {/* Rating */}
                  {tasker.rating && (
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={`w-5 h-5 ${i < Math.floor(tasker.rating.average) ? 'text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-lg font-semibold text-slate-700">
                        {Number(tasker.rating.average).toFixed(1)}
                      </span>
                      <span className="text-slate-600">
                        ({tasker.rating.count} reviews)
                      </span>
                    </div>
                  )}

                  {/* Availability Status */}
                  <div className="flex items-center space-x-4">
                    {tasker.isAvailable && (
                      <span className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        <FaCheckCircle className="mr-1" />
                        Available for work
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Skills & Experience */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
              <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                <FaBriefcase className="text-green-600 mr-3" />
                Skills & Experience
              </h3>
              
              {/* Skills */}
              {tasker.skills && tasker.skills.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {tasker.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium border border-green-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {tasker.experience && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Experience</h4>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-700">{tasker.experience}</p>
                  </div>
                </div>
              )}

              {/* Bio */}
              {tasker.bio && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">About</h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-gray-700">{tasker.bio}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Qualification Documents */}
            {tasker.taskerProfile?.qualificationDocuments && tasker.taskerProfile.qualificationDocuments.length > 0 && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
                <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                  <FaAward className="text-green-600 mr-3" />
                  Qualification Documents
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {tasker.taskerProfile.qualificationDocuments.map((doc, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-6 bg-green-50/30">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                          <FaAward className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-800">
                            Qualification Document {index + 1}
                          </h4>
                          <p className="text-sm text-slate-600 mt-1">
                            {doc.split('/').pop()}
                          </p>
                          <div className="flex items-center space-x-3 mt-3">
                            <button 
                              onClick={() => {
                                const url = getDocumentUrl(doc);
                                window.open(url, '_blank');
                              }}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              <FaEye className="w-4 h-4" />
                              <span>View Document</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Customer Reviews */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
              <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                <FaAward className="text-purple-600 mr-3" />
                Customer Reviews ({reviews.length})
              </h3>
              
              {reviewsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading reviews...</p>
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review, index) => (
                    <div key={index} className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <FaUser className="text-purple-600" />
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-800">
                              {review.customer?.fullName || 'Anonymous Customer'}
                            </h5>
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <FaStar
                                  key={i}
                                  className={`w-4 h-4 ${i < (review.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                                />
                              ))}
                              <span className="text-sm text-gray-600 ml-1">
                                ({review.rating || 0}/5)
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatTimeAgo(review.completedAt)}
                        </span>
                      </div>
                      {review.review && (
                        <p className="text-gray-700 mb-3 italic">"{review.review}"</p>
                      )}
                      {review.taskTitle && (
                        <p className="text-sm text-gray-500">
                          <strong>Task:</strong> {review.taskTitle}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FaAward className="text-4xl text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-700 mb-2">No reviews yet</h4>
                  <p className="text-gray-600">This tasker hasn't received any reviews yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Contact Information</h3>
              <div className="space-y-3">
                {tasker.email && (
                  <div className="flex items-center space-x-3 text-gray-600">
                    <FaEnvelope className="text-blue-500" />
                    <span className="text-sm">{tasker.email}</span>
                  </div>
                )}
                {tasker.phone && (
                  <div className="flex items-center space-x-3 text-gray-600">
                    <FaPhone className="text-green-500" />
                    <span className="text-sm">{tasker.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Performance Stats */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Performance Stats</h3>
              <div className="space-y-4">
                {tasker.statistics?.completedTasks !== undefined && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {tasker.statistics.completedTasks}
                    </div>
                    <div className="text-sm text-gray-600">Tasks Completed</div>
                  </div>
                )}
                
                {tasker.rating && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {Number(tasker.rating.average).toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">Average Rating</div>
                  </div>
                )}
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {reviews.length}
                  </div>
                  <div className="text-sm text-gray-600">Customer Reviews</div>
                </div>
                
              </div>
            </div>

            {/* Hire Button */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              {/* Always show the hire button prominently */}
              <button 
                onClick={() => {
                  if (isLoggedIn() && isCustomer()) {
                    setShowHireModal(true);
                  } else {
                    navigate('/login');
                  }
                }}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-bold text-lg shadow-lg flex items-center justify-center space-x-2 transform hover:scale-105"
              >
                <FaUserTie className="text-xl" />
                <span>
                  {isLoggedIn() && isCustomer() 
                    ? 'Hire This Tasker' 
                    : 'Login to Hire This Tasker'
                  }
                </span>
              </button>
              <p className="text-sm text-gray-600 text-center mt-3">
                {isLoggedIn() && isCustomer() 
                  ? `Send a task directly to ${tasker.fullName}`
                  : `Create an account to hire ${tasker.fullName}`
                }
              </p>
              

            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {hireSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2">
          <FaCheckCircle />
          <span>Task sent to {tasker.fullName} successfully!</span>
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

export default TaskerProfile; 