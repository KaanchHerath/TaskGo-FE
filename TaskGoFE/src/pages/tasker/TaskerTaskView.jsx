import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaCalendarAlt, 
  FaDollarSign, 
  FaMapMarkerAlt, 
  FaUser, 
  FaPhone, 
  FaEnvelope, 
  FaComments,
  FaSpinner,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCamera,
  FaTimes,
  FaStar
} from 'react-icons/fa';
import TaskChatWindow from '../../components/task/TaskChatWindow';
import ConfirmScheduleModal from '../../components/task/ConfirmScheduleModal';
import { getTask, markTaskComplete, cancelScheduledTask } from '../../services/api/taskService';
import { useToast, ToastContainer } from '../../components/common/Toast';
import { getMyApplications } from '../../services/api/taskService';

// Helper function to get current user from token
const getCurrentUser = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    return null;
  }
};

const TaskerTaskView = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();
  
  const [task, setTask] = useState(null);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [completionData, setCompletionData] = useState({ 
    completionNotes: '', 
    completionPhotos: [],
    taskerFeedback: '',
    taskerRatingForCustomer: 5
  });
  const [cancellationReason, setCancellationReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (taskId) {
      fetchTaskDetails();
    }
  }, [taskId]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getTask(taskId);
      const taskData = response.data;
      
      console.log('🔍 DEBUG - Task Data:', taskData);
      console.log('🔍 DEBUG - Current User:', currentUser);
      
      setTask(taskData);
      
      // Fetch the current user's application for this task separately
      try {
        const applicationData = await getMyApplications();
        const userApplication = applicationData.data?.find(
          app => app.task._id === taskId
        );
        setApplication(userApplication);
      } catch (appError) {
        console.error('Error fetching applications:', appError);
        // Don't set error state for application fetch failure
      }
      
      console.log('🔍 DEBUG - Task Status:', taskData.status);
      console.log('🔍 DEBUG - Selected Tasker:', taskData.selectedTasker);
      
    } catch (error) {
      console.error('Error fetching task details:', error);
      setError('Failed to load task details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getApplicationStatus = () => {
    // Check if this is a targeted task for the current user
    const isTargetedTask = task?.isTargeted && task?.targetedTasker === currentUser.userId;
    
    if (isTargetedTask) {
      if (task.selectedTasker === currentUser.userId) {
        return { text: 'Selected (Hired Directly)', color: 'text-green-700', bgColor: 'bg-green-100' };
      }
      // For targeted tasks, check if tasker has confirmed (this would be stored differently)
      // For now, we'll assume they need to confirm availability
      return { text: 'Hired Directly', color: 'text-purple-700', bgColor: 'bg-purple-100' };
    }
    
    if (!application) return { text: 'Not Applied', color: 'text-gray-500', bgColor: 'bg-gray-100' };
    
    if (task.selectedTasker === currentUser.userId) {
      return { text: 'Selected', color: 'text-green-700', bgColor: 'bg-green-100' };
    }
    
    if (application.confirmedByTasker) {
      return { text: 'Availability Confirmed', color: 'text-blue-700', bgColor: 'bg-blue-100' };
    }
    
    return { text: 'Application Pending', color: 'text-yellow-700', bgColor: 'bg-yellow-100' };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleConfirmAvailability = () => {
    setConfirmModalOpen(true);
  };

  const handleConfirmSuccess = () => {
    addToast('Availability confirmed successfully!', 'success');
    fetchTaskDetails(); // Refresh data
  };

  const handleMarkComplete = async () => {
    try {
      setActionLoading(true);
      const payload = {};
      
      // For taskers, include completion photos, notes, and feedback
      if (completionData.completionNotes) {
        payload.completionNotes = completionData.completionNotes;
      }
      if (completionData.completionPhotos && completionData.completionPhotos.length > 0) {
        payload.completionPhotos = completionData.completionPhotos;
      }
      if (completionData.taskerFeedback) {
        payload.taskerFeedback = completionData.taskerFeedback;
      }
      if (completionData.taskerRatingForCustomer) {
        payload.taskerRatingForCustomer = completionData.taskerRatingForCustomer;
      }

      const response = await markTaskComplete(taskId, payload);
      
      if (response.bothCompleted) {
        addToast('🎉 Task completed successfully by both parties! Payment will be processed.', 'success');
      } else {
        addToast('Task marked as complete. Waiting for customer confirmation.', 'success');
      }
      
      setShowCompleteModal(false);
      await fetchTaskDetails(); // Refresh task data
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to mark task as complete';
      addToast(errorMessage, 'error');
      console.error('Error marking task complete:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSchedule = async () => {
    try {
      setActionLoading(true);
      await cancelScheduledTask(taskId, cancellationReason);
      addToast('Schedule cancelled successfully. Task is now active again.', 'success');
      setShowCancelModal(false);
      setCancellationReason('');
      await fetchTaskDetails(); // Refresh task data
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to cancel schedule';
      addToast(errorMessage, 'error');
      console.error('Error cancelling schedule:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePhotoUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploadingPhoto(true);
    try {
      const uploadedPhotos = [];
      
      for (const file of files) {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('photo', file);
        
        // For now, we'll create a mock URL. In production, you'd upload to a service
        const mockUrl = URL.createObjectURL(file);
        uploadedPhotos.push(mockUrl);
      }
      
      setCompletionData({
        ...completionData,
        completionPhotos: [...completionData.completionPhotos, ...uploadedPhotos]
      });
      
      addToast(`${files.length} photo(s) added successfully!`, 'success');
    } catch (error) {
      console.error('Error uploading photos:', error);
      addToast('Failed to upload photos. Please try again.', 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removePhoto = (index) => {
    const updatedPhotos = completionData.completionPhotos.filter((_, i) => i !== index);
    setCompletionData({
      ...completionData,
      completionPhotos: updatedPhotos
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-gray-600">
          <FaSpinner className="animate-spin text-2xl" />
          <span className="text-lg">Loading task details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
            {error}
          </div>
          <button
            onClick={fetchTaskDetails}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-600">
          <FaExclamationTriangle className="text-4xl mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Task Not Found</h2>
          <p>The task you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const status = getApplicationStatus();

  // Debug logging for button visibility
  console.log('🔍 DEBUG - Render Conditions:');
  console.log('- application exists:', !!application);
  console.log('- application.confirmedByTasker:', application?.confirmedByTasker);
  console.log('- task.status:', task.status);
  console.log('- task.isTargeted:', task.isTargeted);
  console.log('- task.targetedTasker:', task.targetedTasker);
  console.log('- currentUser.userId:', currentUser.userId);
  console.log('- task.selectedTasker:', task.selectedTasker);
  console.log('- Is targeted task for current user:', task.isTargeted && task.targetedTasker === currentUser.userId);
  console.log('- Confirm button should show (old logic):', !application?.confirmedByTasker && task.status === 'active');
  console.log('- Confirm button should show (targeted):', task.isTargeted && task.targetedTasker === currentUser.userId && task.status === 'active' && task.selectedTasker !== currentUser.userId);
  console.log('- Chat button should show:', !!application || (task.isTargeted && task.targetedTasker === currentUser.userId));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/my-tasks')}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mb-4"
          >
            <FaArrowLeft />
            <span>Back to My Tasks</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">{task.title}</h1>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.bgColor} ${status.color}`}>
                    {status.text}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    LKR {task.minPayment} - {task.maxPayment}
                  </p>
                  <p className="text-sm text-gray-600">Budget Range</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center space-x-3 text-gray-600">
                  <FaCalendarAlt className="text-blue-500" />
                  <div>
                    <p className="font-medium">Start Date</p>
                    <p className="text-sm">{formatDate(task.startDate)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <FaClock className="text-green-500" />
                  <div>
                    <p className="font-medium">End Date</p>
                    <p className="text-sm">{formatDate(task.endDate)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <FaMapMarkerAlt className="text-red-500" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm">{task.location}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <FaDollarSign className="text-yellow-500" />
                  <div>
                    <p className="font-medium">Category</p>
                    <p className="text-sm">{task.category}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">{task.description}</p>
              </div>
            </div>

            {/* Targeted Task Details */}
            {task.isTargeted && task.targetedTasker === currentUser.userId && !application && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FaStar className="text-purple-600 mr-2" />
                  You Were Hired Directly
                </h3>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                  <p className="text-purple-700 text-sm">
                    🎉 <strong>{task.customer.fullName}</strong> hired you directly for this task! 
                    You can now confirm your availability and start chatting with the customer.
                  </p>
                </div>

                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                   <div>
                     <p className="font-medium text-gray-700">Budget Range</p>
                     <p className="text-lg font-semibold text-green-600">LKR {task.minPayment} - {task.maxPayment}</p>
                   </div>
                   <div>
                     <p className="font-medium text-gray-700">Task Type</p>
                     <p className="text-gray-800">Direct Hire</p>
                   </div>
                 </div>
              </div>
            )}

            {/* Application Details */}
            {application && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Application</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="font-medium text-gray-700">Proposed Payment</p>
                    <p className="text-lg font-semibold text-green-600">LKR {application.proposedPayment}</p>
                  </div>
                  {application.confirmedTime && (
                    <div>
                      <p className="font-medium text-gray-700">Confirmed Time</p>
                      <p className="text-gray-800">{formatDate(application.confirmedTime)}</p>
                    </div>
                  )}
                </div>

                {application.note && (
                  <div className="mb-4">
                    <p className="font-medium text-gray-700 mb-1">Your Note</p>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{application.note}</p>
                  </div>
                )}

                {/* Action Button */}
                {((!application?.confirmedByTasker && task.status === 'active') || 
                  (task.isTargeted && task.targetedTasker === currentUser.userId && task.status === 'active' && task.selectedTasker !== currentUser.userId)) && (
                  <button
                    onClick={handleConfirmAvailability}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 font-semibold shadow-lg flex items-center justify-center space-x-2"
                  >
                    <FaCheckCircle />
                    <span>Confirm Your Availability</span>
                  </button>
                )}
              </div>
            )}

            {/* Standalone Action Button for Targeted Tasks */}
            {task.isTargeted && task.targetedTasker === currentUser.userId && !application && 
             task.status === 'active' && task.selectedTasker !== currentUser.userId && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FaCheckCircle className="text-green-600 mr-2" />
                  Confirm Your Availability
                </h3>
                <p className="text-gray-600 mb-4">
                  Ready to take on this task? Confirm your availability and set your preferred schedule.
                </p>
                <button
                  onClick={handleConfirmAvailability}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 font-semibold shadow-lg flex items-center justify-center space-x-2"
                >
                  <FaCheckCircle />
                  <span>Confirm Your Availability</span>
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h3>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <FaUser className="text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">{task.customer.fullName}</h4>
                  <p className="text-sm text-gray-600">Task Owner</p>
                </div>
              </div>

              <div className="space-y-3">
                {task.customer.email && (
                  <div className="flex items-center space-x-3 text-gray-600">
                    <FaEnvelope className="text-gray-400" />
                    <span className="text-sm">{task.customer.email}</span>
                  </div>
                )}
                
                {task.customer.phone && (
                  <div className="flex items-center space-x-3 text-gray-600">
                    <FaPhone className="text-gray-400" />
                    <span className="text-sm">{task.customer.phone}</span>
                  </div>
                )}

                {task.customer.rating && typeof task.customer.rating === 'number' && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">Rating:</span>
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
                      <span className="ml-1 text-sm text-gray-600">
                        {Number(task.customer.rating).toFixed(1)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Button */}
              {(application || (task.isTargeted && task.targetedTasker === currentUser.userId)) && (
                <button
                  onClick={() => setChatOpen(true)}
                  className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold shadow-lg flex items-center justify-center space-x-2"
                >
                  <FaComments />
                  <span>Chat with Customer</span>
                </button>
              )}
            </div>

            {/* Task Status */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Task Status</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    task.status === 'active' ? 'bg-green-100 text-green-700' :
                    task.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                    task.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </span>
                </div>
                
                {/* Hide application count when task is completed */}
                {task.status !== 'completed' && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Applications:</span>
                    <span className="font-medium">{task.applicationCount || 0}</span>
                  </div>
                )}

                {task.selectedTasker === currentUser.userId && (task.status === 'scheduled' || task.status === 'in-progress' || task.status === 'completed') && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                    <p className="text-green-700 text-sm font-medium">
                      🎉 Congratulations! You've been selected for this task.
                    </p>
                  </div>
                )}

                {task.selectedTasker === currentUser.userId && task.status === 'active' && application && !application.confirmedByTasker && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                    <p className="text-blue-700 text-sm font-medium">
                      ✅ You've been selected! Please confirm your availability to proceed.
                    </p>
                  </div>
                )}

                {task.isTargeted && task.targetedTasker === currentUser.userId && task.status === 'active' && task.selectedTasker !== currentUser.userId && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mt-4">
                    <p className="text-purple-700 text-sm font-medium">
                      🎯 You were hired directly! Please confirm your availability to proceed.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Completed Task Details - Show customer feedback and tasker submission */}
            {task.status === 'completed' && task.selectedTasker && 
             (task.selectedTasker._id === currentUser.userId || task.selectedTasker === currentUser.userId) && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                  <FaCheckCircle className="text-green-600 mr-2" />
                  Task Completed Successfully
                </h3>
                
                {/* Task Completion Summary */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {task.taskerCompletedAt && (
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="text-green-700">
                          <strong>You completed:</strong> {formatDate(task.taskerCompletedAt)}
                        </span>
                      </div>
                    )}
                    {task.customerCompletedAt && (
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="text-green-700">
                          <strong>Customer confirmed:</strong> {formatDate(task.customerCompletedAt)}
                        </span>
                      </div>
                    )}
                    {task.agreedPayment && (
                      <div className="flex items-center space-x-2 col-span-full">
                        <FaDollarSign className="text-green-600" />
                        <span className="text-green-700 font-semibold">
                          Payment: LKR {task.agreedPayment}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Your Work Submission */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FaCamera className="text-blue-600 mr-2" />
                    Your Work Submission
                  </h4>
                  
                  {/* Completion Photos */}
                  {task.completionPhotos && task.completionPhotos.length > 0 ? (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-3">
                        Completion Photos ({task.completionPhotos.length})
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {task.completionPhotos.map((photo, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={photo}
                              alt={`Completion photo ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
                              onClick={() => window.open(photo, '_blank')}
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
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                      <p className="text-gray-600 text-sm">No completion photos were uploaded.</p>
                    </div>
                  )}

                  {/* Completion Notes */}
                  {task.completionNotes ? (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Work Completion Notes</p>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <p className="text-sm text-gray-700">{task.completionNotes}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                      <p className="text-gray-600 text-sm">No completion notes were provided.</p>
                    </div>
                  )}
                </div>

                {/* Customer Feedback Section */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FaUser className="text-purple-600 mr-2" />
                    Customer Feedback
                  </h4>
                  
                  {/* Customer Rating */}
                  {task.customerRating ? (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Customer's Rating for You</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={`w-5 h-5 ${i < task.customerRating ? 'text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-lg font-semibold text-gray-700">
                          {task.customerRating}/5 stars
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                      <p className="text-gray-600 text-sm">Customer hasn't rated you yet.</p>
                    </div>
                  )}

                  {/* Customer Review */}
                  {task.customerReview ? (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Customer's Review</p>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <p className="text-gray-700 italic">"{task.customerReview}"</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                      <p className="text-gray-600 text-sm">Customer hasn't left a review yet.</p>
                    </div>
                  )}
                </div>

                {/* Your Feedback About Customer */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FaComments className="text-green-600 mr-2" />
                    Your Feedback About Customer
                  </h4>
                  
                  {/* Your Rating for Customer */}
                  {task.taskerRatingForCustomer ? (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Your Rating for Customer</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={`w-5 h-5 ${i < task.taskerRatingForCustomer ? 'text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-lg font-semibold text-gray-700">
                          {task.taskerRatingForCustomer}/5 stars
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                      <p className="text-gray-600 text-sm">You didn't rate the customer.</p>
                    </div>
                  )}

                  {/* Your Feedback */}
                  {task.taskerFeedback ? (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Your Feedback</p>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-gray-700 italic">"{task.taskerFeedback}"</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                      <p className="text-gray-600 text-sm">You didn't leave feedback about the customer.</p>
                    </div>
                  )}
                </div>

                {/* Payment Status */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <FaDollarSign className="text-blue-600" />
                    <span className="font-semibold text-blue-800">Payment Status</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    {task.customerCompletedAt && task.taskerCompletedAt ? 
                      '✅ Payment has been processed since both parties confirmed completion.' :
                      '⏳ Payment will be processed once both parties confirm completion.'
                    }
                  </p>
                </div>
              </div>
            )}

            {/* Scheduled Task Actions */}
            {task.status === 'scheduled' && task.selectedTasker && 
             (task.selectedTasker._id === currentUser.userId || task.selectedTasker === currentUser.userId) && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Task Actions</h3>
                
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
                    disabled={task.taskerCompletedAt}
                    className={`w-full px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                      task.taskerCompletedAt 
                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    <FaCheckCircle />
                    <span>{task.taskerCompletedAt ? 'Already Completed' : 'Mark as Complete'}</span>
                  </button>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <FaExclamationTriangle />
                    <span>Cancel Schedule</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Window */}
      {chatOpen && (application || (task.isTargeted && task.targetedTasker === currentUser.userId)) && (
        <TaskChatWindow
          taskId={taskId}
          receiverId={task.customer._id}
          receiverName={task.customer.fullName}
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          currentUser={currentUser}
        />
      )}

      {/* Confirm Schedule Modal */}
      {confirmModalOpen && (
        <ConfirmScheduleModal
          isOpen={confirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          taskId={taskId}
          task={task}
          onSuccess={handleConfirmSuccess}
        />
      )}

      {/* Complete Task Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Complete Task & Submit Work</h3>
                <button
                  onClick={() => setShowCompleteModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Photo Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Completion Photos <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Please upload photos showing the completed work. This is required for payment processing.
                  </p>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      id="photo-upload"
                      disabled={uploadingPhoto}
                    />
                    <label
                      htmlFor="photo-upload"
                      className={`cursor-pointer flex flex-col items-center space-y-2 ${
                        uploadingPhoto ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <FaCamera className="text-3xl text-gray-400" />
                      <span className="text-sm font-medium text-gray-600">
                        {uploadingPhoto ? 'Uploading...' : 'Click to upload photos'}
                      </span>
                      <span className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB each
                      </span>
                    </label>
                  </div>

                  {/* Photo Preview */}
                  {completionData.completionPhotos.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Uploaded Photos ({completionData.completionPhotos.length})
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {completionData.completionPhotos.map((photo, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={photo}
                              alt={`Completion photo ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => removePhoto(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Completion Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Work Completion Notes
                  </label>
                  <textarea
                    value={completionData.completionNotes}
                    onChange={(e) => setCompletionData({...completionData, completionNotes: e.target.value})}
                    placeholder="Describe the work completed, any challenges faced, or additional notes..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                  />
                </div>

                {/* Customer Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rate the Customer (1-5 stars)
                  </label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setCompletionData({...completionData, taskerRatingForCustomer: star})}
                        className={`text-2xl ${
                          star <= completionData.taskerRatingForCustomer ? 'text-yellow-400' : 'text-gray-300'
                        } hover:text-yellow-400 transition-colors`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                {/* Customer Feedback */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feedback about the Customer (optional)
                  </label>
                  <textarea
                    value={completionData.taskerFeedback}
                    onChange={(e) => setCompletionData({...completionData, taskerFeedback: e.target.value})}
                    placeholder="Share your experience working with this customer..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                  />
                </div>
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
                  disabled={actionLoading || completionData.completionPhotos.length === 0}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {actionLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <>
                      <FaCheckCircle />
                      <span>Submit Completion</span>
                    </>
                  )}
                </button>
              </div>
              
              {completionData.completionPhotos.length === 0 && (
                <p className="text-xs text-red-500 mt-2 text-center">
                  At least one completion photo is required
                </p>
              )}
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
                    <FaExclamationTriangle className="text-red-600" />
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
                      <FaExclamationTriangle />
                      <span>Cancel Schedule</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default TaskerTaskView;