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
  FaExclamationTriangle
} from 'react-icons/fa';
import TaskChatWindow from '../../components/task/TaskChatWindow';
import ConfirmScheduleModal from '../../components/task/ConfirmScheduleModal';
import { getTask } from '../../services/api/taskService';
import { useToast, ToastContainer } from '../../components/common/Toast';

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
        const token = localStorage.getItem('token');
        const applicationResponse = await fetch(`http://localhost:5000/api/v1/tasks/my-applications`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (applicationResponse.ok) {
          const applicationData = await applicationResponse.json();
          const userApplication = applicationData.data?.find(
            app => app.task._id === taskId
          );
          
          console.log('🔍 DEBUG - All Applications:', applicationData.data);
          console.log('🔍 DEBUG - User Application for this task:', userApplication);
          
          setApplication(userApplication);
        }
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
  console.log('- Confirm button should show:', !application?.confirmedByTasker && task.status === 'active');
  console.log('- Chat button should show:', !!application);

  return (
    <div className={`min-h-screen bg-gray-50 transition-all duration-300 ${chatOpen ? 'lg:mr-96' : ''}`}>
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
                {!application.confirmedByTasker && task.status === 'active' && (
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
              {application && (
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
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Applications:</span>
                  <span className="font-medium">{task.applications?.length || 0}</span>
                </div>

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
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Window */}
      {chatOpen && application && (
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

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default TaskerTaskView;