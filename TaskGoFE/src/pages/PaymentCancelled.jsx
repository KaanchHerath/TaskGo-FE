import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaBan, FaHome, FaTasks, FaRedo } from 'react-icons/fa';

const PaymentCancelled = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderId = searchParams.get('order_id');
  const reason = searchParams.get('reason') || 'user_cancelled';

  const getCancellationMessage = (reason) => {
    switch (reason) {
      case 'user_cancelled':
        return 'You cancelled the payment process.';
      case 'timeout':
        return 'Payment session timed out.';
      case 'server_error':
        return 'A server error occurred during payment.';
      default:
        return 'The payment was cancelled.';
    }
  };

  const handleRetry = () => {
    // Navigate back to the task details page
    if (orderId) {
      const taskId = orderId.split('_')[1];
      if (taskId) {
        navigate(`/task/${taskId}`);
      } else {
        navigate('/customer/dashboard');
      }
    } else {
      navigate('/customer/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        {/* Cancellation Icon */}
        <div className="text-center mb-6">
          <div className="bg-yellow-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaBan className="text-yellow-600 text-4xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
          <p className="text-gray-600">{getCancellationMessage(reason)}</p>
        </div>

        {/* Cancellation Details */}
        <div className="bg-yellow-50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-yellow-900 mb-3">What happened?</h3>
          <div className="text-sm text-yellow-800 space-y-2">
            <p>• Your payment process was cancelled</p>
            <p>• No charges were made to your account</p>
            <p>• Your task has not been scheduled</p>
            <p>• You can try the payment again anytime</p>
          </div>
        </div>

        {/* Order Details */}
        {orderId && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Order Details</h3>
            <div className="text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-mono text-gray-800">{orderId}</span>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">What can you do?</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>• Try the payment again</p>
            <p>• Check your task details</p>
            <p>• Contact the tasker if needed</p>
            <p>• Browse other available tasks</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <FaRedo />
            <span>Try Again</span>
          </button>
          
          <button
            onClick={() => navigate('/customer/dashboard')}
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <FaTasks />
            <span>Go to Dashboard</span>
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <FaHome />
            <span>Back to Home</span>
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Your task will remain active until you complete the payment or cancel it.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelled; 