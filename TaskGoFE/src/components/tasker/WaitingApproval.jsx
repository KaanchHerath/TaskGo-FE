import React, { useState, useEffect } from 'react';
import { 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaExclamationTriangle,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaFileAlt,
  FaEdit,
  FaSpinner,
  FaArrowLeft,
  FaRedo,
  FaCalendarAlt,
  FaInfoCircle,
  FaQuestionCircle
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getApprovalStatus } from '../../services/api/userService';
import { getToken } from '../../utils/auth';

const WaitingApproval = () => {
  const [approvalData, setApprovalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  // Get current user from token
  const getCurrentUser = () => {
    const token = getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return { _id: payload.userId, role: payload.role };
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  // Fetch approval status
  const fetchApprovalStatus = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await getApprovalStatus();
      setApprovalData(response.data);
    } catch (err) {
      console.error('Error fetching approval status:', err);
      setError('Failed to load approval status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Refresh approval status
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchApprovalStatus();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchApprovalStatus();
  }, []);

  // Get status info
  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return {
          icon: FaClock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          title: 'Pending Approval',
          description: 'Your application is under review'
        };
      case 'rejected':
        return {
          icon: FaTimesCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          title: 'Application Rejected',
          description: 'Your application was not approved'
        };
      case 'approved':
        return {
          icon: FaCheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          title: 'Approved',
          description: 'Your application has been approved'
        };
      default:
        return {
          icon: FaClock,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          title: 'Unknown Status',
          description: 'Status information unavailable'
        };
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Recently';
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour(s) ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day(s) ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} week(s) ago`;
  };

  // Calculate estimated wait time
  const getEstimatedWaitTime = (daysSinceRegistration) => {
    if (daysSinceRegistration <= 1) return '1-2 business days';
    if (daysSinceRegistration <= 3) return '2-3 business days';
    if (daysSinceRegistration <= 5) return '3-5 business days';
    return '5-7 business days';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
          <div className="flex items-center space-x-4">
            <FaSpinner className="animate-spin text-2xl text-blue-600" />
            <span className="text-slate-700 font-medium">Loading approval status...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 max-w-md w-full">
          <div className="text-center">
            <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Status</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={handleRefresh}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!approvalData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
          <div className="text-center">
            <FaExclamationTriangle className="text-4xl text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Approval Data</h2>
            <p className="text-gray-600 mb-6">Unable to load your approval status.</p>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(approvalData.approvalStatus);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 text-sm">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Tasker Approval Status</h1>
                <p className="text-gray-600 text-xs">Track your application progress</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
                              <FaRedo className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Main Status Card */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-6">
          <div className="p-4">
            <div className="flex items-center space-x-4 mb-6">
              <div className={`p-4 ${statusInfo.bgColor} rounded-xl`}>
                <StatusIcon className={`h-8 w-8 ${statusInfo.color}`} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{statusInfo.title}</h2>
                <p className="text-gray-600 text-xs">{statusInfo.description}</p>
              </div>
            </div>

            {/* Status-specific content */}
            {approvalData.approvalStatus === 'pending' && (
              <div className="space-y-4">
                {/* Progress indicator */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-base font-semibold text-blue-900 mb-3 flex items-center">
                    <FaClock className="mr-2" />
                    Application Progress
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <FaCheckCircle className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-blue-900">Application Submitted</p>
                        <p className="text-sm text-blue-700">
                          {formatTimeAgo(approvalData.additionalInfo?.daysSinceRegistration ? 
                            new Date(Date.now() - (approvalData.additionalInfo.daysSinceRegistration * 24 * 60 * 60 * 1000)) : 
                            new Date())}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                        <FaSpinner className="h-4 w-4 text-white animate-spin" />
                      </div>
                      <div>
                        <p className="font-medium text-yellow-900">Under Review</p>
                        <p className="text-sm text-yellow-700">Admin team is reviewing your application</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 opacity-50">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <FaCheckCircle className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-600">Approval Decision</p>
                        <p className="text-sm text-gray-500">You'll be notified of the decision</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Estimated wait time */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="text-base font-semibold text-yellow-900 mb-3 flex items-center">
                    <FaCalendarAlt className="mr-2" />
                    Estimated Processing Time
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-yellow-700">Current wait time:</p>
                      <p className="text-lg font-semibold text-yellow-900">
                        {getEstimatedWaitTime(approvalData.additionalInfo?.daysSinceRegistration || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-yellow-700">Days since registration:</p>
                      <p className="text-lg font-semibold text-yellow-900">
                        {approvalData.additionalInfo?.daysSinceRegistration || 0} days
                      </p>
                    </div>
                  </div>
                </div>

                {/* What you can do while waiting */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-base font-semibold text-green-900 mb-3 flex items-center">
                    <FaEdit className="mr-2" />
                    While You Wait
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-3">
                      <FaCheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900">Update Your Profile</p>
                        <p className="text-sm text-green-700">Keep your information current and complete</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <FaCheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900">Prepare Documents</p>
                        <p className="text-sm text-green-700">Ensure all required documents are uploaded</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <FaCheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900">Review Platform</p>
                        <p className="text-sm text-green-700">Familiarize yourself with how TaskGo works</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {approvalData.approvalStatus === 'rejected' && (
              <div className="space-y-6">
                {/* Rejection reason */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-base font-semibold text-red-900 mb-3 flex items-center">
                    <FaTimesCircle className="mr-2" />
                    Rejection Reason
                  </h3>
                  <div className="bg-white border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">
                      {approvalData.rejectionReason || 'No specific reason provided'}
                    </p>
                  </div>
                </div>

                {/* Next steps */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-base font-semibold text-blue-900 mb-3 flex items-center">
                    <FaInfoCircle className="mr-2" />
                    Next Steps
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <FaEdit className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900">Update Your Application</p>
                        <p className="text-sm text-blue-700">
                          Address the issues mentioned in the rejection reason
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <FaEnvelope className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900">Contact Support</p>
                        <p className="text-sm text-blue-700">
                          Reach out to our support team for guidance on reapplying
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <FaFileAlt className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900">Reapply When Ready</p>
                        <p className="text-sm text-blue-700">
                          Submit a new application once you've addressed the concerns
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {approvalData.approvalStatus === 'approved' && (
              <div className="space-y-6">
                {/* Approval details */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                    <FaCheckCircle className="mr-2" />
                    Congratulations!
                  </h3>
                  <div className="space-y-4">
                    <p className="text-green-800">
                      Your application has been approved! You can now start accepting tasks and earning money.
                    </p>
                    {approvalData.approvedAt && (
                      <div className="bg-white border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-700">
                          <strong>Approved on:</strong> {new Date(approvalData.approvedAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Next steps */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                    <FaInfoCircle className="mr-2" />
                    Get Started
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <FaUser className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900">Complete Your Profile</p>
                        <p className="text-sm text-blue-700">Add your skills, experience, and availability</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <FaFileAlt className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900">Browse Available Tasks</p>
                        <p className="text-sm text-blue-700">Find tasks that match your skills and schedule</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <FaCheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900">Start Earning</p>
                        <p className="text-sm text-blue-700">Apply to tasks and begin your journey</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action button */}
                <div className="text-center">
                  <button
                    onClick={() => navigate('/tasker/dashboard', { replace: true })}
                    className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Support Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
          <div className="p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <FaQuestionCircle className="mr-2 text-blue-600" />
              Need Help?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                  <FaEnvelope className="mr-2" />
                  Email Support
                </h4>
                <p className="text-blue-700 text-sm mb-3">
                  Send us an email for detailed assistance with your application.
                </p>
                <a
                  href="mailto:support@taskgo.com"
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  support@taskgo.com
                </a>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                  <FaPhone className="mr-2" />
                  Phone Support
                </h4>
                <p className="text-green-700 text-sm mb-3">
                  Call us for immediate assistance with your application.
                </p>
                <a
                  href="tel:+1234567890"
                  className="text-green-600 hover:text-green-800 font-medium text-sm"
                >
                  +94 (11) 5675-890
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingApproval; 