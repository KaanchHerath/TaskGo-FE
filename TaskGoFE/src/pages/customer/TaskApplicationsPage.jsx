import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUsers, FaComments, FaCheck, FaClock, FaSpinner, FaStar, FaDollarSign, FaCalendarAlt, FaUser, FaCreditCard, FaCheckCircle } from 'react-icons/fa';
import { getTask, getTaskApplications, selectTasker } from '../../services/api/taskService';
import TaskChatWindow from '../../components/task/TaskChatWindow';
import { useToast, ToastContainer } from '../../components/common/Toast';
import PaymentModal from '../../components/common/PaymentModal';
import Modal from '../../components/common/Modal';

// Helper to get current user from token
import { getToken } from '../../utils/auth';
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [applicationToConfirm, setApplicationToConfirm] = useState(null);
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

  const handleConfirmTasker = (application) => {
    if (!application.confirmedByTasker || !application.confirmedTime || !application.confirmedPayment) {
      showError('This tasker has not confirmed their availability yet.');
      return;
    }
    setApplicationToConfirm(application);
    setShowConfirmModal(true);
  };

  const confirmSelectTasker = async () => {
    if (!applicationToConfirm) return;
    const application = applicationToConfirm;
    try {
      setSelecting(true);

      const response = await selectTasker(
        taskId,
        application.tasker._id,
        application.confirmedTime,
        application.confirmedPayment
      );

      if (response.requiresPayment) {
        setTask(response.data);
        setSelectedApplication(application);
        setShowPaymentModal(true);
        showSuccess('Tasker selected! Please complete the advance payment to schedule the task.');
      } else {
        showSuccess('Tasker selected successfully! The task has been scheduled.');
        await fetchTaskAndApplications();
      }
      setShowConfirmModal(false);
      setApplicationToConfirm(null);
    } catch (error) {
      console.error('Error selecting tasker:', error);
      showError(error.response?.data?.message || 'Failed to select tasker. Please try again.');
    } finally {
      setSelecting(false);
    }
  };

  const handlePaymentSuccess = async (paymentData) => {
    showSuccess('Payment successful! Your task has been scheduled.');
    await fetchTaskAndApplications(); // Refresh task data
    // Ensure any PayHere popups are closed and refresh the view
    try {
      if (window.payhere && typeof window.payhere.closePayment === 'function') {
        window.payhere.closePayment();
      }
    } catch (_) {}
  };

  const handlePaymentError = (errorMessage) => {
    showError(errorMessage || 'Payment failed. Please try again.');
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
                    <span>LKR {task.minPayment?.toLocaleString()} - LKR {task.maxPayment?.toLocaleString()}</span>
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
                          <p className="text-lg font-semibold text-green-600">LKR {application.proposedPayment?.toLocaleString()}</p>
                        </div>
                        {application.estimatedDuration && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">Estimated Duration</p>
                            <p className="text-gray-800">{application.estimatedDuration} hour(s)</p>
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

        {/* Payment Retry Section */}
        {task && 
         task.status === 'active' && 
         task.selectedTasker && 
         (!task.advancePaymentStatus || task.advancePaymentStatus === 'pending') && (
          <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-3">
              <FaCreditCard className="text-orange-600" />
              <h3 className="text-lg font-semibold text-orange-800">Payment Required</h3>
            </div>
            <p className="text-orange-700 mb-4">
              You have selected a tasker for this task, but the advance payment is still pending. 
              Complete the payment to schedule the task.
            </p>
            
            {task.agreedPayment && (
              <div className="bg-white rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Advance Payment (20%):</span>
                  <span className="font-semibold text-orange-700">
                    LKR {Math.round(task.agreedPayment * 0.2).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Agreed Payment:</span>
                  <span className="font-semibold text-gray-800">
                    LKR {task.agreedPayment.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => setShowPaymentModal(true)}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2"
              >
                <FaCreditCard />
                <span>Complete Payment</span>
              </button>
            </div>
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

             {/* Payment Modal */}
       <PaymentModal
         isOpen={showPaymentModal}
         onClose={() => setShowPaymentModal(false)}
         task={task}
         applicationId={selectedApplication?._id}
         onPaymentSuccess={handlePaymentSuccess}
         onPaymentError={handlePaymentError}
       />

      {/* Confirm Select Tasker Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => { if (!selecting) { setShowConfirmModal(false); setApplicationToConfirm(null); } }}
        title="Confirm Tasker Selection"
        subtitle="Please review the details before confirming"
        icon={FaCheckCircle}
        iconColor="text-green-600"
        iconBgColor="bg-green-100"
      >
        {applicationToConfirm && (
          <div className="space-y-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-700"><strong>Tasker:</strong> {applicationToConfirm.tasker.fullName}</p>
              {applicationToConfirm.confirmedTime && (
                <p className="text-sm text-gray-700"><strong>Time:</strong> {new Date(applicationToConfirm.confirmedTime).toLocaleString()}</p>
              )}
              {applicationToConfirm.confirmedPayment && (
                <p className="text-sm text-gray-700"><strong>Payment:</strong> LKR {applicationToConfirm.confirmedPayment.toLocaleString()}</p>
              )}
              {applicationToConfirm.note && (
                <p className="text-sm text-gray-700"><strong>Note:</strong> {applicationToConfirm.note}</p>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={selecting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSelectTasker}
                disabled={selecting}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {selecting ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                <span>Confirm Selection</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default TaskApplicationsPage; 