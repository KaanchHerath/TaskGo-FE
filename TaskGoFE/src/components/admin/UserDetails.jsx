import React, { useState, useEffect } from 'react';
import { 
  FaTimes, 
  FaUser, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaCalendarAlt,
  FaClock,
  FaShieldAlt,
  FaUserSlash,
  FaTrash,
  FaCheck,
  FaTimes as FaReject,
  FaExclamationTriangle,
  FaInfoCircle,
  FaHistory,
  FaChartLine,
  FaStar,
  FaMoneyBillWave,
  FaBriefcase,
  FaGraduationCap,
  FaFileAlt,
  FaDownload,
  FaEye
} from 'react-icons/fa';
import { getUserDetails } from '../../services/api/adminService';

const UserDetails = ({ user, onClose, onSuspend, onDelete }) => {
  const [userDetails, setUserDetails] = useState(user);
  const [loading, setLoading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);

  // Fetch detailed user information
  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await getUserDetails(user._id);
      setUserDetails(response);
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [user._id]);

  const handleViewDocument = (documentUrl, documentType) => {
    setSelectedDocument({ url: documentUrl, type: documentType });
    setShowDocumentViewer(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800',
      customer: 'bg-blue-100 text-blue-800',
      tasker: 'bg-green-100 text-green-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getUserStatus = () => {
    if (userDetails.isSuspended) return 'suspended';
    if (userDetails.isApproved === false) return 'pending';
    return 'active';
  };

  const getActivityStats = () => {
    return {
      totalTasks: userDetails.totalTasks || 0,
      completedTasks: userDetails.completedTasks || 0,
      totalEarnings: userDetails.totalEarnings || 0,
      averageRating: userDetails.averageRating || 0,
      lastActive: userDetails.lastActive || null,
      loginCount: userDetails.loginCount || 0
    };
  };

  const activityStats = getActivityStats();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
            <p className="text-gray-600 mt-1">Comprehensive user information and activity</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading user details...</span>
            </div>
          ) : (
            <>
              {/* Basic Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaUser className="w-5 h-5 mr-2" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="mt-1 text-sm text-gray-900">{userDetails.fullName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900 flex items-center">
                      <FaEnvelope className="w-4 h-4 mr-2 text-gray-400" />
                      {userDetails.email}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-sm text-gray-900 flex items-center">
                      <FaPhone className="w-4 h-4 mr-2 text-gray-400" />
                      {userDetails.phone}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <p className="mt-1 text-sm text-gray-900 flex items-center">
                      <FaMapMarkerAlt className="w-4 h-4 mr-2 text-gray-400" />
                      {userDetails.province}, {userDetails.district}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(userDetails.role)}`}>
                      {userDetails.role?.charAt(0).toUpperCase() + userDetails.role?.slice(1)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(getUserStatus())}`}>
                      {getUserStatus().charAt(0).toUpperCase() + getUserStatus().slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaShieldAlt className="w-5 h-5 mr-2" />
                  Account Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Registration Date</label>
                    <p className="mt-1 text-sm text-gray-900 flex items-center">
                      <FaCalendarAlt className="w-4 h-4 mr-2 text-gray-400" />
                      {formatDate(userDetails.createdAt)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Active</label>
                    <p className="mt-1 text-sm text-gray-900 flex items-center">
                      <FaClock className="w-4 h-4 mr-2 text-gray-400" />
                      {formatDate(userDetails.lastActive)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Login Count</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {activityStats.loginCount} times
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email Verified</label>
                    <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      userDetails.isEmailVerified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {userDetails.isEmailVerified ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Activity Statistics */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaChartLine className="w-5 h-5 mr-2" />
                  Activity Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center">
                      <FaBriefcase className="w-6 h-6 text-blue-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">Total Tasks</p>
                        <p className="text-lg font-semibold text-gray-900">{activityStats.totalTasks}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center">
                      <FaCheck className="w-6 h-6 text-green-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">Completed</p>
                        <p className="text-lg font-semibold text-gray-900">{activityStats.completedTasks}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center">
                      <FaMoneyBillWave className="w-6 h-6 text-green-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">Total Earnings</p>
                        <p className="text-lg font-semibold text-gray-900">${activityStats.totalEarnings}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center">
                      <FaStar className="w-6 h-6 text-yellow-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">Avg Rating</p>
                        <p className="text-lg font-semibold text-gray-900">{activityStats.averageRating.toFixed(1)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tasker Profile (if applicable) */}
              {userDetails.role === 'tasker' && userDetails.taskerProfile && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaGraduationCap className="w-5 h-5 mr-2" />
                    Tasker Profile
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Experience</label>
                      <p className="mt-1 text-sm text-gray-900">{userDetails.taskerProfile.experience || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Hourly Rate</label>
                      <p className="mt-1 text-sm text-gray-900">${userDetails.taskerProfile.hourlyRate || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Available for Work</label>
                      <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        userDetails.taskerProfile.isAvailable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {userDetails.taskerProfile.isAvailable ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Approval Status</label>
                      <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        userDetails.isApproved 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {userDetails.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                      <div className="flex flex-wrap gap-2">
                        {userDetails.taskerProfile.skills?.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                      <p className="text-sm text-gray-900 bg-white p-3 rounded border">
                        {userDetails.taskerProfile.bio || 'No bio provided'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Documents (for taskers) */}
              {userDetails.role === 'tasker' && userDetails.taskerProfile && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaFileAlt className="w-5 h-5 mr-2" />
                    Documents
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* ID Document */}
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">ID Document</h4>
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                          Required
                        </span>
                      </div>
                      {userDetails.taskerProfile.idDocument ? (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            {userDetails.taskerProfile.idDocument.split('/').pop()}
                          </p>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewDocument(userDetails.taskerProfile.idDocument, 'ID Document')}
                              className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              <FaEye className="w-4 h-4 mr-1" />
                              View
                            </button>
                            <a
                              href={userDetails.taskerProfile.idDocument}
                              download
                              className="flex items-center px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                            >
                              <FaDownload className="w-4 h-4 mr-1" />
                              Download
                            </a>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-red-600">No ID document uploaded</p>
                      )}
                    </div>

                    {/* Qualification Documents */}
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">Qualification Documents</h4>
                        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                          Optional
                        </span>
                      </div>
                      {userDetails.taskerProfile.qualificationDocuments?.length > 0 ? (
                        <div className="space-y-2">
                          {userDetails.taskerProfile.qualificationDocuments.map((doc, index) => (
                            <div key={index} className="border-t pt-2">
                              <p className="text-sm text-gray-600">
                                {doc.split('/').pop()}
                              </p>
                              <div className="flex space-x-2 mt-1">
                                <button
                                  onClick={() => handleViewDocument(doc, `Qualification Document ${index + 1}`)}
                                  className="flex items-center px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                >
                                  <FaEye className="w-3 h-3 mr-1" />
                                  View
                                </button>
                                <a
                                  href={doc}
                                  download
                                  className="flex items-center px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                                >
                                  <FaDownload className="w-3 h-3 mr-1" />
                                  Download
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No qualification documents uploaded</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaHistory className="w-5 h-5 mr-2" />
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {userDetails.recentActivity?.length > 0 ? (
                    userDetails.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3 bg-white p-3 rounded border">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{activity.description}</p>
                          <p className="text-xs text-gray-500">{formatDate(activity.timestamp)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end space-x-4 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          {userDetails.isSuspended ? (
            <button
              onClick={onSuspend}
              className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <FaCheck className="w-4 h-4 mr-2" />
              Unsuspend User
            </button>
          ) : (
            <button
              onClick={onSuspend}
              className="px-4 py-2 text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 transition-colors flex items-center"
            >
              <FaUserSlash className="w-4 h-4 mr-2" />
              Suspend User
            </button>
          )}
          <button
            onClick={onDelete}
            className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center"
          >
            <FaTrash className="w-4 h-4 mr-2" />
            Delete User
          </button>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {showDocumentViewer && selectedDocument && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{selectedDocument.type}</h3>
              <button
                onClick={() => setShowDocumentViewer(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4">
              <iframe
                src={selectedDocument.url}
                className="w-full h-96 border border-gray-200 rounded"
                title={selectedDocument.type}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetails; 