import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGoogle, FaApple, FaFacebook } from 'react-icons/fa'; // Assuming these icons are needed
import { registerUser } from '../../services/api/authService';
import { categoryMetadata, defaultCategories } from '../../config/categories';
import { ALL_DISTRICTS } from '../../config/locations';

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

const roleToDashboard = {
  customer: '/customer-dashboard',
  tasker: '/tasker-dashboard',
  admin: '/admin-dashboard',
};

const steps = [
  'Account Info',
  'Skills & Location',
  'Upload Documents',
];

const StepIndicator = ({ step }) => (
  <div className="flex justify-center mb-8">
    {steps.map((label, idx) => (
      <div key={label} className="flex items-center">
        <div className={`rounded-full w-8 h-8 flex items-center justify-center font-bold text-white ${step === idx + 1 ? 'bg-blue-600' : 'bg-gray-300'}`}>{idx + 1}</div>
        <span className={`ml-2 mr-4 text-sm ${step === idx + 1 ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>{label}</span>
        {idx < steps.length - 1 && <div className="w-8 h-1 bg-gray-300 mx-2 rounded" />}
      </div>
    ))}
  </div>
);

const TaskerRegistration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    emailOrPhone: '',
    password: '',
    category: '',
    skills: '',
    country: '',
    area: '',
    idDocument: null,
    qualificationDocument: null,
    agreedToTerms: false,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedData = sessionStorage.getItem('registrationData');
    if (storedData) {
      const initialData = JSON.parse(storedData);
      setFormData(prev => ({
        ...prev,
        fullName: initialData.fullName,
        emailOrPhone: initialData.emailOrPhone,
        password: initialData.password,
      }));
    } else {
      // If no initial registration data, redirect to signup page
      navigate('/signup');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, files, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'file' ? files[0] : (type === 'checkbox' ? checked : value),
    });
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    setError(null);
    if (step === 1) {
      if (!formData.fullName || !formData.emailOrPhone || !formData.password || !formData.agreedToTerms) {
        setError('Please fill in all required fields and agree to terms.');
        return;
      }
    } else if (step === 2) {
      if (!formData.skills || !formData.country || !formData.area || !formData.agreedToTerms) {
        setError('Please fill in all required fields and agree to terms.');
        return;
      }
    }
    setStep(step + 1);
  };

  const handlePreviousStep = (e) => {
    e.preventDefault();
    setError(null);
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!formData.idDocument || !formData.qualificationDocument) {
      setError('Please upload both identification and qualification documents.');
      setLoading(false);
      return;
    }
    const email = formData.emailOrPhone.includes('@') ? formData.emailOrPhone : undefined;
    const phone = !formData.emailOrPhone.includes('@') ? formData.emailOrPhone : undefined;
    const registrationPayload = {
      username: formData.fullName.split(' ')[0],
      email: email,
      phone: phone,
      password: formData.password,
      role: "tasker",
      fullName: formData.fullName,
      skills: [formData.skills],
      country: formData.country,
      area: formData.area,
      identificationDocument: formData.idDocument ? formData.idDocument.name : undefined,
      qualificationDocuments: formData.qualificationDocument ? [formData.qualificationDocument.name] : undefined,
    };
    try {
      const response = await registerUser(registrationPayload);
      localStorage.setItem('token', response.token);
      const payload = parseJwt(response.token);
      const dashboard = roleToDashboard[payload?.role] || '/';
      sessionStorage.removeItem('registrationData');
      navigate(dashboard);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full bg-white rounded-xl shadow-lg flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Create your account as a <span className="text-blue-600">Tasker</span></h2>
          <p className="mb-6 text-gray-600">{step === 1 ? "It's free and easy" : step === 2 ? "Earn Money your way" : "Upload your documents"}</p>
          <StepIndicator step={step} />
          {error && <div className="text-red-500 text-sm text-center mb-4">{error}</div>}
          {step === 1 && (
            <form className="space-y-4" onSubmit={handleNextStep}>
              <div>
                <label className="block text-sm font-medium text-gray-700">Full name</label>
                <input name="fullName" type="text" className="w-full p-3 border rounded-lg" placeholder="Enter your name" value={formData.fullName} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">E-mail</label>
                <input name="emailOrPhone" type="text" className="w-full p-3 border rounded-lg" placeholder="Type your e-mail or phone number" value={formData.emailOrPhone} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input name="password" type="password" className="w-full p-3 border rounded-lg" placeholder="Type your password" value={formData.password} onChange={handleChange} />
                <span className="text-xs text-gray-400">Must be 8 characters at least</span>
              </div>
              <div className="flex items-center">
                <input id="agreedToTerms1" name="agreedToTerms" type="checkbox" checked={formData.agreedToTerms} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                <label htmlFor="agreedToTerms1" className="ml-2 block text-sm text-gray-900">
                  By creating an account means you agree to the <Link to="/terms" className="font-medium text-blue-600 hover:text-blue-500">Terms and Conditions</Link>, and our <Link to="/privacy" className="font-medium text-blue-600 hover:text-blue-500">Privacy Policy</Link>
                </label>
              </div>
              <button type="submit" className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors" disabled={loading}>{loading ? 'Next...' : 'Next'}</button>
              <div className="flex justify-center space-x-4 mt-4">
                <button type="button" className="p-2 border rounded-lg hover:bg-gray-50"><FaGoogle className="w-6 h-6" /></button>
                <button type="button" className="p-2 border rounded-lg hover:bg-gray-50"><FaApple className="w-6 h-6" /></button>
                <button type="button" className="p-2 border rounded-lg hover:bg-gray-50"><FaFacebook className="w-6 h-6" /></button>
              </div>
              <div className="text-center text-sm mt-4">Already have an account? <Link to="/login" className="font-semibold text-black">Sign In</Link></div>
            </form>
          )}
          {step === 2 && (
            <form className="space-y-4" onSubmit={handleNextStep}>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select name="category" className="w-full p-3 border rounded-lg" value={formData.category} onChange={handleChange}>
                  <option value="">Select Category</option>
                  {defaultCategories.map((cat) => (
                    <option key={cat} value={cat}>{categoryMetadata[cat].title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Your skills</label>
                <select name="skills" className="w-full p-3 border rounded-lg" value={formData.skills} onChange={handleChange} disabled={!formData.category}>
                  <option value="">{formData.category ? 'Select Skill' : 'Select category first'}</option>
                  {formData.category && categoryMetadata[formData.category]?.skills.map((skill) => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Select your country</label>
                <select name="country" className="w-full p-3 border rounded-lg" value={formData.country} onChange={handleChange}>
                  <option value="">Select Country</option>
                  <option value="Sri Lanka">Sri Lanka</option>
                  <option value="India">India</option>
                  <option value="Bangladesh">Bangladesh</option>
                  <option value="Pakistan">Pakistan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Area</label>
                <select name="area" className="w-full p-3 border rounded-lg" value={formData.area} onChange={handleChange}>
                  <option value="">Select Area</option>
                  {ALL_DISTRICTS.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center">
                <input id="agreedToTerms2" name="agreedToTerms" type="checkbox" checked={formData.agreedToTerms} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                <label htmlFor="agreedToTerms2" className="ml-2 block text-sm text-gray-900">
                  By creating an account means you agree to the <Link to="/terms" className="font-medium text-blue-600 hover:text-blue-500">Terms and Conditions</Link>, and our <Link to="/privacy" className="font-medium text-blue-600 hover:text-blue-500">Privacy Policy</Link>
                </label>
              </div>
              <div className="flex justify-between">
                <button onClick={handlePreviousStep} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg">Back</button>
                <button type="submit" className="bg-black text-white px-6 py-2 rounded-lg">Next</button>
              </div>
            </form>
          )}
          {step === 3 && (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700">Identification document</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
                  <input type="file" name="idDocument" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} className="mb-2" />
                  <span className="text-gray-500 text-sm">Upload file (ID/Passport/Driving license)</span>
                  <span className="text-xs text-gray-400">Max file size 5 MB.</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Upload qualification documents</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
                  <input type="file" name="qualificationDocument" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} className="mb-2" />
                  <span className="text-gray-500 text-sm">Upload file (CV/Certifications)</span>
                  <span className="text-xs text-gray-400">Max file size 5 MB.</span>
                </div>
              </div>
              <div className="flex justify-between">
                <button onClick={handlePreviousStep} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg">Back</button>
                <button type="submit" className="bg-black text-white px-6 py-2 rounded-lg" disabled={loading}>{loading ? 'Signing Up...' : 'Sign Up'}</button>
              </div>
            </form>
          )}
        </div>
        {/* Right side illustration (optional, can add SVG or image here) */}
        <div className="hidden md:flex w-1/2 items-center justify-center">
          {/* You can add an illustration or SVG here to match your design */}
        </div>
      </div>
    </div>
  );
};

export default TaskerRegistration; 