import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaTimesCircle, FaHome, FaTasks, FaRedo } from 'react-icons/fa';

const PaymentFailed = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderId = searchParams.get('order_id');
  const reason = searchParams.get('reason') || 'payment_failed';

  const getErrorMessage = (reason) => {
    switch (reason) {
      case 'payment_failed':
        return 'Your payment was not processed successfully.';
      case 'insufficient_funds':
        return 'Insufficient funds in your account.';
      case 'card_declined':
        return 'Your card was declined. Please try a different payment method.';
      case 'server_error':
        return 'A server error occurred. Please try again later.';
      default:
        return 'An error occurred during payment processing.';
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        {/* Error Icon */}
        <div className="text-center mb-6">
          <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTimesCircle className="text-red-600 text-4xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
          <p className="text-gray-600">{getErrorMessage(reason)}</p>
        </div>

        {/* Error Details */}
        <div className="bg-red-50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-red-900 mb-3">What happened?</h3>
          <div className="text-sm text-red-800 space-y-2">
            <p>• Your advance payment was not processed</p>
            <p>• Your task has not been scheduled</p>
            <p>• No charges were made to your account</p>
            <p>• You can try the payment again</p>
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

        {/* Troubleshooting */}
        <div className="bg-blue-50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Troubleshooting Tips</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>• Check your internet connection</p>
            <p>• Verify your payment method details</p>
            <p>• Ensure you have sufficient funds</p>
            <p>• Try using a different payment method</p>
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

        {/* Support Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Need help? Contact our support team at support@taskgo.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed; 