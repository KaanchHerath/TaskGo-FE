import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaGoogle, FaApple, FaFacebook, FaArrowLeft, FaSpinner } from 'react-icons/fa';
import loginImage from '../../assets/login.png';
import { login } from '../../services/api/authService';
import { parseJwt, roleToDashboard, setToken } from '../../utils/auth';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await login(credentials);
      setToken(data.token);
      window.dispatchEvent(new Event('authStateChanged'));
      const payload = parseJwt(data.token);
      const dashboard = roleToDashboard[payload?.role] || '/';
      navigate(dashboard);
    } catch (err) {
      // Show special message for rejected taskers
      const approvalStatus = err?.data?.approvalStatus;
      const rejectionReason = err?.data?.rejectionReason;
      if (err.status === 403 && approvalStatus === 'rejected') {
        setError( <>
          Your account approval has been rejected by the admin.
          <br />
          Note: {rejectionReason || 'No note provided.'}
          <br />
          If you have any questions, please contact us at info@taskgo.com
        </>);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>
      <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-3xl"></div>
      <div className="absolute top-20 right-20 w-48 h-48 bg-indigo-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-1/4 w-24 h-24 bg-purple-200/20 rounded-full blur-2xl"></div>
      <div className="absolute bottom-20 right-1/3 w-40 h-40 bg-pink-200/20 rounded-full blur-3xl"></div>
      
      {/* Subtle Pattern Overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      {/* Back to Home Button */}
      <div className="absolute top-6 left-6 z-20">
        <Link 
          to="/"
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors bg-white/70 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border border-white/20"
        >
          <FaArrowLeft className="text-sm" />
          <span className="font-medium">Back to Home</span>
        </Link>
      </div>

      <div className="flex min-h-screen relative z-10">
        {/* Left Section - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Logo/Brand */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                TaskGo
              </h1>
              <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mx-auto"></div>
            </div>

            {/* Login Card */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Welcome Back!
                  </span>
                </h2>
                <p className="text-slate-600">Sign in to your TaskGo account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      {error}
                    </div>
                  </div>
                )}
                
                {/* Email Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Email Address</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={credentials.email}
                      onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-white/80 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-700 placeholder-slate-400 shadow-sm"
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Password</label>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={credentials.password}
                      onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                      className="w-full pl-12 pr-12 py-4 bg-white/80 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-700 placeholder-slate-400 shadow-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  <div className="flex justify-end">
                    <Link 
                      to="/forgot-password" 
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                </div>

                {/* Submit Button */}
                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <FaSpinner className="animate-spin" />
                      Signing In...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  
                </div>

                

                {/* Sign Up Link */}
                <div className="text-center text-sm pt-4">
                  <span className="text-slate-600">Don't have an account? </span>
                  <Link 
                    to="/signup" 
                    className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                  >
                    Sign up here
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right Section - Illustration */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-3xl blur-3xl"></div>
            
              <img 
                src={loginImage} 
                alt="Login illustration" 
                className="max-w-md w-full drop-shadow-2xl"
              />
           
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 