import React, { useEffect, useState, useRef } from 'react';
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
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [orderId, setOrderId] = useState(null);

  // Add PayHere script to the page
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://www.payhere.lk/lib/payhere.js';
    script.async = true;
    document.head.appendChild(script);

    // Set up PayHere event handlers
    // Note: The actual task update happens in the backend via notify_url callback
    // This frontend callback is just for user experience
    if (window.payhere) {
      window.payhere.onCompleted = function onCompleted(orderId) {
        console.log("Payment completed. OrderID:" + orderId);
        // Payment completed - start checking payment status
        setPaymentStatus('checking');
        checkPaymentStatus(orderId);
      };

      window.payhere.onDismissed = function onDismissed() {
        console.log("Payment dismissed");
        // User closed payment dialog - show error
        setError('Payment was cancelled. Please try again.');
      };

      window.payhere.onError = function onError(error) {
        console.log("Error:" + error);
        setError('Payment error occurred. Please try again.');
      };
    }

    return () => {
      // Cleanup script when component unmounts
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [onClose, onPaymentSuccess]);

  // Function to check payment status
  const checkPaymentStatus = async (orderIdToCheck) => {
    try {
      // Poll the backend to check payment status
      const maxAttempts = 10;
      let attempts = 0;
      
      const checkStatus = async () => {
        attempts++;
        console.log(`Checking payment status attempt ${attempts}/${maxAttempts}`);
        
        try {
          // Check payment status from backend
          const response = await fetch(`/api/payments/status/${orderIdToCheck}`);
          const data = await response.json();
          
          if (data.success && data.data.paymentStatus === 'completed') {
            console.log('Payment confirmed successful!');
            setPaymentStatus('success');
            setLoading(false);
            onClose();
            if (onPaymentSuccess) {
              onPaymentSuccess();
            }
            // Show success message
            alert('Payment successful! Your task has been scheduled.');
            return;
          } else if (data.success && data.data.paymentStatus === 'failed') {
            console.log('Payment failed');
            setPaymentStatus('failed');
            setError('Payment failed. Please try again.');
            return;
          }
        } catch (error) {
          console.log('Error checking payment status:', error);
        }
        
        // If not successful and haven't reached max attempts, try again
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 2000); // Check again in 2 seconds
        } else {
          console.log('Max attempts reached, payment status unknown');
          setPaymentStatus('unknown');
          setError('Payment completed but status is unclear. Please check your task status or contact support.');
        }
      };
      
      checkStatus();
      
    } catch (error) {
      console.error('Error in payment status check:', error);
      setPaymentStatus('error');
      setError('Error checking payment status. Please check your task status or contact support.');
    }
  };

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

      // Initiate payment with backend to get hash and payment data
      const response = await initiateAdvancePayment(task._id, applicationId);
      
      console.log('Payment initiation response:', response);
      
      if (response.success) {
        // Store the order ID for status checking
        setOrderId(response.data.orderId);
        
        // Prepare payment data for PayHere SDK
        const payment = {
          "sandbox": true, // Change to false for production
          "merchant_id": "1231112", // TODO: Replace with your actual PayHere Merchant ID
          "return_url": undefined, // Important - set to undefined for popup
          "cancel_url": undefined, // Important - set to undefined for popup
          "notify_url": "https://e35ac3324b95.ngrok-free.app/api/payments/notify", // ngrok URL for local development
          "order_id": response.data.orderId, // Use the orderId from backend (IMPORTANT!)
          "items": `Advance Payment - ${task.title}`,
          "amount": advanceAmount.toFixed(2),
          "currency": "LKR",
          "hash": response.data.hash, // Hash generated by backend
          "first_name": task.customer?.fullName?.split(' ')[0] || 'Customer',
          "last_name": task.customer?.fullName?.split(' ').slice(1).join(' ') || 'User',
          "email": task.customer?.email || 'customer@example.com',
          "phone": task.customer?.phone || '0770000000',
          "address": task.area || 'Colombo',
          "city": task.area || 'Colombo',
          "country": "Sri Lanka",
          "custom_1": task._id, // Store task ID
          "custom_2": applicationId || '' // Store application ID if exists
        };

        // Debug: Log the payment data being sent to PayHere
        console.log('Payment data being sent to PayHere:', payment);
        console.log('Hash from backend:', response.data.hash);

        // Start PayHere payment popup
        if (window.payhere && window.payhere.startPayment) {
          window.payhere.startPayment(payment);
        } else {
          setError('PayHere SDK not loaded. Please refresh and try again.');
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

  // Remove the iframe-related useEffect
  // useEffect(() => {
  //   if (!gatewayData || !formRef.current) return;
  //   try {
  //     formRef.current.submit();
  //   } catch (_) {
  //     // noop
  //   }
  // }, [gatewayData]);

  if (!isOpen) return null;
  const advanceAmount = task ? Math.round(task.agreedPayment * 0.2) : 0;
  const remainingAmount = task ? task.agreedPayment - advanceAmount : 0;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-3 md:p-4 border-b border-gray-200">
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
        <div className="p-3 md:p-4">
          {task && (
            <div className="space-y-3">
              {/* Task Info */}
              <div className="bg-gray-50 rounded-xl p-2">
                <h4 className="font-semibold text-gray-900 mb-1">{task.title}</h4>
                <div className="text-sm text-gray-600">
                  <p className="mb-0">Category: {task.category}</p>
                  <p className="mb-0">Location: {task.area}</p>
                  <p className="mb-0">Agreed Time: {new Date(task.agreedTime).toLocaleString()}</p>
                </div>
              </div>

              {/* Payment Breakdown */}
              <div className="bg-blue-50 rounded-xl p-3">
                <h4 className="font-semibold text-blue-900 mb-2">Payment Breakdown</h4>
                <div className="space-y-1">
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
              <div className="bg-green-50 rounded-xl p-2">
                <div className="flex items-center space-x-2 mb-1">
                  <FaShieldAlt className="text-green-600" />
                  <span className="font-semibold text-green-900">Secure Payment</span>
                </div>
                <div className="text-sm text-green-700 space-y-0">
                  <p>• Your payment is secured by PayHere</p>
                  <p>• Advance payment will be held until task completion</p>
                  <p>• Tasker receives payment only after both parties mark task complete</p>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={loading || paymentStatus === 'checking'}
                className={`w-full py-2.5 px-6 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center space-x-2 ${
                  loading || paymentStatus === 'checking'
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105'
                }`}
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : paymentStatus === 'checking' ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Confirming Payment...</span>
                  </>
                ) : (
                  <>
                    <FaLock />
                    <span>Pay LKR {advanceAmount.toLocaleString()}</span>
                  </>
                )}
              </button>

              {/* Payment Status Indicator */}
              {paymentStatus === 'checking' && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <div className="flex items-center space-x-2">
                    <FaSpinner className="animate-spin text-blue-600" />
                    <span className="text-blue-700 text-sm">
                      Payment completed! Confirming with our servers...
                    </span>
                  </div>
                </div>
              )}

              {paymentStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                  <div className="flex items-center space-x-2">
                    <FaShieldAlt className="text-green-600" />
                    <span className="text-green-700 text-sm">
                      Payment successful! Your task has been scheduled.
                    </span>
                  </div>
                </div>
              )}

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