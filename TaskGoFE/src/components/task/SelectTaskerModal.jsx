import React, { useState } from 'react';
import { FaCheckCircle, FaClock, FaDollarSign, FaUser, FaEye } from 'react-icons/fa';
import Modal from '../common/Modal';
import TaskerProfilePopup from './TaskerProfilePopup';

const SelectTaskerModal = ({ isOpen, onClose, applications = [], onSelect, isSelecting = false }) => {
  const [selectedTaskerId, setSelectedTaskerId] = useState(null);
  const [selectedTaskerName, setSelectedTaskerName] = useState('');
  const [showProfilePopup, setShowProfilePopup] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleString();
    } catch (_) {
      return String(dateString);
    }
  };

  const selectable = applications.filter(
    (a) => a.confirmedByTasker && a.confirmedTime && a.confirmedPayment
  );

  const handleViewProfile = (taskerId, taskerName) => {
    setSelectedTaskerId(taskerId);
    setSelectedTaskerName(taskerName);
    setShowProfilePopup(true);
  };

  const closeProfilePopup = () => {
    setShowProfilePopup(false);
    setSelectedTaskerId(null);
    setSelectedTaskerName('');
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Select a Tasker"
        subtitle="Choose from applicants who have confirmed time and payment"
        icon={FaCheckCircle}
        iconColor="text-green-600"
        iconBgColor="bg-green-100"
        maxWidth="max-w-lg"
      >
        {applications.length === 0 ? (
          <div className="text-center text-gray-600">No applications yet.</div>
        ) : selectable.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg">
            No applicants have confirmed time and payment yet. You can chat with applicants to request confirmation.
          </div>
        ) : (
          <div className="space-y-4">
            {selectable.map((application) => (
              <div key={application._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <FaUser className="text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{application.tasker?.fullName}</div>
                      <div className="text-xs text-gray-500">Applied {formatDate(application.createdAt)}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewProfile(application.tasker._id, application.tasker.fullName)}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      title="View Profile"
                    >
                      <FaEye className="text-sm" />
                      <span className="text-sm">View Profile</span>
                    </button>
                    <button
                      onClick={() => onSelect && onSelect(application)}
                      disabled={isSelecting}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSelecting ? 'Selecting...' : 'Select Tasker'}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <FaClock className="text-blue-600" />
                    <span>Time: {formatDate(application.confirmedTime)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaDollarSign className="text-orange-600" />
                    <span>Payment: LKR {application.confirmedPayment?.toLocaleString()}</span>
                  </div>
                  {application.note && (
                    <div className="md:col-span-3 bg-gray-50 border border-gray-200 rounded p-2">
                      <span className="text-gray-700">Note: {application.note}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Tasker Profile Popup */}
      <TaskerProfilePopup
        isOpen={showProfilePopup}
        onClose={closeProfilePopup}
        taskerId={selectedTaskerId}
        taskerName={selectedTaskerName}
      />
    </>
  );
};

export default SelectTaskerModal;


