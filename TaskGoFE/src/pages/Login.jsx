import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import loginImage from '../assets/login.png';
import { login } from '../services/api/authService';
import { parseJwt, roleToDashboard, setToken } from '../utils/auth';

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
      const response = await login(credentials);
      setToken(response.token);
      const payload = parseJwt(response.token);
      const dashboard = roleToDashboard[payload?.role] || '/';
      navigate(dashboard);
    } catch (err) {
      if (err.status === 403 && err?.data?.approvalStatus === 'rejected') {
        const msg = err?.data?.rejectionReason || 'No note provided.';
        setError(`Your account approval has been rejected by the admin. Note: ${msg} If you have any questions, please contact us at info@taskgo.com`);
      } else if (err.status === 403 && err?.data?.accountStatus === 'not_approved') {
        // For pending taskers, redirect to waiting approval page instead of showing error
        if (err?.data?.approvalStatus === 'pending') {
          navigate('/tasker/waiting-approval');
          return;
        }
        setError('Your account is pending approval. You will be notified once approved.');
      } else {
        setError(err.message || 'Login failed');
      }
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
          <h2 className="text-2xl font-bold mb-2">Welcome Back!</h2>
          <p className="text-gray-600">Meet the good taste today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="text-red-500 text-sm text-center mb-4">{error}</div>}
          <div>
            <input
              type="text"
              placeholder="Type your e-mail or phone number"
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Type your password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end mt-2">
              <Link to="/forgot-password" className="text-sm text-gray-600 hover:text-blue-600">
                Forgot Password?
              </Link>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          <div className="text-center text-sm text-gray-500">
            or sign in with another account
          </div>

          <div className="flex justify-center space-x-4">
            <button className="p-2 border rounded-lg hover:bg-gray-50">
              <img src="/google-icon.svg" alt="Google" className="w-6 h-6" />
            </button>
            <button className="p-2 border rounded-lg hover:bg-gray-50">
              <img src="/apple-icon.svg" alt="Apple" className="w-6 h-6" />
            </button>
            <button className="p-2 border rounded-lg hover:bg-gray-50">
              <img src="/facebook-icon.svg" alt="Facebook" className="w-6 h-6" />
            </button>
          </div>

          <div className="text-center text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 font-semibold hover:text-blue-700">
              Sign up as Customer or Tasker
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