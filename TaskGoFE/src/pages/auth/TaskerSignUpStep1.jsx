import React, { useState} from 'react';
import { FaGoogle, FaApple, FaFacebook, FaEye, FaEyeSlash } from 'react-icons/fa';
import { 
  validateStep1, 
  validatePassword, 
  formatPhoneNumber,
  getFieldError 
} from '../../utils/validation';

const TaskerSignUpStep1 = ({ onNext, initialData = {} }) => {
  const [form, setForm] = useState({
    fullName: initialData.fullName || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false,
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        return form.password !== value ? 'Passwords do not match' : null;
      default:
        return null;
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setForm(prev => ({ ...prev, [name]: fieldValue }));
    
    // Format phone number as user types
    if (name === 'phone') {
      const formattedPhone = formatPhoneNumber(value);
      setForm(prev => ({ ...prev, [name]: formattedPhone }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
    
    if (touched[name]) {
      const fieldError = validateField(name, fieldValue);
      setErrors(prev => ({ ...prev, [name]: fieldError }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const fieldError = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: fieldError }));
  };

  const handleNext = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const allTouched = {
      fullName: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
      agreedToTerms: true
    };
    setTouched(allTouched);
    
    // Validate entire form
    const validation = validateStep1(form);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }
    
    // If validation passes, proceed to next step
    onNext(validation.cleanData);
    setIsSubmitting(false);
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

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-10 space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-gray-900 text-center">Create your account as a <span className="text-blue-600">Tasker</span></h2>
        <p className="text-center text-sm text-gray-600 mt-2">It's free and easy</p>
      </div>
      
      <form className="space-y-6" onSubmit={handleNext}>
        <div>
          <label className="block mb-1 text-gray-700 font-medium">Full name</label>
          <input
            type="text"
            name="fullName"
            placeholder="Enter your name"
            value={form.fullName}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-4 py-3 rounded-lg border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 transition ${
              touched.fullName && errors.fullName ? 'border-red-500 focus:ring-red-500' : 'border-gray-200'
            }`}
            required
          />
          {touched.fullName && errors.fullName && (
            <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
          )}
        </div>
        
        <div>
          <label className="block mb-1 text-gray-700 font-medium">E-mail</label>
          <input
            type="email"
            name="email"
            placeholder="Type your e-mail"
            value={form.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-4 py-3 rounded-lg border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 transition ${
              touched.email && errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-200'
            }`}
            required
          />
          {touched.email && errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>
        
        <div>
          <label className="block mb-1 text-gray-700 font-medium">Phone</label>
          <input
            type="tel"
            name="phone"
            placeholder="+94715669231"
            value={form.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-4 py-3 rounded-lg border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 transition ${
              touched.phone && errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-200'
            }`}
            required
          />
          {touched.phone && errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
          )}
          {touched.phone && !errors.phone && form.phone && (
            <p className="text-green-500 text-sm mt-1">✓ Valid Sri Lankan mobile number</p>
          )}
        </div>
        
        <div>
          <label className="block mb-1 text-gray-700 font-medium">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Type your password"
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-4 py-3 pr-12 rounded-lg border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 transition ${
                touched.password && errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-200'
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
          {form.password && (
            <div className="mt-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${getPasswordStrengthColor(form.password)}`}
                    style={{ width: `${(validatePassword(form.password).strength === 'weak' ? 25 : 
                                     validatePassword(form.password).strength === 'medium' ? 50 :
                                     validatePassword(form.password).strength === 'strong' ? 75 : 100)}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-600">{getPasswordStrengthText(form.password)}</span>
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
              value={form.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-4 py-3 pr-12 rounded-lg border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 transition ${
                touched.confirmPassword && errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-200'
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
          {touched.confirmPassword && !errors.confirmPassword && form.confirmPassword && form.password === form.confirmPassword && (
            <p className="text-green-500 text-sm mt-1">✓ Passwords match</p>
          )}
        </div>
        
        <div className="flex items-start gap-2">
          <input
            id="agreedToTerms"
            name="agreedToTerms"
            type="checkbox"
            checked={form.agreedToTerms}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
          />
          <label htmlFor="agreedToTerms" className="text-sm text-gray-600">
            By creating an account means you agree to the <a href="/terms" className="underline">Terms and Conditions</a>, and our <a href="/privacy" className="underline">Privacy Policy</a>
          </label>
        </div>
        {touched.agreedToTerms && errors.agreedToTerms && (
          <p className="text-red-500 text-sm">{errors.agreedToTerms}</p>
        )}
        
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full py-3 rounded-full bg-black text-white font-semibold hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Validating...' : 'Next'}
        </button>
      </form>
      
      <div className="flex justify-center gap-4 mt-6">
        <button type="button" className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"><FaGoogle className="w-6 h-6" /></button>
        <button type="button" className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"><FaApple className="w-6 h-6" /></button>
        <button type="button" className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"><FaFacebook className="w-6 h-6" /></button>
      </div>
      
      <div className="text-center text-sm mt-4">
        Already have an account? <a href="/login" className="font-semibold text-black">Sign In</a>
      </div>
    </div>
  );
};

export default TaskerSignUpStep1; 