import React, { useState, useEffect } from 'react';
import { FaStar, FaUser, FaAward, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { feedbackService } from '../../services/api/feedbackService';

const RecentReviews = ({ 
  title = "Recent Reviews", 
  limit = 6, 
  showType = true,
  className = "",
  cardStyle = "default",
  transparent = false,
  pill = false,
  pillSize = 'md',
  density = "comfortable" // density can further tighten spacing
}) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecentReviews();
  }, [limit]);

  const fetchRecentReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await feedbackService.getRecentReviews({ limit });
      setReviews(response.data || []);
    } catch (err) {
      console.error('Error fetching recent reviews:', err);
      setError('Failed to load recent reviews');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            className={`w-3 h-3 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating}/5)</span>
      </div>
    );
  };

  const getReviewerInfo = (review) => {
    if (review.feedbackType === 'customer-to-tasker') {
      return {
        reviewer: review.fromUser,
        reviewee: review.toUser,
        reviewerLabel: 'Customer',
        revieweeLabel: 'Tasker',
        reviewerColor: 'text-blue-600',
        revieweeColor: 'text-green-600'
      };
    } else {
      return {
        reviewer: review.fromUser,
        reviewee: review.toUser,
        reviewerLabel: 'Tasker',
        revieweeLabel: 'Customer',
        reviewerColor: 'text-green-600',
        revieweeColor: 'text-blue-600'
      };
    }
  };

  const isCompact = density === 'compact' || cardStyle === 'compact';
  const getPillClasses = (size) => {
    switch (size) {
      case 'sm':
        return `${isCompact ? 'p-4' : 'p-6'} bg-white/40 backdrop-blur-md border border-white/30 rounded-2xl shadow-lg`;
      case 'lg':
        return `${isCompact ? 'p-8' : 'p-10'} bg-white/50 backdrop-blur-lg border border-white/40 rounded-[2.5rem] shadow-2xl`;
      case 'md':
      default:
        return `${isCompact ? 'p-6' : 'p-8'} bg-white/45 backdrop-blur-md border border-white/30 rounded-[2rem] shadow-xl`;
    }
  };

  if (loading) {
    return (
      <div className={`${pill ? getPillClasses(pillSize) : ''} ${transparent ? 'bg-transparent border border-white/30 shadow-none' : 'bg-white rounded-xl shadow-sm border border-gray-100'} ${isCompact ? 'p-5' : 'p-6'} ${className}`}>
        <div className="flex items-center justify-center py-12">
          <FaSpinner className="w-6 h-6 text-gray-400 animate-spin mr-3" />
          <p className="text-gray-600">Loading recent reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${pill ? getPillClasses(pillSize) : ''} ${transparent ? 'bg-transparent border border-white/30 shadow-none' : 'bg-white rounded-xl shadow-sm border border-gray-100'} ${isCompact ? 'p-5' : 'p-6'} ${className}`}>
        <div className="flex items-center justify-center py-12">
          <FaExclamationTriangle className="w-6 h-6 text-red-400 mr-3" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className={`${pill ? getPillClasses(pillSize) : ''} ${transparent ? 'bg-transparent border border-white/30 shadow-none' : 'bg-white rounded-xl shadow-sm border border-gray-100'} ${isCompact ? 'p-5' : 'p-6'} ${className}`}>
        <h3 className={`${isCompact ? 'text-base' : 'text-lg'} font-semibold text-gray-800 mb-4 flex items-center`}>
          <FaAward className="text-purple-600 mr-2" />
          {title}
        </h3>
        <div className="text-center py-10">
          <FaAward className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No reviews available yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${pill ? getPillClasses(pillSize) : ''} ${transparent ? 'bg-transparent border border-white/30 shadow-none' : 'bg-white rounded-xl shadow-sm border border-gray-100'} ${isCompact ? 'p-5' : 'p-6'} ${className}`}>
      <div className={`flex items-center justify-between ${isCompact ? 'mb-4' : 'mb-6'}`}>
        <h3 className={`${isCompact ? 'text-base' : 'text-lg'} font-semibold text-gray-800 flex items-center`}>
          <FaAward className="text-purple-600 mr-2" />
          {title} ({reviews.length})
        </h3>
        <button
          onClick={fetchRecentReviews}
          className="text-sm text-purple-600 hover:text-purple-700 transition-colors"
        >
          Refresh
        </button>
      </div>
      
      <div className={`${isCompact ? 'space-y-3' : 'space-y-4'} max-h-96 overflow-y-auto`}>
        {reviews.map((review) => {
          const reviewInfo = getReviewerInfo(review);
          
          return (
            <div key={review._id} className={`bg-gray-50 border border-gray-200 rounded-lg ${isCompact ? 'p-3.5' : 'p-4'} hover:shadow-sm transition-shadow`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3">
                  <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaUser className="text-purple-600 text-sm" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h5 className={`font-medium text-gray-800 truncate ${isCompact ? 'text-sm' : ''}`}>
                        {reviewInfo.reviewer?.fullName || 'Anonymous'}
                      </h5>
                      {showType && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full bg-gray-100 ${reviewInfo.reviewerColor}`}>
                          {reviewInfo.reviewerLabel}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mb-1">
                      {renderStars(review.rating)}
                    </div>
                    {showType && (
                      <p className="text-xs text-gray-500">
                        Reviewed {reviewInfo.revieweeLabel}: <span className={reviewInfo.revieweeColor}>
                          {reviewInfo.reviewee?.fullName || 'Anonymous'}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {formatTimeAgo(review.createdAt)}
                </span>
              </div>
              
              {review.review && review.review !== 'No review provided' && (
                <p className="text-gray-700 text-sm italic mb-2 pl-13">
                  "{review.review}"
                </p>
              )}
              
              {review.task && (
                <div className="pl-13">
                  <p className="text-xs text-gray-500">
                    <strong>Task:</strong> {review.task.title}
                    {review.task.category && <span> • {review.task.category}</span>}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {reviews.length >= limit && (
        <div className="text-center mt-4">
          <button className="text-sm text-purple-600 hover:text-purple-700 transition-colors">
            View All Reviews
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentReviews;
