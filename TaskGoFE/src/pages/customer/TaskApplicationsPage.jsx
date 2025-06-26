import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUsers, FaComments, FaCheck, FaClock, FaSpinner, FaStar, FaDollarSign, FaCalendarAlt, FaUser } from 'react-icons/fa';
import { getTask, getTaskApplications, selectTasker } from '../../services/api/taskService';
import TaskChatWindow from '../../components/task/TaskChatWindow';
import { useToast, ToastContainer } from '../../components/common/Toast';

// Mock function to get current user - replace with actual auth context
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

const TaskApplicationsPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { toasts, removeToast, showSuccess, showError } = useToast();
  const [task, setTask] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatReceiver, setChatReceiver] = useState(null);
  const [selecting, setSelecting] = useState(false);
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (taskId) {
      fetchTaskAndApplications();
    }
  }, [taskId]);

  const fetchTaskAndApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      const [taskResponse, applicationsResponse] = await Promise.all([
        getTask(taskId),
        getTaskApplications(taskId)
      ]);

      setTask(taskResponse.data);
      setApplications(applicationsResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load task applications. Please try again.');
      showError('Failed to load task applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChatOpen = (application) => {
    setChatReceiver({
      _id: application.tasker._id,
      name: application.tasker.fullName
    });
    setChatOpen(true);
  };

  const handleConfirmTasker = async (application) => {
    if (!application.confirmedByTasker || !application.confirmedTime || !application.confirmedPayment) {
      showError('This tasker has not confirmed their availability yet.');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to select ${application.tasker.fullName} for this task?\n\n` +
      `Time: ${new Date(application.confirmedTime).toLocaleString()}\n` +
      `Payment: $${application.confirmedPayment}`
    );

    if (!confirmed) return;

    try {
      setSelecting(true);
      await selectTasker(
        taskId, 
        application.tasker._id, 
        application.confirmedTime, 
        application.confirmedPayment
      );
      
      // Show success message
      showSuccess('Tasker selected successfully! The task has been scheduled.');
      
      // Refresh data
      await fetchTaskAndApplications();
      
    } catch (error) {
      console.error('Error selecting tasker:', error);
      showError(error.response?.data?.message || 'Failed to select tasker. Please try again.');
    } finally {
      setSelecting(false);
    }
  };

  const getAvailabilityStatus = (application) => {
    if (application.confirmedByTasker && application.confirmedTime && application.confirmedPayment) {
      return {
        status: 'confirmed',
        icon: FaCheck,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        text: 'Available'
      };
    }
    return {
      status: 'pending',
      icon: FaClock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      text: 'Pending'
    };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading applications...</p>
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
            onClick={fetchTaskAndApplications}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Task Applications</h1>
            {task && (
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-2">{task.title}</h2>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span className="flex items-center space-x-1">
                    <FaCalendarAlt />
                    <span>{new Date(task.startDate).toLocaleDateString()} - {new Date(task.endDate).toLocaleDateString()}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <FaDollarSign />
                    <span>${task.minPayment} - ${task.maxPayment}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <FaUsers />
                    <span>{applications.length} applications</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <FaUsers className="text-4xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No applications yet</h3>
              <p className="text-gray-600">Your task is still open for applications.</p>
            </div>
          ) : (
            applications.map((application) => {
              const availability = getAvailabilityStatus(application);
              const StatusIcon = availability.icon;
              
              return (
                <div key={application._id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Tasker Info */}
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <FaUser className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {application.tasker.fullName}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${availability.bgColor} ${availability.color}`}>
                              <StatusIcon className="text-xs" />
                              <span>{availability.text}</span>
                            </div>
                            {application.tasker.rating && typeof application.tasker.rating === 'number' && (
                              <div className="flex items-center space-x-1 text-sm text-gray-600">
                                <FaStar className="text-yellow-500" />
                                <span>{Number(application.tasker.rating).toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Application Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Proposed Payment</p>
                          <p className="text-lg font-semibold text-green-600">${application.proposedPayment}</p>
                        </div>
                        {application.estimatedDuration && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">Estimated Duration</p>
                            <p className="text-gray-800">{application.estimatedDuration} hours</p>
                          </div>
                        )}
                        {application.confirmedTime && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">Preferred Time</p>
                            <p className="text-gray-800">{formatDate(application.confirmedTime)}</p>
                          </div>
                        )}
                      </div>

                      {/* Note */}
                      {application.note && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-1">Note</p>
                          <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{application.note}</p>
                        </div>
                      )}

                      {/* Availability Details */}
                      {application.availableStartDate && application.availableEndDate && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-1">Available Period</p>
                          <p className="text-gray-600">
                            {formatDate(application.availableStartDate)} - {formatDate(application.availableEndDate)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        onClick={() => handleChatOpen(application)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <FaComments />
                        <span>Chat</span>
                      </button>
                      
                      {task?.status === 'active' && (
                        <button
                          onClick={() => handleConfirmTasker(application)}
                          disabled={!application.confirmedByTasker || selecting}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                        >
                          {selecting ? (
                            <FaSpinner className="animate-spin" />
                          ) : (
                            <FaCheck />
                          )}
                          <span>
                            {availability.status === 'confirmed' ? 'Select Tasker' : 'Waiting for Confirmation'}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Task Status Info */}
        {task?.status !== 'active' && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              <strong>Note:</strong> This task is currently in "{task?.status}" status. 
              {task?.status === 'scheduled' && ' A tasker has been selected and the task is scheduled.'}
            </p>
          </div>
        )}
      </div>

      {/* Chat Window */}
      {chatOpen && chatReceiver && (
        <TaskChatWindow
          taskId={taskId}
          receiverId={chatReceiver._id}
          receiverName={chatReceiver.name}
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          currentUser={currentUser}
        />
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default TaskApplicationsPage; 