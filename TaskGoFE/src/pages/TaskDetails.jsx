import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUsers, FaEye, FaCalendarAlt, FaDollarSign, FaMapMarkerAlt, FaClock, FaUser, FaCheckCircle, FaHourglass, FaTimesCircle, FaComments } from 'react-icons/fa';
import { getTask, applyForTask, getTaskApplications, markTaskComplete, cancelScheduledTask } from '../services/api/taskService';
import { useToast, ToastContainer } from '../components/common/Toast';
import TaskChatWindow from '../components/task/TaskChatWindow';
import ApplyButton from '../components/task/ApplyButton';

// Helper function to get current user from token
const getCurrentUser = () => {
  const token = localStorage.getItem('token');
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

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toasts, removeToast, showSuccess, showError } = useToast();
  const [task, setTask] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatReceiver, setChatReceiver] = useState(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [completionData, setCompletionData] = useState({ rating: 5, review: '', completionNotes: '' });
  const [cancellationReason, setCancellationReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const currentUser = getCurrentUser();

  useEffect(() => {
    fetchTaskDetails();
  }, [id]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const response = await getTask(id);
      setTask(response.data);
      
      // If current user is the task owner, also fetch applications
      if (currentUser && response.data.customer && 
          currentUser._id === response.data.customer._id) {
        await fetchApplications();
      }
    } catch (err) {
      setError('Failed to load task details');
      console.error('Error fetching task:', err);
      showError('Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await getTaskApplications(id);
      setApplications(response.data || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
      // Don't show error for applications as it's secondary content
    }
  };

  const handleApply = async (applicationData) => {
    try {
      setApplying(true);
      await applyForTask(id, applicationData);
      showSuccess('Application submitted successfully!');
      fetchTaskDetails();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to submit application';
      showError(errorMessage);
      console.error('Error applying:', err);
      throw err; // Re-throw to let the modal handle it
    } finally {
      setApplying(false);
    }
  };

  const handleViewAllApplications = () => {
    navigate(`/customer/my-tasks/${id}/applications`);
  };

  const handleChatOpen = (application) => {
    setChatReceiver({
      _id: application.tasker._id,
      name: application.tasker.fullName
    });
    setChatOpen(true);
  };

  const handleMarkComplete = async () => {
    try {
      setActionLoading(true);
      const payload = {};
      
      // If current user is customer, include rating and review
      if (isTaskOwner) {
        if (completionData.rating) payload.rating = completionData.rating;
        if (completionData.review) payload.review = completionData.review;
      }
      
      // If current user is tasker, include completion notes
      if (currentUser && task.selectedTasker && currentUser._id === task.selectedTasker._id) {
        if (completionData.completionNotes) payload.completionNotes = completionData.completionNotes;
      }

      await markTaskComplete(id, payload);
      showSuccess('Task marked as completed successfully!');
      setShowCompleteModal(false);
      await fetchTaskDetails(); // Refresh task data
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to mark task as complete';
      showError(errorMessage);
      console.error('Error marking task complete:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSchedule = async () => {
    try {
      setActionLoading(true);
      await cancelScheduledTask(id, cancellationReason);
      showSuccess('Schedule cancelled successfully. Task is now active again.');
      setShowCancelModal(false);
      setCancellationReason('');
      await fetchTaskDetails(); // Refresh task data
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to cancel schedule';
      showError(errorMessage);
      console.error('Error cancelling schedule:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} weeks ago`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <FaHourglass className="w-4 h-4 text-blue-500" />;
      case 'scheduled':
        return <FaCalendarAlt className="w-4 h-4 text-yellow-500" />;
      case 'completed':
        return <FaCheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <FaTimesCircle className="w-4 h-4 text-red-500" />;
      default:
        return <FaClock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isTaskOwner = currentUser && task && task.customer && 
                     currentUser._id === task.customer._id;
  const canApply = currentUser && currentUser.role === 'tasker' && 
                   task && task.status === 'active' && !isTaskOwner;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            <span className="text-slate-700 font-medium">Loading task details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 text-center max-w-md">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Task Not Found</h2>
          <p className="text-slate-600 mb-6">{error || 'The task you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/tasks')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg transform hover:scale-105 flex items-center space-x-2"
          >
            <FaArrowLeft />
            <span>Back to Tasks</span>
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
            onClick={() => navigate(isTaskOwner ? '/my-tasks' : '/tasks')}
            className="bg-white/70 backdrop-blur-sm border border-white/30 text-slate-700 px-4 py-2 rounded-xl hover:bg-white/90 transition-all duration-300 flex items-center font-medium shadow-lg"
          >
            <FaArrowLeft className="mr-2" />
            {isTaskOwner ? 'Back to My Tasks' : 'Back to Tasks'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Header */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    {getStatusIcon(task.status)}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                    <span className="text-sm text-slate-500">
                      Posted {formatTimeAgo(task.createdAt)}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-slate-800 mb-4">{task.title}</h1>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                    <span className="flex items-center space-x-1">
                      <FaMapMarkerAlt />
                      <span>{task.area}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <FaDollarSign />
                      <span>${task.minPayment} - ${task.maxPayment}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <FaCalendarAlt />
                      <span>{formatDate(task.startDate)} - {formatDate(task.endDate)}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Task Description */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
              <h2 className="text-2xl font-bold mb-6 text-slate-800">Task Description</h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-700 leading-relaxed whitespace-pre-line text-lg">
                  {task.description}
                </p>
              </div>
            </div>

            {/* Task Photos */}
            {task.photos && task.photos.length > 0 && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
                <h3 className="text-xl font-bold mb-6 text-slate-800">Task Photos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {task.photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={photo} 
                        alt={`Task photo ${index + 1}`}
                        className="w-full h-48 object-cover rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-xl transition-all duration-300"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Applications Section for Task Owner */}
            {isTaskOwner && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
                    <FaUsers />
                    <span>Applications ({applications.length})</span>
                  </h3>
                  {applications.length > 0 && (
                    <button
                      onClick={handleViewAllApplications}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <FaEye />
                      <span>View All</span>
                    </button>
                  )}
                </div>

                {applications.length === 0 ? (
                  <div className="text-center py-8">
                    <FaUsers className="text-4xl text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-700 mb-2">No applications yet</h4>
                    <p className="text-gray-600">Your task is still open for applications.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.slice(0, 3).map((application) => (
                      <div key={application._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <FaUser className="text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800">{application.tasker.fullName}</h4>
                              <p className="text-sm text-gray-600">Proposed: ${application.proposedPayment}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {application.confirmedByTasker ? (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                ✓ Available
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                ⏳ Pending
                              </span>
                            )}
                            <button
                              onClick={() => handleChatOpen(application)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <FaComments />
                            </button>
                          </div>
                        </div>
                        {application.note && (
                          <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            {application.note}
                          </p>
                        )}
                      </div>
                    ))}
                    {applications.length > 3 && (
                      <div className="text-center">
                        <button
                          onClick={handleViewAllApplications}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          View {applications.length - 3} more applications
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            {task.customer && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <h3 className="text-lg font-bold mb-4 text-slate-800">Customer Information</h3>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaUser className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{task.customer.fullName}</h4>
                    <p className="text-sm text-gray-600">Customer</p>
                  </div>
                </div>
                {task.customer.rating && typeof task.customer.rating === 'number' && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>Rating:</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(task.customer.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="ml-1">({Number(task.customer.rating).toFixed(1)})</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Task Stats */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <h3 className="text-lg font-bold mb-4 text-slate-800">Task Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="font-medium text-gray-800 capitalize">{task.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Applications</span>
                  <span className="font-medium text-gray-800">{applications.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category</span>
                  <span className="font-medium text-gray-800">{task.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Posted</span>
                  <span className="font-medium text-gray-800">{formatTimeAgo(task.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Apply Button for Taskers */}
            {canApply && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <ApplyButton
                  task={task}
                  onApply={handleApply}
                  applying={applying}
                />
              </div>
            )}

            {/* Task Owner Actions */}
            {isTaskOwner && task.status === 'active' && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <h3 className="text-lg font-bold mb-4 text-slate-800">Task Management</h3>
                <div className="space-y-3">
                  <button
                    onClick={handleViewAllApplications}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <FaUsers />
                    <span>Manage Applications</span>
                  </button>
                  <button
                    onClick={() => navigate(`/edit-task/${id}`)}
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Edit Task
                  </button>
                </div>
              </div>
            )}

            {/* Scheduled Task Actions */}
            {task.status === 'scheduled' && currentUser && (
              (isTaskOwner || (task.selectedTasker && currentUser._id === task.selectedTasker._id)) && (
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                  <h3 className="text-lg font-bold mb-4 text-slate-800">Task Actions</h3>
                  
                  {/* Show scheduled details */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <FaCalendarAlt className="text-yellow-600" />
                      <span className="font-medium text-yellow-800">Task Scheduled</span>
                    </div>
                    {task.agreedTime && (
                      <p className="text-sm text-yellow-700">
                        <strong>Scheduled for:</strong> {formatDate(task.agreedTime)}
                      </p>
                    )}
                    {task.agreedPayment && (
                      <p className="text-sm text-yellow-700">
                        <strong>Agreed payment:</strong> LKR {task.agreedPayment}
                      </p>
                    )}
                    {task.selectedTasker && (
                      <p className="text-sm text-yellow-700">
                        <strong>Tasker:</strong> {task.selectedTasker.fullName}
                      </p>
                    )}
                    
                    {/* Show completion status */}
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${task.taskerCompletedAt ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        <span className="text-sm text-yellow-700">
                          Tasker completion: {task.taskerCompletedAt ? '✓ Completed' : 'Pending'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${task.customerCompletedAt ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        <span className="text-sm text-yellow-700">
                          Customer completion: {task.customerCompletedAt ? '✓ Completed' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => setShowCompleteModal(true)}
                      disabled={isTaskOwner ? task.customerCompletedAt : task.taskerCompletedAt}
                      className={`w-full px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                        (isTaskOwner ? task.customerCompletedAt : task.taskerCompletedAt)
                          ? 'bg-gray-400 text-white cursor-not-allowed' 
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      <FaCheckCircle />
                      <span>
                        {isTaskOwner 
                          ? (task.customerCompletedAt ? 'Already Completed' : 'Mark as Complete')
                          : (task.taskerCompletedAt ? 'Already Completed' : 'Mark as Complete')
                        }
                      </span>
                    </button>
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <FaTimesCircle />
                      <span>Cancel Schedule</span>
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Chat Window */}
      {chatOpen && chatReceiver && (
        <TaskChatWindow
          taskId={id}
          receiverId={chatReceiver._id}
          receiverName={chatReceiver.name}
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          currentUser={currentUser}
        />
      )}

      {/* Complete Task Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Mark Task as Complete</h3>
                <button
                  onClick={() => setShowCompleteModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {/* Show different fields based on user role */}
                {isTaskOwner && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rate the Tasker (1-5 stars)
                      </label>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setCompletionData({...completionData, rating: star})}
                            className={`text-2xl ${
                              star <= completionData.rating ? 'text-yellow-400' : 'text-gray-300'
                            } hover:text-yellow-400 transition-colors`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Review (optional)
                      </label>
                      <textarea
                        value={completionData.review}
                        onChange={(e) => setCompletionData({...completionData, review: e.target.value})}
                        placeholder="Share your experience with this tasker..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows="3"
                      />
                    </div>
                  </>
                )}

                {currentUser && task.selectedTasker && currentUser._id === task.selectedTasker._id && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Completion Notes (optional)
                    </label>
                    <textarea
                      value={completionData.completionNotes}
                      onChange={(e) => setCompletionData({...completionData, completionNotes: e.target.value})}
                      placeholder="Add any notes about the completed task..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                    />
                  </div>
                )}
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowCompleteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleMarkComplete}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {actionLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <>
                      <FaCheckCircle />
                      <span>Complete Task</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Schedule Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Cancel Schedule</h3>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="mb-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <FaTimesCircle className="text-red-600" />
                    <span className="font-medium text-red-800">Cancel this scheduled task?</span>
                  </div>
                  <p className="text-sm text-red-700 mt-1">
                    This will make the task active again and remove the current schedule.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for cancellation (optional)
                  </label>
                  <textarea
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    placeholder="Please provide a reason for canceling the schedule..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    rows="3"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={actionLoading}
                >
                  Keep Schedule
                </button>
                <button
                  onClick={handleCancelSchedule}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {actionLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <>
                      <FaTimesCircle />
                      <span>Cancel Schedule</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default TaskDetails; 