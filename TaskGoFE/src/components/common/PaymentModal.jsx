import React, { useState } from 'react';
import { FaCreditCard, FaLock, FaShieldAlt, FaTimes, FaSpinner } from 'react-icons/fa';
import { initiateAdvancePayment, redirectToPayHere } from '../../services/api/paymentService';

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  task, 
  applicationId = null,
  onPaymentSuccess,
  onPaymentError 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async () => {
    if (!task || !task.agreedPayment) {
      setError('Invalid task or payment information');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Calculate advance payment (20% of agreed payment)
      const advanceAmount = Math.round(task.agreedPayment * 0.2);

      console.log('Initiating payment:', {
        taskId: task._id,
        applicationId,
        agreedPayment: task.agreedPayment,
        advanceAmount
      });

      // Initiate payment with backend
      const response = await initiateAdvancePayment(task._id, applicationId);
      
      console.log('Payment initiation response:', response);
      
      if (response.success) {
        // Redirect to PayHere
        redirectToPayHere(response.data.paymentData, response.data.paymentUrl);
        
        // Close modal
        onClose();
        
        // Notify parent component
        if (onPaymentSuccess) {
          onPaymentSuccess(response.data);
        }
      } else {
        const errorMsg = response.message || 'Failed to initiate payment';
        console.error('Payment initiation failed:', errorMsg);
        setError(errorMsg);
        if (onPaymentError) {
          onPaymentError(errorMsg);
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      
      // Handle specific error types
      let errorMessage = 'Payment initiation failed';
      
      if (error.response?.status === 500) {
        errorMessage = error.response?.data?.message || 'Payment gateway configuration error. Please contact support.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You are not authorized to make this payment.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Task not found or no longer available.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      if (onPaymentError) {
        onPaymentError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  const advanceAmount = task ? Math.round(task.agreedPayment * 0.2) : 0;
  const remainingAmount = task ? task.agreedPayment - advanceAmount : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <FaCreditCard className="text-blue-600 text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Advance Payment</h3>
              <p className="text-sm text-gray-600">Secure payment via PayHere</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {task && (
            <div className="space-y-4">
              {/* Task Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{task.title}</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Category: {task.category}</p>
                  <p>Location: {task.area}</p>
                  <p>Agreed Time: {new Date(task.agreedTime).toLocaleString()}</p>
                </div>
              </div>

              {/* Payment Breakdown */}
              <div className="bg-blue-50 rounded-xl p-4">
                <h4 className="font-semibold text-blue-900 mb-3">Payment Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Agreed Payment:</span>
                    <span className="font-semibold">LKR {task.agreedPayment.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-blue-700">
                    <span>Advance Payment (20%):</span>
                    <span className="font-semibold">LKR {advanceAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Remaining Payment:</span>
                    <span>LKR {remainingAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Security Info */}
              <div className="bg-green-50 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <FaShieldAlt className="text-green-600" />
                  <span className="font-semibold text-green-900">Secure Payment</span>
                </div>
                <div className="text-sm text-green-700 space-y-1">
                  <p>• Your payment is secured by PayHere</p>
                  <p>• Advance payment will be held until task completion</p>
                  <p>• Tasker receives payment only after both parties mark task complete</p>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={loading}
                className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center space-x-2 ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105'
                }`}
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <FaLock />
                    <span>Pay LKR {advanceAmount.toLocaleString()}</span>
                  </>
                )}
              </button>

              {/* Terms */}
              <p className="text-xs text-gray-500 text-center">
                By proceeding, you agree to our payment terms and conditions.
                The advance payment will be held securely until task completion.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal; 