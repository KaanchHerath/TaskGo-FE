import React, { useState } from 'react';
import { 
  FaTimes, 
  FaExclamationTriangle, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaPause, 
  FaPlay,
  FaHourglass,
  FaClock,
  FaEdit
} from 'react-icons/fa';
import { updateTaskStatus } from '../../services/api/adminService';

const TaskStatusModal = ({ task, action, onClose, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get action details
  const getActionDetails = () => {
    switch (action) {
      case 'pause':
        return {
          title: 'Pause Task',
          description: 'This will pause the task temporarily. The tasker will be notified.',
          newStatus: 'paused',
          icon: FaPause,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          requireReason: false
        };
      case 'resume':
        return {
          title: 'Resume Task',
          description: 'This will resume the paused task and notify the tasker.',
          newStatus: 'active',
          icon: FaPlay,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          requireReason: false
        };
      case 'cancel':
        return {
          title: 'Cancel Task',
          description: 'This will permanently cancel the task. This action cannot be undone.',
          newStatus: 'cancelled',
          icon: FaTimesCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          requireReason: true
        };
      case 'complete':
        return {
          title: 'Mark Task Complete',
          description: 'This will mark the task as completed and process final payment.',
          newStatus: 'completed',
          icon: FaCheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          requireReason: false
        };
      case 'in_progress':
        return {
          title: 'Start Task',
          description: 'This will mark the task as in progress.',
          newStatus: 'in_progress',
          icon: FaHourglass,
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
          requireReason: false
        };
      case 'scheduled':
        return {
          title: 'Schedule Task',
          description: 'This will mark the task as scheduled for a future date.',
          newStatus: 'scheduled',
          icon: FaClock,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          requireReason: false
        };
      default:
        return {
          title: 'Update Task Status',
          description: 'Update the task status.',
          newStatus: action,
          icon: FaEdit,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          requireReason: false
        };
    }
  };

  const actionDetails = getActionDetails();
  const ActionIcon = actionDetails.icon;

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (actionDetails.requireReason && !reason.trim()) {
      setError('Please provide a reason for this action.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const statusData = {
        status: actionDetails.newStatus
      };

      if (reason.trim()) {
        statusData.reason = reason.trim();
      }

      await updateTaskStatus(task._id, statusData);
      
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task status');
    } finally {
      setLoading(false);
    }
  };

  // Get current status info
  const getCurrentStatusInfo = (status) => {
    switch (status) {
      case 'active':
        return { label: 'Active', color: 'text-green-600', bgColor: 'bg-green-100' };
      case 'scheduled':
        return { label: 'Scheduled', color: 'text-blue-600', bgColor: 'bg-blue-100' };
      case 'in_progress':
        return { label: 'In Progress', color: 'text-orange-600', bgColor: 'bg-orange-100' };
      case 'completed':
        return { label: 'Completed', color: 'text-green-600', bgColor: 'bg-green-100' };
      case 'cancelled':
        return { label: 'Cancelled', color: 'text-red-600', bgColor: 'bg-red-100' };
      case 'paused':
        return { label: 'Paused', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
      default:
        return { label: status, color: 'text-gray-600', bgColor: 'bg-gray-100' };
    }
  };

  const currentStatus = getCurrentStatusInfo(task.status);

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className={`p-2 ${actionDetails.bgColor} rounded-lg`}>
              <ActionIcon className={`h-5 w-5 ${actionDetails.color}`} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{actionDetails.title}</h2>
              <p className="text-sm text-gray-500">Task: {task.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Status */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Current Status</h3>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${currentStatus.bgColor} ${currentStatus.color}`}>
                {currentStatus.label}
              </span>
            </div>
          </div>

          {/* New Status */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">New Status</h3>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${actionDetails.bgColor} ${actionDetails.color}`}>
                {actionDetails.newStatus.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-sm text-gray-600">{actionDetails.description}</p>
          </div>

          {/* Warning for destructive actions */}
          {action === 'cancel' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <FaExclamationTriangle className="h-5 w-5 text-red-600" />
                <h4 className="text-sm font-medium text-red-800">Warning</h4>
              </div>
              <p className="mt-2 text-sm text-red-700">
                Cancelling a task will permanently remove it from the active task list. 
                This action cannot be undone and may affect the tasker's earnings.
              </p>
            </div>
          )}

          {/* Reason Input */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {actionDetails.requireReason ? 'Reason (Required)' : 'Reason (Optional)'}
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={actionDetails.requireReason ? 
                  "Please provide a reason for this action..." : 
                  "Optional: Add a note about this status change..."
                }
              />
              {actionDetails.requireReason && (
                <p className="mt-1 text-xs text-gray-500">
                  A reason is required for this action.
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || (actionDetails.requireReason && !reason.trim())}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 ${
                  action === 'cancel' 
                    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                }`}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Updating...</span>
                  </div>
                ) : (
                  actionDetails.title
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskStatusModal; 