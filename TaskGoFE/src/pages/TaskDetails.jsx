import React, { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaUser, 
  FaStar, 
  FaMapMarkerAlt, 
  FaDollarSign, 
  FaClock, 
  FaCalendarAlt, 
  FaUsers, 
  FaCheckCircle, 
  FaTimes, 
  FaEdit, 
  FaTrash, 
  FaComments, 
  FaPhone, 
  FaEnvelope, 
  FaUserTie, 
  FaHandshake,
  FaEye,
  FaCheck
} from 'react-icons/fa';
import BackToTasksButton from '../components/common/BackToTasksButton';
import { getTask, applyForTask, getTaskApplications, markTaskComplete, cancelScheduledTask, selectTasker } from '../services/api/taskService';
import { useToast, ToastContainer } from '../components/common/Toast';
import TaskChatWindow from '../components/task/TaskChatWindow';
import ApplyButton from '../components/task/ApplyButton';
import { getTaskerProfile, getTaskerReviews } from '../services/api/taskerService';
import Modal from '../components/common/Modal';
import PaymentModal from '../components/common/PaymentModal';
import SelectTaskerModal from '../components/task/SelectTaskerModal';
import TaskerProfilePopup from '../components/task/TaskerProfilePopup';

// Helper function to get current user from token
import { getToken } from '../utils/auth';
const getCurrentUser = () => {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { _id: payload.userId, role: payload.role };
  } catch (e) {
    return null;
  }
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
  const [taskerProfile, setTaskerProfile] = useState(null);
  const [taskerReviews, setTaskerReviews] = useState([]);
  const [loadingTaskerData, setLoadingTaskerData] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showSelectTaskerModal, setShowSelectTaskerModal] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [selectedTaskerId, setSelectedTaskerId] = useState(null);
  const [selectedTaskerName, setSelectedTaskerName] = useState('');
  const currentUser = getCurrentUser();
  const isTasker = currentUser?.role === 'tasker';
  const backgroundGradient = isTasker
    ? 'bg-gradient-to-br from-[#48d669af] via-[#d8dad898] to-[#498f649f]'
    : 'bg-gradient-to-br from-sky-100 via-blue-200 to-indigo-200';
  const getApiBaseUrl = () => {
    let base = 'http://localhost:5000';
    try {
      if (typeof import.meta !== 'undefined' && import.meta.env) {
        base = import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL || base;
      }
    } catch (_) {}
    if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) {
      base = process.env.REACT_APP_API_URL;
    }
    return base;
  };
  const API_BASE_URL = getApiBaseUrl();

  // Define computed values before useEffect hooks
  const isTaskOwner = currentUser && task && task.customer && 
                     currentUser._id === task.customer._id;
  const canApply = currentUser && currentUser.role === 'tasker' && 
                   task && task.status === 'active' && !isTaskOwner;
  const isTargetedTask = task?.isTargeted;
  const isTargetedTasker = isTargetedTask && task?.targetedTasker?._id === currentUser?._id;
  
  // Get the current tasker (either selected or targeted)
  const currentTasker = isTargetedTask ? task?.targetedTasker : task?.selectedTasker;

  // Check if payment needs to be retried (task has selected tasker but no advance payment)
  const needsPaymentRetry = task && 
                           task.status === 'active' && 
                           task.selectedTasker && 
                           (!task.advancePaymentStatus || task.advancePaymentStatus === 'pending') &&
                           isTaskOwner;

  useEffect(() => {
    fetchTaskDetails();
  }, [id]);

  // Add polling for direct hire tasks to check for tasker confirmation
  useEffect(() => {
    let intervalId = null;
    
    // Only poll for direct hire tasks that are active and owned by current user
    if (task && task.isTargeted && task.status === 'active' && isTaskOwner) {
      intervalId = setInterval(() => {
        fetchTaskDetails();
      }, 30000); // Poll every 30 seconds (reduced frequency)
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [task, isTaskOwner]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const response = await getTask(id);
      setTask(response.data);
      
      // If current user is the task owner, fetch applications (for both regular and targeted tasks)
      if (currentUser && response.data.customer && 
          currentUser._id === response.data.customer._id) {
        await fetchApplications();
      }

      // If there's a selected tasker or targeted tasker, fetch their profile and reviews
      const taskerId = response.data.selectedTasker?._id || 
                      (response.data.isTargeted ? response.data.targetedTasker?._id : null);
      if (taskerId) {
        await fetchTaskerProfile(taskerId);
      }
    } catch (err) {
      setError('Failed to load task details');
      console.error('Error fetching task:', err);
      showError('Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskerProfile = async (taskerId) => {
    try {
      setLoadingTaskerData(true);
      // Fetch tasker profile
      const profileData = await getTaskerProfile(taskerId);
      setTaskerProfile(profileData.data);
      // Fetch tasker reviews/feedback
      const reviewsData = await getTaskerReviews(taskerId);
      setTaskerReviews(reviewsData.data || []);
    } catch (err) {
      console.error('Error fetching tasker profile:', err);
      // Don't show error for tasker profile as it's secondary content
    } finally {
      setLoadingTaskerData(false);
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

  const handleViewTaskerProfile = (taskerId, taskerName) => {
    setSelectedTaskerId(taskerId);
    setSelectedTaskerName(taskerName);
    setShowProfilePopup(true);
  };

  const closeProfilePopup = () => {
    setShowProfilePopup(false);
    setSelectedTaskerId(null);
    setSelectedTaskerName('');
  };

  const handleChatOpen = (application) => {
    setChatReceiver({
      _id: application.tasker._id,
      name: application.tasker.fullName
    });
    setChatOpen(true);
  };

  const handleSelectTasker = async (application) => {
    if (!application.confirmedByTasker || !application.confirmedTime || !application.confirmedPayment) {
      showError('This tasker has not confirmed their availability yet.');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to select ${application.tasker.fullName} for this task?\n\n` +
      `Time: ${new Date(application.confirmedTime).toLocaleString()}\n` +
              `Payment: LKR ${application.confirmedPayment?.toLocaleString()}`
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);

      const response = await selectTasker(
        id, 
        application.tasker._id, 
        application.confirmedTime, 
        application.confirmedPayment
      );
      
      // Check if payment is required
      if (response.requiresPayment) {
        // Update task with the response data to ensure we have agreedPayment
        setTask(response.data);
        // Store the selected application and show payment modal
        setSelectedApplication(application);
        setShowPaymentModal(true);
        setShowSelectTaskerModal(false);
        showSuccess('Tasker selected! Please complete the advance payment to schedule the task.');
      } else {
        showSuccess('Tasker selected successfully! The task has been scheduled.');
        await fetchTaskDetails(); // Refresh task data
        setShowSelectTaskerModal(false);
      }
      
    } catch (error) {
      console.error('Error selecting tasker:', error);
      showError(error.response?.data?.message || 'Failed to select tasker. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentData) => {
    showSuccess('Payment successful! Your task has been scheduled.');
    await fetchTaskDetails(); // Refresh task data
    // Ensure any PayHere popups are closed
    try {
      if (window.payhere && typeof window.payhere.closePayment === 'function') {
        window.payhere.closePayment();
      }
    } catch (_) {}
  };

  const handlePaymentError = (errorMessage) => {
    showError(errorMessage || 'Payment failed. Please try again.');
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
      
      // If current user is tasker (selected or targeted), include completion notes
      if (currentUser && currentTasker && currentUser._id === currentTasker._id) {
        if (completionData.completionNotes) payload.completionNotes = completionData.completionNotes;
      }

      const response = await markTaskComplete(id, payload);
      
      if (response.bothCompleted) {
        const remainingAmount = task.agreedPayment ? (task.agreedPayment - Math.round(task.agreedPayment * 0.2)) : 0;
        const paymentMessage = task.agreedPayment 
          ? ` The remaining payment of LKR ${remainingAmount.toLocaleString()} should be paid directly to the tasker.`
          : '';
        showSuccess(`🎉 Task completed successfully by both parties!${paymentMessage}`);
      } else {
        const message = isTaskOwner 
          ? 'Task marked as complete. Waiting for tasker confirmation.'
          : 'Task marked as complete. Waiting for customer confirmation.';
        showSuccess(message);
      }
      
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

  // Helper function to construct document URLs
  const getDocumentUrl = (docPath) => {
    // Handle both absolute and relative paths
    // Normalize the path and remove leading slashes
    const normalized = docPath.replace(/\\/g, '/').replace(/^\/+/, '');
    
    // If the path already starts with 'uploads/', use it as is
    if (normalized.startsWith('uploads/')) {
      return `${API_BASE_URL}/${normalized}`;
    }
    
    // If the path doesn't start with 'uploads/', add it
    return `${API_BASE_URL}/uploads/tasker-docs/${normalized.split(/[\\\/]/).pop()}`;
  };

  // Helper to construct absolute URLs for images saved in backend uploads
  const getTaskPhotoUrl = (photoPath) => {
    if (!photoPath) return '';
    // If already an absolute URL or data URI
    if (/^https?:\/\//i.test(photoPath) || /^data:image\//i.test(photoPath)) return photoPath;
    
    // Normalize Windows backslashes and clean the path
    const normalized = photoPath.replace(/\\/g, '/');
    
    // Remove any leading slashes and check if path already contains 'uploads/'
    const cleaned = normalized.replace(/^\/+/, '');
    
    // If the path already starts with 'uploads/', use it as is
    if (cleaned.startsWith('uploads/')) {
      return `${API_BASE_URL}/${cleaned}`;
    }
    
    // If the path doesn't start with 'uploads/', add it
    return `${API_BASE_URL}/uploads/${cleaned}`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <FaClock className="w-4 h-4 text-blue-500" />;
      case 'scheduled':
        return <FaCalendarAlt className="w-4 h-4 text-yellow-500" />;
      case 'completed':
        return <FaCheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <FaTimes className="w-4 h-4 text-red-500" />;
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

  if (loading) {
    return (
      <div className={`min-h-screen ${backgroundGradient} flex items-center justify-center`}>
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
      <div className={`min-h-screen ${backgroundGradient} flex items-center justify-center`}>
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
    <div className={`min-h-screen relative overflow-hidden ${backgroundGradient} py-8`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Back Button */}
        <div className="mb-6">
          <BackToTasksButton to={isTaskOwner ? '/my-tasks' : '/tasks'} isMyTasks={isTaskOwner} />
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
                      <span>LKR {task.minPayment?.toLocaleString()} - LKR {task.maxPayment?.toLocaleString()}</span>
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
              <div className="prose prose-slate max-w-none text-lg">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{task.description || ''}</ReactMarkdown>
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
                        src={getTaskPhotoUrl(photo)} 
                        alt={`Task photo ${index + 1}`}
                        className="w-full h-48 object-cover rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-xl transition-all duration-300"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Targeted Task - Direct Hire Section */}
            {isTargetedTask && isTaskOwner && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
                <h3 className="text-2xl font-bold mb-6 text-slate-800 flex items-center">
                  <FaUserTie className="text-purple-600 mr-3" />
                  Direct Hire - Task Management
                </h3>
                
                {/* Task Status */}
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                      Direct Hire
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      task.status === 'active' ? 'bg-yellow-100 text-yellow-800' :
                      task.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      task.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status === 'active' ? 'Waiting for Tasker Confirmation' : 
                       task.status === 'scheduled' ? 'Confirmed & Scheduled' :
                       task.status === 'completed' ? 'Completed' : task.status}
                    </span>
                    <span className="text-sm text-gray-600">
                      Budget: LKR {task.minPayment?.toLocaleString()} - LKR {task.maxPayment?.toLocaleString()}
                    </span>
                  </div>
                  
                  {task.status === 'active' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <FaClock className="text-yellow-600" />
                        <span className="font-medium text-yellow-800">Waiting for Confirmation</span>
                      </div>
                      <p className="text-sm text-yellow-700">
                        Your hired tasker needs to confirm their availability for this task. 
                        You can chat with them to discuss details.
                      </p>
                    </div>
                  )}
                  
                  {task.status === 'scheduled' && task.agreedTime && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <FaCalendarAlt className="text-blue-600" />
                        <span className="font-medium text-blue-800">Task Scheduled</span>
                      </div>
                      <p className="text-sm text-blue-700">
                        <strong>Scheduled for:</strong> {formatDate(task.agreedTime)}
                      </p>
                      {task.agreedPayment && (
                        <p className="text-sm text-blue-700">
                          <strong>Agreed payment:</strong> LKR {task.agreedPayment?.toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Hired Tasker Info */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                  <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <FaUser className="text-purple-600 mr-2" />
                    Your Hired Tasker
                  </h4>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <FaUser className="text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-bold text-slate-800">{task.targetedTasker?.fullName}</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mt-2">
                        {task.targetedTasker?.email && (
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-700">Email:</span>
                            <span className="text-gray-600">{task.targetedTasker.email}</span>
                          </div>
                        )}
                        {task.targetedTasker?.phone && (
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-700">Phone:</span>
                            <span className="text-gray-600">{task.targetedTasker.phone}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Show application status for direct hire */}
                      {applications.length > 0 && applications[0].tasker._id === task.targetedTasker?._id && (
                        <div className="mt-3">
                          {applications[0].confirmedByTasker ? (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                              <div className="flex items-center space-x-2 mb-2">
                                <FaCheckCircle className="text-green-600" />
                                <span className="font-medium text-green-800">Availability Confirmed</span>
                              </div>
                              {applications[0].confirmedTime && (
                                <p className="text-sm text-green-700">
                                  <strong>Preferred time:</strong> {formatDate(applications[0].confirmedTime)}
                                </p>
                              )}
                              {applications[0].confirmedPayment && (
                                <p className="text-sm text-green-700">
                                  <strong>Proposed payment:</strong> LKR {applications[0].confirmedPayment?.toLocaleString()}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                              <div className="flex items-center space-x-2">
                                <FaClock className="text-yellow-600" />
                                <span className="font-medium text-yellow-800">Awaiting Confirmation</span>
                              </div>
                              <p className="text-sm text-yellow-700 mt-1">
                                Tasker hasn't confirmed their availability yet
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => {
                          console.log('🔍 Chat button clicked for targeted task');
                          console.log('Task data:', task);
                          console.log('Targeted tasker:', task.targetedTasker);
                          
                          if (!task.targetedTasker?._id) {
                            console.error('❌ No targetedTasker._id found');
                            alert('Unable to start chat: Tasker information not available');
                            return;
                          }
                          
                          const receiverData = {
                            _id: task.targetedTasker._id,
                            name: task.targetedTasker.fullName
                          };
                          
                          console.log('✅ Setting chat receiver:', receiverData);
                          setChatReceiver(receiverData);
                          setChatOpen(true);
                        }}
                        disabled={!task.targetedTasker?._id}
                        className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                          task.targetedTasker?._id 
                            ? 'bg-purple-600 text-white hover:bg-purple-700' 
                            : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        }`}
                      >
                        <FaComments />
                        <span>Chat</span>
                      </button>
                      
                      {/* Select Tasker Button for Direct Hire */}
                      {applications.length > 0 && 
                       applications[0].tasker._id === task.targetedTasker?._id && 
                       applications[0].confirmedByTasker && 
                       task.status === 'active' && (
                        <button
                          onClick={() => handleSelectTasker(applications[0])}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                        >
                          <FaCheckCircle />
                          <span>{actionLoading ? 'Selecting...' : 'Select Tasker'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Applications Section for Regular Tasks Only - Hide when scheduled */}
            {isTaskOwner && !isTargetedTask && task.status !== 'scheduled' && task.status !== 'completed' &&(
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
                    <FaUsers />
                    <span>Applications ({applications.length})</span>
                  </h3>
                  {applications.length > 0 && (
                    <button
                      onClick={() => setShowSelectTaskerModal(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <FaCheckCircle />
                      <span>Select Tasker</span>
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
                              <p className="text-sm text-gray-600">Proposed: LKR {application.proposedPayment?.toLocaleString()}</p>
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
                              onClick={() => handleViewTaskerProfile(application.tasker._id, application.tasker.fullName)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Profile"
                            >
                              <FaEye />
                            </button>
                            <button
                              onClick={() => handleChatOpen(application)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Chat"
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

            {/* Selected Tasker Profile Section */}
            {currentTasker && (task.status === 'scheduled' || task.status === 'completed' || (isTargetedTask && task.status === 'active')) && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
                <h3 className="text-2xl font-bold mb-6 text-slate-800 flex items-center">
                  <FaUserTie className={`${isTargetedTask ? 'text-purple-600' : 'text-blue-600'} mr-3`} />
                  {isTargetedTask ? 'Hired Tasker Profile' : 'Selected Tasker Profile'}
                </h3>
                
                {/* Tasker Basic Info */}
                <div className={`${isTargetedTask ? 'bg-purple-50 border-purple-200' : 'bg-blue-50 border-blue-200'} border rounded-xl p-6 mb-6`}>
                  <div className="flex items-start space-x-4">
                    <div className={`w-16 h-16 ${isTargetedTask ? 'bg-purple-100' : 'bg-blue-100'} rounded-full flex items-center justify-center`}>
                      <FaUser className={`${isTargetedTask ? 'text-purple-600' : 'text-blue-600'} text-2xl`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-slate-800 mb-2">{currentTasker.fullName}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {currentTasker.email && (
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-700">Email:</span>
                            <span className="text-gray-600">{currentTasker.email}</span>
                          </div>
                        )}
                        {currentTasker.phone && (
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-700">Phone:</span>
                            <span className="text-gray-600">{currentTasker.phone}</span>
                          </div>
                        )}
                        {currentTasker.rating?.average && (
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-700">Overall Rating:</span>
                            <div className="flex items-center space-x-1">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <FaStar
                                    key={i}
                                    className={`w-4 h-4 ${i < Math.floor(currentTasker.rating.average) ? 'text-yellow-400' : 'text-gray-300'}`}
                                  />
                                ))}
                              </div>
                              <span className="text-gray-600">({Number(currentTasker.rating.average).toFixed(1)})</span>
                            </div>
                          </div>
                        )}
                        {currentTasker.statistics && (
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-700">Tasks Completed:</span>
                            <span className="text-gray-600">{currentTasker.statistics.tasksCompleted || 0}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tasker Skills & Experience */}
                {taskerProfile && (
                  <div className="mb-6">
                    <h5 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                      <FaHandshake className="text-green-600 mr-2" />
                      Skills & Experience
                    </h5>
                    
                    {taskerProfile.skills && taskerProfile.skills.length > 0 && (
                      <div className="mb-4">
                        <p className="font-medium text-gray-700 mb-2">Skills:</p>
                        <div className="flex flex-wrap gap-2">
                          {taskerProfile.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {taskerProfile.experience && (
                      <div className="mb-4">
                        <p className="font-medium text-gray-700 mb-2">Experience:</p>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <p className="text-gray-700">{taskerProfile.experience}</p>
                        </div>
                      </div>
                    )}

                    {/* Bio Section */}
                    {taskerProfile.bio && (
                      <div className="mb-4">
                        <p className="font-medium text-gray-700 mb-2">About:</p>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-gray-700">{taskerProfile.bio}</p>
                        </div>
                      </div>
                    )}

                    {currentTasker?.taskerProfile?.hourlyRate && (
                      <div className="flex items-center space-x-2 mb-3">
                        <FaDollarSign className="text-green-600" />
                        <span className="font-medium text-gray-700">Hourly Rate:</span>
                        <span className="text-gray-600">LKR {currentTasker.taskerProfile.hourlyRate}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Tasker Qualification Documents */}
                {taskerProfile?.taskerProfile?.qualificationDocuments && taskerProfile.taskerProfile.qualificationDocuments.length > 0 && (
                  <div className="mb-6">
                    <h5 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                      <FaEye className="text-green-600 mr-2" />
                      Qualification Documents
                    </h5>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {taskerProfile.taskerProfile.qualificationDocuments.map((doc, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 bg-green-50/30">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <FaEye className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <h6 className="font-medium text-slate-800">
                                Qualification Document {index + 1}
                              </h6>
                              <p className="text-sm text-slate-600 mt-1">
                                {doc.split('/').pop()}
                              </p>
                              <div className="flex items-center space-x-2 mt-2">
                                <button 
                                  onClick={() => {
                                    const url = doc.includes('uploads/') 
                                      ? `${API_BASE_URL}/${doc}`
                                      : `${API_BASE_URL}/uploads/tasker-docs/${doc.split(/[\\\/]/).pop()}`;
                                    window.open(url, '_blank');
                                  }}
                                  className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center space-x-1 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                                >
                                  <FaEye className="w-3 h-3" />
                                  <span>View</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Reviews & Feedback */}
                <div className="mb-6">
                  <h5 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <FaEye className="text-purple-600 mr-2" />
                    Recent Customer Reviews ({taskerReviews.length})
                  </h5>
                  
                  {loadingTaskerData ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent mx-auto"></div>
                      <p className="text-gray-600 mt-2">Loading reviews...</p>
                    </div>
                  ) : taskerReviews.length > 0 ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {taskerReviews.slice(0, 5).map((review, index) => (
                        <div key={index} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                <FaUser className="text-purple-600 text-sm" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">
                                  {review.customer?.fullName || 'Anonymous Customer'}
                                </p>
                                <div className="flex items-center space-x-1">
                                  {[...Array(5)].map((_, i) => (
                                    <FaStar
                                      key={i}
                                      className={`w-3 h-3 ${i < (review.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                                    />
                                  ))}
                                  <span className="text-sm text-gray-600 ml-1">
                                    ({review.rating || 0}/5)
                                  </span>
                                </div>
                              </div>
                            </div>
                            <span className="text-xs text-gray-500">
                              {review.completedAt ? formatTimeAgo(review.completedAt) : 'Recent'}
                            </span>
                          </div>
                          {review.review && (
                            <p className="text-gray-700 text-sm italic">"{review.review}"</p>
                          )}
                          {review.taskTitle && (
                            <p className="text-xs text-gray-500 mt-2">
                              Task: {review.taskTitle}
                            </p>
                          )}
                        </div>
                      ))}
                      {taskerReviews.length > 5 && (
                        <div className="text-center">
                          <p className="text-sm text-gray-600">
                            Showing 5 of {taskerReviews.length} reviews
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                      <FaEye className="text-4xl text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">No reviews available yet</p>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* Completed Task Details - Show tasker work and allow customer feedback */}
            {task.status === 'completed' && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
                <h3 className="text-2xl font-bold mb-6 text-slate-800 flex items-center">
                  <FaCheckCircle className="text-green-600 mr-3" />
                  Task Completed Successfully
                </h3>
                
                {/* Task Completion Summary */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {task.taskerCompletedAt && (
                      <div className="flex items-center space-x-3">
                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                        <div>
                          <p className="font-semibold text-green-800">Tasker Completed</p>
                          <p className="text-sm text-green-700">{formatDate(task.taskerCompletedAt)}</p>
                        </div>
                      </div>
                    )}
                    {task.customerCompletedAt && (
                      <div className="flex items-center space-x-3">
                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                        <div>
                          <p className="font-semibold text-green-800">Customer Confirmed</p>
                          <p className="text-sm text-green-700">{formatDate(task.customerCompletedAt)}</p>
                        </div>
                      </div>
                    )}
                    {task.agreedPayment && (
                      <div className="flex items-center space-x-3 col-span-full">
                        <FaDollarSign className="text-green-600 text-lg" />
                        <div>
                          <p className="font-semibold text-green-800">Payment Processed</p>
                          <p className="text-sm text-green-700">LKR {task.agreedPayment}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tasker's Work Submission */}
                {task.selectedTasker && (
                  <div className="mb-8">
                    <h4 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                      <FaUser className="text-blue-600 mr-2" />
                      Work by {task.selectedTasker.fullName}
                    </h4>
                    
                    {/* Completion Photos */}
                    {task.completionPhotos && task.completionPhotos.length > 0 ? (
                      <div className="mb-6">
                        <h5 className="font-semibold text-gray-800 mb-4 flex items-center">
                          <FaEye className="text-purple-600 mr-2" />
                          Completion Photos ({task.completionPhotos.length})
                        </h5>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {task.completionPhotos.map((photo, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={getTaskPhotoUrl(photo)}
                                alt={`Completion photo ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity shadow-md"
                                onClick={() => window.open(getTaskPhotoUrl(photo), '_blank')}
                                onError={(e) => {
                                  // Handle broken/invalid image URLs
                                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDIwMCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCA2NEw5NiA0OEwxMjAgNzJMMTQ0IDQ4TDE2MCA2NEwxNDQgODBMMTIwIDU2TDk2IDgwTDgwIDY0WiIgZmlsbD0iIzlDQTNBRiIvPgo8dGV4dCB4PSIxMDAiIHk9IjEwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNkI3MjgwIj5JbWFnZSBub3QgYXZhaWxhYmxlPC90ZXh0Pgo8L3N2Zz4K';
                                  e.target.style.cursor = 'default';
                                  e.target.onclick = null;
                                }}
                                onLoad={(e) => {
                                  // Check if image actually loaded content
                                  if (e.target.naturalWidth === 0) {
                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDIwMCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCA2NEw5NiA0OEwxMjAgNzJMMTQ0IDQ4TDE2MCA2NEwxNDQgODBMMTIwIDU2TDk2IDgwTDgwIDY0WiIgZmlsbD0iIzlDQTNBRiIvPgo8dGV4dCB4PSIxMDAiIHk9IjEwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNkI3MjgwIj5JbWFnZSBub3QgYXZhaWxhYmxlPC90ZXh0Pgo8L3N2Zz4K';
                                  }
                                }}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                                <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">
                                  Click to enlarge
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                        <p className="text-gray-600 text-center">No completion photos were uploaded by the tasker.</p>
                      </div>
                    )}

                    {/* Completion Notes */}
                    {task.completionNotes ? (
                      <div className="mb-6">
                        <h5 className="font-semibold text-gray-800 mb-3">Work Completion Notes</h5>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-gray-700">{task.completionNotes}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                        <p className="text-gray-600 text-center">No completion notes were provided by the tasker.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Customer's Feedback Section */}
                {isTaskOwner && (
                  <div className="mb-8">
                    <h4 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                      <FaEye className="text-yellow-500 mr-2" />
                      Your Feedback
                    </h4>
                    
                    {/* Customer Rating */}
                    {task.customerRating ? (
                      <div className="mb-4">
                        <p className="font-semibold text-gray-800 mb-2">Your Rating for the Tasker</p>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                className={`w-6 h-6 ${i < task.customerRating ? 'text-yellow-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          <span className="text-xl font-bold text-gray-700">
                            {task.customerRating}/5 stars
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <p className="text-yellow-800">You haven't rated this tasker yet.</p>
                      </div>
                    )}

                    {/* Customer Review */}
                    {task.customerReview ? (
                      <div className="mb-4">
                        <p className="font-semibold text-gray-800 mb-2">Your Review</p>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <p className="text-gray-700 italic">"{task.customerReview}"</p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <p className="text-yellow-800">You haven't left a review yet.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Tasker's Feedback About Customer */}
                {task.selectedTasker && (task.taskerRatingForCustomer || task.taskerFeedback) && (
                  <div className="mb-8">
                    <h4 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                      <FaComments className="text-green-600 mr-2" />
                      Tasker's Feedback About You
                    </h4>
                    
                    {/* Tasker's Rating for Customer */}
                    {task.taskerRatingForCustomer && (
                      <div className="mb-4">
                        <p className="font-semibold text-gray-800 mb-2">Tasker's Rating for You</p>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                className={`w-6 h-6 ${i < task.taskerRatingForCustomer ? 'text-yellow-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          <span className="text-xl font-bold text-gray-700">
                            {task.taskerRatingForCustomer}/5 stars
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Tasker's Feedback */}
                    {task.taskerFeedback && (
                      <div className="mb-4">
                        <p className="font-semibold text-gray-800 mb-2">Tasker's Feedback</p>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <p className="text-gray-700 italic">"{task.taskerFeedback}"</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Payment Status */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <FaDollarSign className="text-blue-600 text-xl" />
                    <h5 className="font-bold text-blue-800 text-lg">Payment Status</h5>
                  </div>
                  <p className="text-blue-700">
                    {task.customerCompletedAt && task.taskerCompletedAt ? 
                      '✅ Payment has been processed successfully since both parties confirmed completion.' :
                      '⏳ Payment will be processed once both parties confirm completion.'
                    }
                  </p>
                  {task.agreedPayment && (
                    <p className="text-blue-700 font-semibold mt-2">
                      Amount: LKR {task.agreedPayment}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Retry Payment Section */}
            {needsPaymentRetry && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <h3 className="text-lg font-bold mb-4 text-slate-800">Payment Required</h3>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <FaPhone className="text-orange-600" />
                    <span className="font-medium text-orange-800">Advance Payment Pending</span>
                  </div>
                  <p className="text-sm text-orange-700 mb-3">
                    You have selected a tasker for this task, but the advance payment is still pending. 
                    Complete the payment to schedule the task.
                  </p>
                  
                  {task.agreedPayment && (
                    <div className="bg-white rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Advance Payment (20%):</span>
                        <span className="font-semibold text-orange-700">
                          LKR {Math.round(task.agreedPayment * 0.2).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-gray-600">Total Agreed Payment:</span>
                        <span className="font-semibold text-gray-800">
                          LKR {task.agreedPayment.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <FaPhone />
                    <span>Complete Payment</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      if (!task.customerCompletedAt && !task.taskerCompletedAt) {
                        setShowCancelModal(true);
                      }
                    }}
                    disabled={task.customerCompletedAt || task.taskerCompletedAt}
                    className={`w-full px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                      (task.customerCompletedAt || task.taskerCompletedAt)
                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    <FaTimes />
                    <span>
                      {(task.customerCompletedAt || task.taskerCompletedAt) 
                        ? 'Cannot Cancel (Task Completed)' 
                        : 'Cancel Schedule'
                      }
                    </span>
                  </button>
                </div>
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
                {task.customer.rating?.average && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>Rating:</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(task.customer.rating.average) ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="ml-1">({Number(task.customer.rating.average).toFixed(1)})</span>
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
                {/* Hide application count when task is completed, targeted, or scheduled */}
                {task.status !== 'completed' && task.status !== 'scheduled' && !isTargetedTask && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Applications</span>
                    <span className="font-medium text-gray-800">{task.applicationCount || 0}</span>
                  </div>
                )}
                {isTargetedTask && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type</span>
                    <span className="font-medium text-purple-600">Direct Hire</span>
                  </div>
                )}
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
              !task?.hasApplied ? (
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                  <ApplyButton
                    task={task}
                    onApply={handleApply}
                    applying={applying}
                    alreadyApplied={false}
                  />
                </div>
              ) : (
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-4">
                      <FaCheck className="text-2xl text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-green-700 mb-2">You have already applied for this task</h3>
                    <p className="text-sm text-slate-600">Your application is pending review by the customer.</p>
                  </div>
                </div>
              )
            )}

            {/* Task Owner Actions - Regular Tasks */}
            {isTaskOwner && task.status === 'active' && !isTargetedTask && (
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

            {/* Direct Hire Status - Targeted Tasks */}
            {isTaskOwner && isTargetedTask && task.status === 'active' && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <h3 className="text-lg font-bold mb-4 text-slate-800 flex items-center">
                  <FaUserTie className="text-purple-600 mr-2" />
                  Direct Hire Status
                </h3>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <FaClock className="text-purple-600" />
                    <span className="font-medium text-purple-800">Waiting for Confirmation</span>
                  </div>
                  <p className="text-sm text-purple-700">
                    Your hired tasker needs to confirm their availability. You can chat with them to discuss details.
                  </p>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      if (task.targetedTasker?._id) {
                        setChatReceiver({
                          _id: task.targetedTasker._id,
                          name: task.targetedTasker.fullName
                        });
                        setChatOpen(true);
                      }
                    }}
                    disabled={!task.targetedTasker?._id}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <FaComments />
                    <span>Chat with Tasker</span>
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
              (isTaskOwner || (currentTasker && currentUser._id === currentTasker._id)) && (
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
                    {currentTasker && (
                      <p className="text-sm text-yellow-700">
                        <strong>Tasker:</strong> {currentTasker.fullName}
                        {isTargetedTask && (
                          <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                            Direct Hire
                          </span>
                        )}
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
                      onClick={() => {
                        if (!task.customerCompletedAt && !task.taskerCompletedAt) {
                          setShowCancelModal(true);
                        }
                      }}
                      disabled={task.customerCompletedAt || task.taskerCompletedAt}
                      className={`w-full px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                        (task.customerCompletedAt || task.taskerCompletedAt)
                          ? 'bg-gray-400 text-white cursor-not-allowed' 
                          : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                    >
                      <FaTimes />
                      <span>
                        {(task.customerCompletedAt || task.taskerCompletedAt) 
                          ? 'Cannot Cancel (Task Completed)' 
                          : 'Cancel Schedule'
                        }
                      </span>
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
        <>
          {console.log('🚀 Rendering TaskChatWindow with:', {
            taskId: id,
            receiverId: chatReceiver._id,
            receiverName: chatReceiver.name,
            chatReceiver: chatReceiver,
            currentUser: currentUser
          })}
          <TaskChatWindow
            taskId={id}
            receiverId={chatReceiver._id}
            receiverName={chatReceiver.name}
            isOpen={chatOpen}
            onClose={() => setChatOpen(false)}
            currentUser={currentUser}
            task={task}
          />
        </>
      )}

      {/* Complete Task Modal */}
      <Modal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title="Mark Task as Complete"
        subtitle="Confirm task completion and provide feedback"
        icon={FaCheckCircle}
        iconColor="text-green-600"
        iconBgColor="bg-green-100"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          {/* Payment Information */}
          {task.agreedPayment && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                <FaDollarSign className="mr-2" />
                Payment Information
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Total Agreed Payment:</span>
                  <span className="font-semibold text-blue-900">LKR {task.agreedPayment.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Advance Paid (20%):</span>
                  <span className="font-semibold text-blue-900">LKR {Math.round(task.agreedPayment * 0.2).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-blue-200 pt-2">
                  <span className="text-blue-700 font-medium">Remaining Payment:</span>
                  <span className="font-bold text-blue-900">LKR {(task.agreedPayment - Math.round(task.agreedPayment * 0.2)).toLocaleString()}</span>
                </div>
              </div>
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-yellow-800 text-xs">
                  {isTaskOwner 
                    ? '💰 Customer: Please arrange to pay the remaining amount directly to the tasker upon task completion.'
                    : '💰 Tasker: Please collect the remaining payment amount from the customer after completing this task.'
                  }
                </p>
              </div>
            </div>
          )}

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

          {currentUser && currentTasker && currentUser._id === currentTasker._id && (
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
      </Modal>

      {/* Cancel Schedule Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Schedule"
        subtitle="Are you sure you want to cancel this scheduled task?"
        icon={FaTimes}
        iconColor="text-red-600"
        iconBgColor="bg-red-100"
        maxWidth="max-w-md"
      >
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <FaTimes className="text-red-600" />
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
                  <FaTimes />
                  <span>Cancel Schedule</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        task={task}
        applicationId={selectedApplication?._id}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
      />

      {/* Select Tasker Modal */}
      <SelectTaskerModal
        isOpen={showSelectTaskerModal}
        onClose={() => setShowSelectTaskerModal(false)}
        applications={applications}
        onSelect={handleSelectTasker}
        isSelecting={actionLoading}
      />

      {/* Tasker Profile Popup */}
      <TaskerProfilePopup
        isOpen={showProfilePopup}
        onClose={closeProfilePopup}
        taskerId={selectedTaskerId}
        taskerName={selectedTaskerName}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default TaskDetails; 