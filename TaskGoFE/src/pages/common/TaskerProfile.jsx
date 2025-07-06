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
  FaClock,
  FaPhone,
  FaEnvelope,
  FaUserTie,
  FaComments,
  FaCalendarAlt,
  FaThumbsUp,
  FaEye
} from 'react-icons/fa';
import { useToast, ToastContainer } from '../../components/common/Toast';
import { getTaskerProfile, getTaskerReviews } from '../../services/api/taskerService';

const TaskerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toasts, removeToast, showError, showSuccess } = useToast();
  
  const [tasker, setTasker] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [error, setError] = useState('');

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
      console.error('Error fetching tasker profile:', err);
      showError('Failed to load tasker profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskerReviews = async () => {
    try {
      setReviewsLoading(true);
      const data = await getTaskerReviews(id);
      setReviews(data.data || []);
      setReviewStats(data.statistics || null);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
    if (diffInWeeks < 4) return `${diffInWeeks} weeks ago`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} months ago`;
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'Not specified';
    return `LKR ${Number(amount).toLocaleString()}`;
  };

  const getInitials = (name) => {
    if (!name) return 'TG';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const renderStars = (rating, size = 'w-5 h-5') => {
    const stars = [];
    const numRating = Number(rating) || 0;
    
    for (let i = 0; i < 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={`${size} ${i < Math.floor(numRating) ? 'text-yellow-400' : 'text-gray-300'}`}
        />
      );
    }
    return stars;
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
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg transform hover:scale-105 flex items-center space-x-2"
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
                    {getInitials(tasker.fullName)}
                  </div>
                  {tasker.isOnline && (
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-slate-800 mb-2">{tasker.fullName || 'Unknown Tasker'}</h1>
                  <div className="flex flex-wrap gap-4 text-slate-600 mb-4">
                    {tasker.area && (
                      <span className="flex items-center space-x-1">
                        <FaMapMarkerAlt className="text-blue-500" />
                        <span>{tasker.area}</span>
                      </span>
                    )}
                    {tasker.hourlyRate && (
                      <span className="flex items-center space-x-1">
                        <FaDollarSign className="text-green-500" />
                        <span>{formatCurrency(tasker.hourlyRate)}/hour</span>
                      </span>
                    )}
                    {tasker.statistics?.completedTasks !== undefined && (
                      <span className="flex items-center space-x-1">
                        <FaCheckCircle className="text-purple-500" />
                        <span>{tasker.statistics.completedTasks} tasks completed</span>
                      </span>
                    )}
                    {tasker.createdAt && (
                      <span className="flex items-center space-x-1">
                        <FaCalendarAlt className="text-orange-500" />
                        <span>Member since {formatDate(tasker.createdAt)}</span>
                      </span>
                    )}
                  </div>
                  
                  {/* Rating */}
                  {(tasker.rating || reviewStats) && (
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="flex items-center">
                        {renderStars(tasker.rating?.average || reviewStats?.averageRating)}
                      </div>
                      <span className="text-lg font-semibold text-slate-700">
                        {Number(tasker.rating?.average || reviewStats?.averageRating || 0).toFixed(1)}
                      </span>
                      <span className="text-slate-600">
                        ({tasker.rating?.count || reviewStats?.totalReviews || 0} reviews)
                      </span>
                    </div>
                  )}

                  {/* Availability Status */}
                  <div className="flex items-center space-x-4 flex-wrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      tasker.isAvailable 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      <FaCheckCircle className="mr-1" />
                      {tasker.isAvailable ? 'Available for work' : 'Currently unavailable'}
                    </span>
                    {tasker.statistics?.responseRate && (
                      <span className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        <FaThumbsUp className="mr-1" />
                        {tasker.statistics.responseRate}% Response Rate
                      </span>
                    )}
                    {tasker.isOnline && (
                      <span className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                        Online now
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
                  <h4 className="font-semibold text-gray-800 mb-3">Experience Level</h4>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-700 font-medium">{tasker.experience}</p>
                  </div>
                </div>
              )}

              {/* Bio */}
              {tasker.bio && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">About</h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-gray-700">{tasker.bio}</p>
                  </div>
                </div>
              )}

              {/* Recent Tasks */}
              {tasker.recentTasks && tasker.recentTasks.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Recent Completed Tasks</h4>
                  <div className="space-y-3">
                    {tasker.recentTasks.slice(0, 3).map((task, index) => (
                      <div key={index} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium text-gray-800">{task.title}</h5>
                            <p className="text-sm text-gray-600">{task.category}</p>
                            {task.customerRating && (
                              <div className="flex items-center mt-1">
                                {renderStars(task.customerRating, 'w-4 h-4')}
                                <span className="text-sm text-gray-600 ml-1">({task.customerRating}/5)</span>
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(task.completedAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

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
                    <div key={review._id || index} className="bg-purple-50 border border-purple-200 rounded-lg p-6">
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
                              {renderStars(review.rating, 'w-4 h-4')}
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
                          {review.taskCategory && <span> • {review.taskCategory}</span>}
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
                    <span className="text-sm break-all">{tasker.email}</span>
                  </div>
                )}
                {tasker.phone && (
                  <div className="flex items-center space-x-3 text-gray-600">
                    <FaPhone className="text-green-500" />
                    <span className="text-sm">{tasker.phone}</span>
                  </div>
                )}
                {tasker.country && (
                  <div className="flex items-center space-x-3 text-gray-600">
                    <FaMapMarkerAlt className="text-red-500" />
                    <span className="text-sm">{tasker.country}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Performance Stats */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Performance Stats</h3>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {tasker.statistics?.completedTasks || 0}
                  </div>
                  <div className="text-sm text-gray-600">Tasks Completed</div>
                </div>
                
                {(tasker.rating || reviewStats) && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {Number(tasker.rating?.average || reviewStats?.averageRating || 0).toFixed(1)}
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
                
                {tasker.statistics?.responseRate && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {tasker.statistics.responseRate}%
                    </div>
                    <div className="text-sm text-gray-600">Response Rate</div>
                  </div>
                )}
                
                {tasker.statistics?.activeTasks !== undefined && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {tasker.statistics.activeTasks}
                    </div>
                    <div className="text-sm text-gray-600">Active Tasks</div>
                  </div>
                )}
                
                {tasker.taskerProfile?.advancePaymentAmount && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(tasker.taskerProfile.advancePaymentAmount)}
                    </div>
                    <div className="text-sm text-gray-600">Advance Payment</div>
                  </div>
                )}
              </div>
            </div>

            {/* Hire Button */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              {tasker.isAvailable ? (
                <button 
                  onClick={() => navigate('/post-task')}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg flex items-center justify-center space-x-2"
                >
                  <FaUserTie />
                  <span>Post a Task</span>
                </button>
              ) : (
                <button 
                  disabled
                  className="w-full bg-gray-400 text-white py-3 rounded-xl font-semibold shadow-lg flex items-center justify-center space-x-2 cursor-not-allowed"
                >
                  <FaClock />
                  <span>Currently Unavailable</span>
                </button>
              )}
              <p className="text-xs text-gray-500 text-center mt-2">
                {tasker.isAvailable 
                  ? 'Create a task to hire this tasker'
                  : 'This tasker is not accepting new tasks right now'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default TaskerProfile; 