import { useState } from 'react';
import { FaCalendarAlt, FaDollarSign, FaSpinner, FaCheck } from 'react-icons/fa';
import { confirmTime } from '../../services/api/taskService';
import Modal from '../common/Modal';

const ConfirmScheduleModal = ({ 
  isOpen, 
  onClose, 
  taskId, 
  task, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    confirmedTime: '',
    confirmedPayment: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.confirmedTime || !formData.confirmedPayment) {
      setError('Please fill in all fields');
      return;
    }

    const payment = parseFloat(formData.confirmedPayment);
    if (isNaN(payment) || payment < task.minPayment || payment > task.maxPayment) {
      setError(`Payment must be between LKR ${task.minPayment?.toLocaleString()} and LKR ${task.maxPayment?.toLocaleString()}`);
      return;
    }

    const confirmedDate = new Date(formData.confirmedTime);
    const taskStartDate = new Date(task.startDate);
    const taskEndDate = new Date(task.endDate);
    
    if (confirmedDate < taskStartDate || confirmedDate > taskEndDate) {
      setError('Confirmed time must be within the task date range');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await confirmTime(taskId, formData.confirmedTime, payment);
      
      // Show success and close modal
      onSuccess && onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        confirmedTime: '',
        confirmedPayment: ''
      });
      
    } catch (error) {
      console.error('Error confirming schedule:', error);
      setError(error.response?.data?.message || 'Failed to confirm schedule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTimeLocal = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Availability"
      subtitle="Set your preferred time and payment"
      icon={FaCheck}
      iconColor="text-green-600"
      iconBgColor="bg-green-100"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Task Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
          <h4 className="font-semibold text-slate-800 mb-2">{task?.title}</h4>
          <div className="text-sm text-slate-600 space-y-1">
            <p>Available: {new Date(task?.startDate).toLocaleDateString()} - {new Date(task?.endDate).toLocaleDateString()}</p>
            <p>Payment Range: LKR {task?.minPayment?.toLocaleString()} - LKR {task?.maxPayment?.toLocaleString()}</p>
          </div>
        </div>

        {/* Confirmed Time */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            <FaCalendarAlt className="inline mr-2 text-blue-500" />
            Preferred Date & Time
          </label>
          <input
            type="datetime-local"
            name="confirmedTime"
            value={formData.confirmedTime}
            onChange={handleInputChange}
            min={formatDateTimeLocal(task?.startDate)}
            max={formatDateTimeLocal(task?.endDate)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            required
          />
        </div>

        {/* Confirmed Payment */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            <FaDollarSign className="inline mr-2 text-green-500" />
            Proposed Payment
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium">LKR</span>
            <input
              type="number"
              name="confirmedPayment"
              value={formData.confirmedPayment}
              onChange={handleInputChange}
              min={task?.minPayment}
              max={task?.maxPayment}
              step="0.01"
              placeholder={`${task?.minPayment} - ${task?.maxPayment}`}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Must be between LKR {task?.minPayment?.toLocaleString()} and LKR {task?.maxPayment?.toLocaleString()}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700 text-sm flex items-center">
              <span className="mr-2">⚠️</span>
              {error}
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !formData.confirmedTime || !formData.confirmedPayment}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-lg flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                <span>Confirming...</span>
              </>
            ) : (
              <>
                <FaCheck />
                <span>Confirm Availability</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ConfirmScheduleModal; 