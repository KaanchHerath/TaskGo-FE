import React, { useState } from 'react';
import { 
  FaTimes, 
  FaUser, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaDollarSign, 
  FaClock,
  FaPhone,
  FaEnvelope,
  FaStar,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglass,
  FaPlay,
  FaPause,
  FaTools,
  FaWrench,
  FaCog,
  FaLeaf,
  FaTruck,
  FaPaintBrush,
  FaPlug,
  FaHammer,
  FaExclamationTriangle,
  FaFileAlt,
  FaDownload,
  FaEye,
  FaEdit,
  FaTrash
} from 'react-icons/fa';

const TaskDetails = ({ task, onClose, onStatusUpdate }) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Get status info
  const getStatusInfo = (status) => {
    switch (status) {
      case 'active':
        return { icon: FaPlay, color: 'text-green-600', bgColor: 'bg-green-100', label: 'Active' };
      case 'scheduled':
        return { icon: FaClock, color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Scheduled' };
      case 'in_progress':
        return { icon: FaHourglass, color: 'text-orange-600', bgColor: 'bg-orange-100', label: 'In Progress' };
      case 'completed':
        return { icon: FaCheckCircle, color: 'text-green-600', bgColor: 'bg-green-100', label: 'Completed' };
      case 'cancelled':
        return { icon: FaTimesCircle, color: 'text-red-600', bgColor: 'bg-red-100', label: 'Cancelled' };
      case 'paused':
        return { icon: FaPause, color: 'text-yellow-600', bgColor: 'bg-yellow-100', label: 'Paused' };
      default:
        return { icon: FaClock, color: 'text-gray-600', bgColor: 'bg-gray-100', label: status };
    }
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    const categoryLower = category?.toLowerCase() || '';
    
    if (categoryLower.includes('cleaning')) return FaTools;
    if (categoryLower.includes('repair')) return FaWrench;
    if (categoryLower.includes('maintenance')) return FaCog;
    if (categoryLower.includes('gardening')) return FaLeaf;
    if (categoryLower.includes('moving')) return FaTruck;
    if (categoryLower.includes('painting')) return FaPaintBrush;
    if (categoryLower.includes('electrical')) return FaPlug;
    if (categoryLower.includes('plumbing')) return FaWrench;
    if (categoryLower.includes('carpentry')) return FaHammer;
    if (categoryLower.includes('delivery')) return FaTruck;
    
    return FaTools;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return `LKR ${parseInt(amount).toLocaleString()}`;
  };

  // Format time ago
  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'N/A';
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return 'Yesterday';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const statusInfo = getStatusInfo(task.status);
  const StatusIcon = statusInfo.icon;
  const CategoryIcon = getCategoryIcon(task.category);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaEye },
    { id: 'customer', label: 'Customer Info', icon: FaUser },
    { id: 'tasker', label: 'Tasker Info', icon: FaUser },
    { id: 'applications', label: 'Applications', icon: FaFileAlt },
    { id: 'timeline', label: 'Timeline', icon: FaClock }
  ];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CategoryIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{task.title}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                  <StatusIcon className="mr-1 h-3 w-3" />
                  {statusInfo.label}
                </span>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-500">{task.category}</span>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-500">{formatTimeAgo(task.createdAt)}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <TabIcon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="p-6 space-y-6">
              {/* Task Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Task Information</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                        {task.description || 'No description provided'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <p className="mt-1 text-sm text-gray-900">{task.category}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Location</label>
                        <p className="mt-1 text-sm text-gray-900 flex items-center">
                          <FaMapMarkerAlt className="mr-1 text-gray-400" />
                          {task.area}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Budget Range</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {formatCurrency(task.minPayment)} - {formatCurrency(task.maxPayment)}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Agreed Payment</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {task.agreedPayment ? formatCurrency(task.agreedPayment) : 'Not agreed'}
                        </p>
                      </div>
                    </div>

                    {task.startDate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Scheduled Date</label>
                        <p className="mt-1 text-sm text-gray-900 flex items-center">
                          <FaCalendarAlt className="mr-1 text-gray-400" />
                          {formatDate(task.startDate)}
                        </p>
                      </div>
                    )}

                    {task.adminNotes && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Admin Notes</label>
                        <p className="mt-1 text-sm text-gray-900 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                          {task.adminNotes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {task.applicationCount || 0}
                      </div>
                      <div className="text-sm text-blue-700">Applications</div>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {task.status === 'completed' ? 'Yes' : 'No'}
                      </div>
                      <div className="text-sm text-green-700">Completed</div>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {task.selectedTasker || task.targetedTasker ? 'Yes' : 'No'}
                      </div>
                      <div className="text-sm text-purple-700">Assigned</div>
                    </div>
                    
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {task.isTargeted ? 'Yes' : 'No'}
                      </div>
                      <div className="text-sm text-orange-700">Direct Hire</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Timeline</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Created:</span>
                        <span className="text-gray-900">{formatDate(task.createdAt)}</span>
                      </div>
                      {task.updatedAt && task.updatedAt !== task.createdAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Updated:</span>
                          <span className="text-gray-900">{formatDate(task.updatedAt)}</span>
                        </div>
                      )}
                      {task.completedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Completed:</span>
                          <span className="text-gray-900">{formatDate(task.completedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Customer Info Tab */}
          {activeTab === 'customer' && task.customer && (
            <div className="p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Customer Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="text-gray-900">{task.customer.fullName}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="text-gray-900">{task.customer.phone || 'N/A'}</span>
                      </div>
                      
                    </div>
                  </div>

                  {task.customer.statistics && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Customer Statistics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tasks Posted:</span>
                          <span className="text-gray-900">{task.customer.statistics.tasksPosted || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tasks Completed:</span>
                          <span className="text-gray-900">{task.customer.statistics.tasksCompleted || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Spent:</span>
                          <span className="text-gray-900">{formatCurrency(task.customer.statistics.totalSpent || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rating:</span>
                          <span className="text-gray-900 flex items-center">
                            <FaStar className="text-yellow-400 mr-1" />
                            {task.customer.rating || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Contact Actions</h4>
                    <div className="space-y-2">
                      <button className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                        <FaEnvelope className="h-4 w-4" />
                        <span>Send Email</span>
                      </button>
                      <button className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        <FaPhone className="h-4 w-4" />
                        <span>Call Customer</span>
                      </button>
                    </div>
                  </div>

                 
                </div>
              </div>
            </div>
          )}

          {/* Tasker Info Tab */}
          {activeTab === 'tasker' && (
            <div className="p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Tasker Information</h3>
              
              {task.selectedTasker || task.targetedTasker ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(() => {
                    const tasker = task.selectedTasker || task.targetedTasker;
                    return (
                      <>
                        <div className="space-y-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Name:</span>
                                <span className="text-gray-900">{tasker.fullName}</span>
                              </div>
                             
                              <div className="flex justify-between">
                                <span className="text-gray-600">Phone:</span>
                                <span className="text-gray-900">{tasker.phone || 'N/A'}</span>
                              </div>
                              
                            </div>
                          </div>

                          {tasker.taskerProfile && (
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <h4 className="font-medium text-gray-900 mb-3">Tasker Profile</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Location:</span>
                                  <span className="text-gray-900">
                                    {tasker.taskerProfile.district}, {tasker.taskerProfile.province}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Hourly Rate:</span>
                                  <span className="text-gray-900">{formatCurrency(tasker.taskerProfile.hourlyRate)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Experience:</span>
                                  <span className="text-gray-900">{tasker.taskerProfile.experience || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Skills:</span>
                                  <span className="text-gray-900">
                                    {tasker.taskerProfile.skills?.join(', ') || 'N/A'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">
                          {tasker.statistics && (
                            <div className="bg-green-50 p-4 rounded-lg">
                              <h4 className="font-medium text-gray-900 mb-3">Tasker Statistics</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Tasks Completed:</span>
                                  <span className="text-gray-900">{tasker.statistics.tasksCompleted || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Total Earnings:</span>
                                  <span className="text-gray-900">{formatCurrency(tasker.statistics.totalEarnings || 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Rating:</span>
                                  <span className="text-gray-900 flex items-center">
                                    <FaStar className="text-yellow-400 mr-1" />
                                    {tasker.rating || 'N/A'}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Approval Status:</span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    tasker.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {tasker.isApproved ? 'Approved' : 'Pending'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="bg-purple-50 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-3">Contact Actions</h4>
                            <div className="space-y-2">
                              <button className="w-full flex items-center justify-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                                <FaEnvelope className="h-4 w-4" />
                                <span>Send Email</span>
                              </button>
                              <button className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                <FaPhone className="h-4 w-4" />
                                <span>Call Tasker</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaUser className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Tasker Assigned</h3>
                  <p className="text-gray-500">This task has not been assigned to a tasker yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === 'applications' && (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Task Applications</h3>
                <span className="text-sm text-gray-500">{task.applicationCount || (task.applications?.length || 0)} applications</span>
              </div>
              {(() => {
                const apps = (task.relatedData?.recentApplications && task.relatedData.recentApplications.length > 0)
                  ? task.relatedData.recentApplications
                  : (task.applications || []);
                return apps.length > 0 ? (
                  <div className="space-y-4">
                    {apps.map((application, index) => (
                      <div key={application._id || index} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <FaUser className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{application.tasker?.fullName}</h4>
                              <p className="text-sm text-gray-500">{application.tasker?.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(application.proposedPayment || application.confirmedPayment)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDate(application.createdAt)}
                            </div>
                          </div>
                        </div>
                        {(application.message || application.note) && (
                          <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                            <p className="text-sm text-gray-700">{application.message || application.note}</p>
                          </div>
                        )}
                        <div className="mt-3 flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-4">
                            
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              application.confirmedByTasker ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {application.confirmedByTasker ? 'Confirmed' : 'Pending'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FaFileAlt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications</h3>
                    <p className="text-gray-500">This task has not received any applications yet.</p>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div className="p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Task Timeline</h3>
              
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  
                  {/* Task Created */}
                  <div className="relative flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <FaCheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">Task Created</div>
                      <div className="text-sm text-gray-500">{formatDate(task.createdAt)}</div>
                      <div className="mt-1 text-sm text-gray-700">
                        Task "{task.title}" was created by {task.customer?.fullName}
                      </div>
                    </div>
                  </div>

                  {/* Tasker Assigned */}
                  {(task.selectedTasker || task.targetedTasker) && (
                    <div className="relative flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <FaUser className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">Tasker Assigned</div>
                        <div className="text-sm text-gray-500">
                          {task.selectedTasker ? formatDate(task.selectedTasker.assignedAt) : 'Direct hire'}
                        </div>
                        <div className="mt-1 text-sm text-gray-700">
                          {task.selectedTasker?.fullName || task.targetedTasker?.fullName} was assigned to this task
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Status Changes */}
                  {task.status !== 'active' && (
                    <div className="relative flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <StatusIcon className="h-4 w-4 text-orange-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">Status Changed</div>
                        <div className="text-sm text-gray-500">
                          {task.updatedAt ? formatDate(task.updatedAt) : 'Recently'}
                        </div>
                        <div className="mt-1 text-sm text-gray-700">
                          Task status changed to {statusInfo.label}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Task Completed */}
                  {task.status === 'completed' && task.completedAt && (
                    <div className="relative flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <FaCheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">Task Completed</div>
                        <div className="text-sm text-gray-500">{formatDate(task.completedAt)}</div>
                        <div className="mt-1 text-sm text-gray-700">
                          Task was marked as completed
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Admin Notes */}
                  {task.adminNotes && (
                    <div className="relative flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <FaExclamationTriangle className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">Admin Note Added</div>
                        <div className="text-sm text-gray-500">Recently</div>
                        <div className="mt-1 text-sm text-gray-700 bg-yellow-50 p-2 rounded">
                          {task.adminNotes}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-2">
    
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails; 