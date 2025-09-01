import { useNavigate } from 'react-router-dom';

const RegistrationCTA = () => {
  const navigate = useNavigate();
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Customer Section */}
        <div className="bg-gray-100 p-8 rounded-lg">
          <h3 className="text-2xl font-bold mb-4 text-gray-900">Become a Customer</h3>
          <p className="text-gray-600 mb-6">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis ornare a dolor sed.
          </p>
          <button
            className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
            onClick={() => navigate('/signup/customer')}
          >
            Register Now
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Tasker Section */}
        <div className="bg-[#0967D3] p-8 rounded-lg">
          <h3 className="text-2xl font-bold mb-4 text-white">Become a Tasker</h3>
          <p className="text-white mb-6">
            Duis id massa praesent, mollis ligula non, efficitur dolor. Proin a feugiat sem, sed efficitur.
          </p>
          <button
            className="bg-white text-[#0967D3] px-6 py-3 rounded-lg flex items-center hover:bg-gray-50 transition-colors"
            onClick={() => navigate('/signup')}
          >
            Register Now
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationCTA;