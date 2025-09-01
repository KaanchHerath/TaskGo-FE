import React from 'react';
import { useNavigate } from 'react-router-dom';

const RegistrationCTA = () => {
  const navigate = useNavigate();

  const handleCustomerClick = () => {
    navigate('/signup/customer');
  };

  const handleTaskerClick = () => {
    navigate('/signup/tasker');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Choose your registration type
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            How do you want to use TaskGo?
          </p>
        </div>
        <div className="mt-8 space-y-4">
          <button
            onClick={handleCustomerClick}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Register as a Customer
          </button>
          <button
            onClick={handleTaskerClick}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-md text-blue-600 border-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Register as a Tasker
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationCTA; 