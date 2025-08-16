import React, { useState } from 'react';
import { 
  FaTimes, 
  FaCheck, 
  FaTimes as FaReject,
  FaExclamationTriangle,
  FaUser,
  FaInfoCircle
} from 'react-icons/fa';

const ApprovalModal = ({ tasker, action, onConfirm, onCancel }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isApproval = action === 'approve';
  const isRejection = action === 'reject';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate reason for rejection
    if (isRejection && !reason.trim()) {
      setError('Please provide a reason for rejection.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onConfirm(reason.trim());
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = () => {
    return isApproval ? 'text-green-600' : 'text-red-600';
  };

  const getActionBgColor = () => {
    return isApproval ? 'bg-green-100' : 'bg-red-100';
  };

  const getActionIcon = () => {
    return isApproval ? <FaCheck className="w-6 h-6" /> : <FaReject className="w-6 h-6" />;
  };

  const getActionTitle = () => {
    return isApproval ? 'Approve Tasker' : 'Reject Tasker';
  };

  const getActionDescription = () => {
    return isApproval 
      ? 'Are you sure you want to approve this tasker? They will be able to start accepting tasks immediately.'
      : 'Are you sure you want to reject this tasker? They will be notified of the rejection and reason.';
  };

  const getActionButtonText = () => {
    return isApproval ? 'Approve Tasker' : 'Reject Tasker';
  };

  const getActionButtonColor = () => {
    return isApproval 
      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
      : 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full sm:max-w-lg md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`flex items-center justify-between p-4 ${getActionBgColor()} rounded-t-lg`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${getActionBgColor()}`}>
              {getActionIcon()}
            </div>
            <div>
              <h2 className={`text-xl font-bold ${getActionColor()}`}>
                {getActionTitle()}
              </h2>
              <p className="text-gray-600 text-sm">
                Review tasker application
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Tasker Info */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex items-start space-x-3">
              <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <FaUser className="w-5 h-5 text-blue-600" />
              </div>
              <div className="leading-tight">
                <h3 className="font-semibold text-gray-900 text-sm">{tasker.fullName}</h3>
                <div className="text-xs text-gray-600 flex items-center gap-2">
                  <span>{tasker.email}</span>
                  {tasker.phone && <span className="text-gray-400">•</span>}
                  {tasker.phone && <span>{tasker.phone}</span>}
                </div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Location:</span>
                <p className="font-medium">{tasker.taskerProfile?.province}, {tasker.taskerProfile?.district}</p>
              </div>
              <div>
                <span className="text-gray-500">Experience:</span>
                <p className="font-medium">{tasker.taskerProfile?.experience || 'Not specified'}</p>
              </div>
              <div>
                <span className="text-gray-500">Skills:</span>
                <p className="font-medium">{tasker.taskerProfile?.skills?.slice(0, 2).join(', ')}</p>
              </div>
              <div>
                <span className="text-gray-500">Rate:</span>
                <p className="font-medium">${tasker.taskerProfile?.hourlyRate || 'Not specified'}/hr</p>
              </div>
            </div>
          </div>

          {/* Action Description */}
          <div className="mb-4">
            <div className="flex items-start space-x-2 text-sm">
              <FaInfoCircle className="w-5 h-5 text-blue-500 mt-0.5" />
              <p className="text-gray-700">{getActionDescription()}</p>
            </div>
          </div>

          {/* Reason Input (Required for rejection) */}
          {isRejection && (
            <div className="mb-4">
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-sm"
                rows="3"
                required
              />
              <p className="text-[11px] text-gray-500 mt-1">
                This reason will be shared with the tasker.
              </p>
            </div>
          )}

          {/* Optional Reason for Approval */}
          {isApproval && (
            <div className="mb-4">
              <label htmlFor="approvalReason" className="block text-sm font-medium text-gray-700 mb-2">
                Approval Note (Optional)
              </label>
              <textarea
                id="approvalReason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Add a note for the tasker (optional)..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-sm"
                rows="3"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                This note will be shared with the tasker upon approval.
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
              <div className="flex items-center space-x-2">
                <FaExclamationTriangle className="w-4 h-4 text-red-500" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Warning for Rejection */}
          {isRejection && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
              <div className="flex items-start space-x-2">
                <FaExclamationTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Important</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Rejecting a tasker will prevent them from accessing the platform. 
                    They will be notified of the rejection and can reapply in the future.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || (isRejection && !reason.trim())}
            className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2 ${getActionButtonColor()}`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                {getActionIcon()}
                <span>{getActionButtonText()}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApprovalModal; 