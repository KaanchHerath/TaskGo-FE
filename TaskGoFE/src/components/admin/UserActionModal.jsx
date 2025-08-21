import React, { useState } from 'react';
import { 
  FaTimes, 
  FaUserSlash, 
  FaTrash, 
  FaUserCheck,
  FaExclamationTriangle,
  FaUser,
  FaInfoCircle,
  FaShieldAlt
} from 'react-icons/fa';

const UserActionModal = ({ user, action, onConfirm, onCancel }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isSuspend = action === 'suspend';
  const isUnsuspend = action === 'unsuspend';
  const isDelete = action === 'delete';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate reason for suspend and delete actions
    if ((isSuspend || isDelete) && !reason.trim()) {
      setError('Please provide a reason for this action.');
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
    if (isDelete) return 'text-red-600';
    if (isSuspend) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getActionBgColor = () => {
    if (isDelete) return 'bg-red-100';
    if (isSuspend) return 'bg-yellow-100';
    return 'bg-green-100';
  };

  const getActionIcon = () => {
    if (isDelete) return <FaTrash className="w-6 h-6" />;
    if (isSuspend) return <FaUserSlash className="w-6 h-6" />;
    return <FaUserCheck className="w-6 h-6" />;
  };

  const getActionTitle = () => {
    if (isDelete) return 'Delete User';
    if (isSuspend) return 'Suspend User';
    return 'Unsuspend User';
  };

  const getActionDescription = () => {
    if (isDelete) {
      return 'Are you sure you want to permanently delete this user? This action cannot be undone and will remove all user data from the system.';
    }
    if (isSuspend) {
      return 'Are you sure you want to suspend this user? They will not be able to access the platform until unsuspended.';
    }
    return 'Are you sure you want to unsuspend this user? They will regain access to the platform immediately.';
  };

  const getActionButtonText = () => {
    if (isDelete) return 'Delete User';
    if (isSuspend) return 'Suspend User';
    return 'Unsuspend User';
  };

  const getActionButtonColor = () => {
    if (isDelete) return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
    if (isSuspend) return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500';
    return 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
  };

  const getReasonLabel = () => {
    if (isDelete) return 'Deletion Reason';
    if (isSuspend) return 'Suspension Reason';
    return 'Unsuspension Note (Optional)';
  };

  const getReasonPlaceholder = () => {
    if (isDelete) return 'Please provide a reason for deletion...';
    if (isSuspend) return 'Please provide a reason for suspension...';
    return 'Add a note for unsuspension (optional)...';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className={`flex items-center justify-between p-6 ${getActionBgColor()} rounded-t-lg`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${getActionBgColor()}`}>
              {getActionIcon()}
            </div>
            <div>
              <h2 className={`text-xl font-bold ${getActionColor()}`}>
                {getActionTitle()}
              </h2>
              <p className="text-gray-600 text-sm">
                User management action
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
        <div className="p-6">
          {/* User Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <FaUser className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{user.fullName}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-600">{user.phone}</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Role:</span>
                <p className="font-medium capitalize">{user.role}</p>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <p className="font-medium">
                  {user.isSuspended ? 'Suspended' : user.isApproved === false ? 'Pending' : 'Active'}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Location:</span>
                <p className="font-medium">{user.province}, {user.district}</p>
              </div>
              <div>
                <span className="text-gray-500">Registered:</span>
                <p className="font-medium">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Action Description */}
          <div className="mb-6">
            <div className="flex items-start space-x-2">
              <FaInfoCircle className="w-5 h-5 text-blue-500 mt-0.5" />
              <p className="text-gray-700">{getActionDescription()}</p>
            </div>
          </div>

          {/* Reason Input */}
          <div className="mb-6">
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              {getReasonLabel()} {isDelete || isSuspend ? <span className="text-red-500">*</span> : ''}
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={getReasonPlaceholder()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="4"
              required={isDelete || isSuspend}
            />
            <p className="text-xs text-gray-500 mt-1">
              {isDelete 
                ? 'This reason will be logged for audit purposes.'
                : isSuspend 
                ? 'This reason will be shared with the user.'
                : 'This note will be logged for audit purposes.'
              }
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <FaExclamationTriangle className="w-4 h-4 text-red-500" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Warning for Delete */}
          {isDelete && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <FaExclamationTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">⚠️ Irreversible Action</p>
                  <p className="text-sm text-red-700 mt-1">
                    Deleting a user will permanently remove all their data including:
                  </p>
                  <ul className="text-sm text-red-700 mt-1 list-disc list-inside">
                    <li>User profile and account information</li>
                    <li>Task history and ratings</li>
                    <li>Payment records</li>
                    <li>All associated documents</li>
                  </ul>
                  <p className="text-sm text-red-700 mt-2 font-medium">
                    This action cannot be undone!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Warning for Suspend */}
          {isSuspend && (
            <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <FaExclamationTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Important</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Suspending a user will prevent them from accessing the platform. 
                    They will be notified of the suspension and can contact support for assistance.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Info for Unsuspend */}
          {isUnsuspend && (
            <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <FaShieldAlt className="w-4 h-4 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-800">User Access Restored</p>
                  <p className="text-sm text-green-700 mt-1">
                    Unsuspending a user will immediately restore their access to the platform. 
                    They will be able to log in and use all features normally.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || ((isDelete || isSuspend) && !reason.trim())}
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

export default UserActionModal; 