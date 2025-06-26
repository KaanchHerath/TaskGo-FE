import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import loginImage from '../../assets/login.png';

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

const roleToDashboard = {
  customer: '/customer/dashboard',
  tasker: '/tasker/dashboard',
  admin: '/admin/dashboard',
};

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Login failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      
      // Dispatch custom event to notify navbar of auth change
      window.dispatchEvent(new Event('authStateChanged'));
      
      const payload = parseJwt(data.token);
      const dashboard = roleToDashboard[payload?.role] || '/';
      navigate(dashboard);
    } catch (err) {
      setError(err.message);
      console.error('Login Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Section */}
      <div className="w-1/2 p-8 flex flex-col justify-center max-w-md mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome Back!</h2>
          <p className="text-gray-600">Sign in to your TaskGo account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="text-red-500 text-sm text-center mb-4 p-3 bg-red-50 rounded-lg">{error}</div>}
          
          <div>
            <input
              type="email"
              placeholder="Enter your email"
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Enter your password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <div className="flex justify-end mt-2">
              <Link to="/forgot-password" className="text-sm text-gray-600 hover:text-blue-600">
                Forgot Password?
              </Link>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-black text-white py-4 rounded-lg hover:bg-gray-800 transition-colors font-semibold"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          <div className="text-center text-sm text-gray-500">
            or sign in with another account
          </div>

          <div className="flex justify-center space-x-4">
            <button type="button" className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="text-lg">G</span>
            </button>
            <button type="button" className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="text-lg">A</span>
            </button>
            <button type="button" className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="text-lg">F</span>
            </button>
          </div>

          <div className="text-center text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 font-semibold hover:text-blue-700">
              Sign up here
            </Link>
          </div>
        </form>
      </div>

      {/* Right Section - Illustration */}
      <div className="w-1/2 bg-gray-50 flex items-center justify-center">
        <img 
          src={loginImage} 
          alt="Login illustration" 
          className="max-w-md"
        />
      </div>
    </div>
  );
};

export default Login; 