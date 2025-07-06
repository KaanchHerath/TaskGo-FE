import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaSpinner, FaHome, FaTasks } from 'react-icons/fa';
import { taskService } from '../services/api/taskService';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState(null);
  const [error, setError] = useState('');

  const orderId = searchParams.get('order_id');
  const paymentId = searchParams.get('payment_id');

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        if (orderId) {
          // Extract task ID from order ID (format: TASK_taskId_timestamp_random)
          const taskId = orderId.split('_')[1];
          if (taskId) {
            const response = await taskService.getTask(taskId);
            if (response.success) {
              setTask(response.data);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching task details:', error);
        setError('Failed to load task details');
      } finally {
        setLoading(false);
      }
    };

    fetchTaskDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Processing your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        {/* Success Icon */}
        <div className="text-center mb-6">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheckCircle className="text-green-600 text-4xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">Your advance payment has been processed successfully.</p>
        </div>

        {/* Payment Details */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Payment Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-mono text-gray-800">{orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment ID:</span>
              <span className="font-mono text-gray-800">{paymentId}</span>
            </div>
            {task && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Task:</span>
                  <span className="font-semibold text-gray-800">{task.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Advance Payment:</span>
                  <span className="font-semibold text-green-600">
                    LKR {task.advancePayment?.toLocaleString() || 'N/A'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>• Your task has been scheduled successfully</p>
            <p>• The tasker will be notified of the payment</p>
            <p>• You can track your task progress in your dashboard</p>
            <p>• Advance payment will be released after task completion</p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/customer/dashboard')}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center space-x-2"
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
            You will receive a confirmation email shortly. 
            If you have any questions, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess; 