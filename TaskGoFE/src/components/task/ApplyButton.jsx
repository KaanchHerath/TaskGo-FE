import React, { useState } from 'react';
import { FaCheck, FaSpinner, FaDollarSign, FaStickyNote } from 'react-icons/fa';
import Modal from '../common/Modal';

const ApplyButton = ({ task, applying, onApply }) => {
  const [showModal, setShowModal] = useState(false);
  const [applicationData, setApplicationData] = useState({
    proposedPayment: '',
    note: ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setApplicationData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate proposed payment
    if (!applicationData.proposedPayment) {
      newErrors.proposedPayment = 'Proposed payment is required';
    } else {
      const payment = parseFloat(applicationData.proposedPayment);
      if (isNaN(payment) || payment <= 0) {
        newErrors.proposedPayment = 'Please enter a valid payment amount';
      } else if (payment < task.minPayment) {
        newErrors.proposedPayment = `Payment must be at least LKR ${task.minPayment}`;
      } else if (payment > task.maxPayment) {
        newErrors.proposedPayment = `Payment cannot exceed LKR ${task.maxPayment}`;
      }
    }

    // Note is optional, but if provided, validate length
    if (applicationData.note && applicationData.note.length > 500) {
      newErrors.note = 'Note cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onApply({
        proposedPayment: parseFloat(applicationData.proposedPayment),
        note: applicationData.note.trim()
      });
      
      // Reset form and close modal on success
      setApplicationData({ proposedPayment: '', note: '' });
      setShowModal(false);
    } catch (error) {
      console.error('Application error:', error);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setApplicationData({ proposedPayment: '', note: '' });
    setErrors({});
  };

  if (task.status !== 'active') {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FaCheck className="text-2xl text-white" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Task Not Available</h3>
          <p className="text-sm text-slate-600">
            This task is currently {task.status} and not accepting applications.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FaCheck className="text-2xl text-white" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Ready to Apply?</h3>
          <p className="text-sm text-slate-600">
            Submit your application and get started on this task.
          </p>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          disabled={applying}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <div className="flex items-center justify-center">
            <FaCheck className="mr-2" />
            Apply for Task
          </div>
        </button>
        
        <p className="text-xs text-slate-500 text-center mt-3">
          Click to submit your application for this task
        </p>
      </div>

      {/* Application Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
        title="Apply for Task"
        subtitle="Submit your application for this task"
        icon={FaCheck}
        iconColor="text-blue-600"
        iconBgColor="bg-blue-100"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Info Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
            <h3 className="font-semibold text-slate-800 mb-2">{task.title}</h3>
            <div className="text-sm text-slate-600">
              <p className="mb-1">Budget Range: <span className="font-medium text-green-600">LKR {task.minPayment} - {task.maxPayment}</span></p>
              <p>Category: <span className="font-medium">{task.category}</span></p>
            </div>
          </div>

          {/* Proposed Payment */}
          <div>
            <label htmlFor="proposedPayment" className="block text-sm font-semibold text-slate-700 mb-2">
              <FaDollarSign className="inline mr-2 text-green-500" />
              Your Proposed Payment *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-slate-500 font-medium">LKR</span>
              <input
                type="number"
                id="proposedPayment"
                name="proposedPayment"
                value={applicationData.proposedPayment}
                onChange={handleInputChange}
                placeholder="Enter your price"
                min={task.minPayment}
                max={task.maxPayment}
                step="0.01"
                className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.proposedPayment ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                }`}
              />
            </div>
            {errors.proposedPayment && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <span className="mr-1">⚠️</span>
                {errors.proposedPayment}
              </p>
            )}
            <p className="text-xs text-slate-500 mt-1">
              Must be between LKR {task.minPayment} and LKR {task.maxPayment}
            </p>
          </div>

          {/* Additional Note */}
          <div>
            <label htmlFor="note" className="block text-sm font-semibold text-slate-700 mb-2">
              <FaStickyNote className="inline mr-2 text-blue-500" />
              Additional Note (Optional)
            </label>
            <textarea
              id="note"
              name="note"
              value={applicationData.note}
              onChange={handleInputChange}
              placeholder="Tell the customer why you're the right person for this job, your experience, availability, etc."
              rows={4}
              maxLength={500}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                errors.note ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
              }`}
            />
            {errors.note && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <span className="mr-1">⚠️</span>
                {errors.note}
              </p>
            )}
            <p className="text-xs text-slate-500 mt-1">
              {applicationData.note.length}/500 characters
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleModalClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={applying}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {applying ? (
                <div className="flex items-center justify-center">
                  <FaSpinner className="animate-spin mr-2" />
                  Submitting...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <FaCheck className="mr-2" />
                  Submit
                </div>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default ApplyButton; 