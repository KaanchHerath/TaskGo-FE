import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import loginImage from '../../assets/login.png';
import { registerCustomer } from '../../services/api/authService';
import { 
  validateCustomerSignup, 
  validateMobileNumber, 
  validateEmail, 
  validatePassword, 
  validateName,
  validateProvince,
  formatPhoneNumber,
  getFieldError 
} from '../../utils/validation';
import { PROVINCES } from '../../config/locations';

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

const CustomerSignup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    province: ''
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const navigate = useNavigate();



  // Real-time validation on field change
  const validateField = (name, value) => {
    switch (name) {
      case 'fullName':
        return getFieldError(name, value, 'name');
      case 'email':
        return getFieldError(name, value, 'email');
      case 'phone':
        return getFieldError(name, value, 'phone');
      case 'password':
        return getFieldError(name, value, 'password');
      case 'confirmPassword':
        return formData.password !== value ? 'Passwords do not match' : null;
      case 'province':
        return getFieldError(name, value, 'province');
      default:
        return null;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Format phone number as user types
    if (name === 'phone') {
      const formattedPhone = formatPhoneNumber(value);
      setFormData(prev => ({ ...prev, [name]: formattedPhone }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
    
    // Validate field if it has been touched
    if (touched[name]) {
      const fieldError = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: fieldError }));
    }
    
    // Clear submit error when user makes changes
    if (submitError) {
      setSubmitError('');
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const fieldError = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: fieldError }));
  };

  const getPasswordStrengthColor = (password) => {
    if (!password) return 'bg-gray-200';
    const strength = validatePassword(password).strength;
    switch (strength) {
      case 'weak': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'strong': return 'bg-blue-500';
      case 'very-strong': return 'bg-green-500';
      default: return 'bg-gray-200';
    }
  };

  const getPasswordStrengthText = (password) => {
    if (!password) return '';
    const strength = validatePassword(password).strength;
    return strength.charAt(0).toUpperCase() + strength.slice(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    
    // Mark all fields as touched
    const allTouched = {
      fullName: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
      province: true
    };
    setTouched(allTouched);
    
    // Validate entire form
    const validation = validateCustomerSignup(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }
    
    try {
      const data = await registerCustomer({
        ...validation.cleanData,
        role: 'customer',
        username: validation.cleanData.email
      });
      
      localStorage.setItem('token', data.token);
      
      // Dispatch custom event to notify navbar of auth change
      window.dispatchEvent(new Event('authStateChanged'));
      
      navigate('/customer/dashboard');
    } catch (err) {
      setSubmitError(err.message || 'Registration failed. Please try again.');
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Section */}
      <div className="w-1/2 p-8 flex flex-col justify-center max-w-md mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Create Customer Account</h2>
          <p className="text-gray-600">Join TaskGo to find skilled professionals</p>
        </div>

        {/* Error Message */}
        {submitError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{submitError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isSubmitting && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
              <p className="text-sm text-blue-800">Creating your account...</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-gray-700 font-medium">Full Name</label>
            <input
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                touched.fullName && errors.fullName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
              }`}
              required
            />
            {touched.fullName && errors.fullName && (
              <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
            )}
            {touched.fullName && !errors.fullName && formData.fullName && (
              <p className="text-green-500 text-sm mt-1">✓ Valid name</p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-gray-700 font-medium">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                touched.email && errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
              }`}
              required
            />
            {touched.email && errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
            {touched.email && !errors.email && formData.email && (
              <p className="text-green-500 text-sm mt-1">✓ Valid email address</p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-gray-700 font-medium">Phone Number</label>
            <input
              type="tel"
              name="phone"
              placeholder="+94715669231"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                touched.phone && errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
              }`}
              required
            />
            {touched.phone && errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
            {touched.phone && !errors.phone && formData.phone && (
              <p className="text-green-500 text-sm mt-1">✓ Valid Sri Lankan mobile number</p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-gray-700 font-medium">Province</label>
            <select
              name="province"
              value={formData.province}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                touched.province && errors.province ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
              }`}
              required
            >
              <option value="">Select Province</option>
              {PROVINCES.map(province => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>
            {touched.province && errors.province && (
              <p className="text-red-500 text-sm mt-1">{errors.province}</p>
            )}
            {touched.province && !errors.province && formData.province && (
              <p className="text-green-500 text-sm mt-1">✓ Province selected</p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-gray-700 font-medium">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full p-4 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                  touched.password && errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {touched.password && errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${getPasswordStrengthColor(formData.password)}`}
                      style={{ width: `${(validatePassword(formData.password).strength === 'weak' ? 25 : 
                                       validatePassword(formData.password).strength === 'medium' ? 50 :
                                       validatePassword(formData.password).strength === 'strong' ? 75 : 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600">{getPasswordStrengthText(formData.password)}</span>
                </div>
                <p className="text-xs text-gray-500">Must be 8+ characters with uppercase, lowercase, number, and special character</p>
              </div>
            )}
          </div>

          <div>
            <label className="block mb-1 text-gray-700 font-medium">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full p-4 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                  touched.confirmPassword && errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
            )}
            {touched.confirmPassword && !errors.confirmPassword && formData.confirmPassword && formData.password === formData.confirmPassword && (
              <p className="text-green-500 text-sm mt-1">✓ Passwords match</p>
            )}
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>

          <div className="text-center text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700">
              Sign in here
            </Link>
          </div>
        </form>
      </div>

      {/* Right Section - Illustration */}
      <div className="w-1/2 bg-gray-50 flex items-center justify-center">
        <img 
          src={loginImage} 
          alt="Signup illustration" 
          className="max-w-md"
        />
      </div>
    </div>
  );
};

export default CustomerSignup; 