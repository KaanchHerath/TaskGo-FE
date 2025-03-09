import { useState } from 'react';
import { Link } from 'react-router-dom';

const Signup = () => {
  const [userType, setUserType] = useState('customer');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-lg flex">
        {/* Customer Section */}
        <div 
          className={`w-1/2 p-8 rounded-l-xl transition-all ${
            userType === 'customer' ? 'bg-gray-100' : 'bg-white hover:bg-gray-50 cursor-pointer'
          }`}
          onClick={() => setUserType('customer')}
        >
          <h3 className="text-2xl font-bold mb-4">Become a Customer</h3>
          <p className="text-gray-600 mb-6">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis ornare a dolor sed.
          </p>
          <Link 
            to={userType === 'customer' ? "/register/customer" : "#"}
            className={`inline-flex items-center ${
              userType === 'customer' 
                ? 'text-blue-600 hover:text-blue-700' 
                : 'text-gray-400'
            }`}
          >
            Register Now
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Tasker Section */}
        <div 
          className={`w-1/2 p-8 rounded-r-xl transition-all ${
            userType === 'tasker' ? 'bg-[#0967D3] text-white' : 'bg-white hover:bg-gray-50 cursor-pointer'
          }`}
          onClick={() => setUserType('tasker')}
        >
          <h3 className="text-2xl font-bold mb-4">Become a Tasker</h3>
          <p className={`mb-6 ${userType === 'tasker' ? 'text-white' : 'text-gray-600'}`}>
            Duis id massa praesent, mollis ligula non, efficitur dolor. Proin a feugiat sem.
          </p>
          <Link 
            to={userType === 'tasker' ? "/register/tasker" : "#"}
            className={`inline-flex items-center ${
              userType === 'tasker' 
                ? 'text-white hover:text-gray-100' 
                : 'text-gray-400'
            }`}
          >
            Register Now
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;