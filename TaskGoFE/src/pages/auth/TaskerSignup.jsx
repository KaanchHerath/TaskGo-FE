import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TaskerSignUpStep1 from './TaskerSignUpStep1';
import TaskerSignUpStep2 from './TaskerSignUpStep2';
import TaskerSignUpStep3 from './TaskerSignUpStep3';
import loginImage from '../../assets/homeimage.png';
import { registerTasker } from '../../services/api/authService';

const TaskerSignup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    step1: {},
    step2: {},
    step3: {}
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const navigate = useNavigate();

  const handleStepComplete = (stepData, stepNumber) => {
    setFormData(prev => ({
      ...prev,
      [`step${stepNumber}`]: stepData
    }));
    
    if (stepNumber < 3) {
      setCurrentStep(stepNumber + 1);
    } else {
      // Final submission
      submitRegistration();
    }
  };

  const submitRegistration = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError('');
      
      const finalData = new FormData();
      
      // Add step 1 data
      Object.keys(formData.step1).forEach(key => {
        if (key !== 'confirmPassword') { // Don't send confirmPassword to backend
          finalData.append(key, formData.step1[key]);
        }
      });
      
      // Add step 2 data
      Object.keys(formData.step2).forEach(key => {
        if (Array.isArray(formData.step2[key])) {
          formData.step2[key].forEach(item => finalData.append(key, item));
        } else {
          finalData.append(key, formData.step2[key]);
        }
      });
      
      // Add step 3 files
      if (formData.step3.idDocument) {
        finalData.append('idDocument', formData.step3.idDocument);
      }
      if (formData.step3.qualificationDocuments) {
        Array.from(formData.step3.qualificationDocuments).forEach(file => {
          finalData.append('qualificationDocuments', file);
        });
      }

      const data = await registerTasker(finalData);
      localStorage.setItem('token', data.token);
      
      // Dispatch custom event to notify navbar of auth change
      window.dispatchEvent(new Event('authStateChanged'));
      
      navigate('/tasker/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      setSubmitError(error.message || 'Registration failed. Please try again.');
      
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setSubmitError(''); // Clear any previous errors
    }
  };

  const getStepTitle = (step) => {
    switch (step) {
      case 1: return 'Account Details';
      case 2: return 'Skills & Location';
      case 3: return 'Document Upload';
      default: return '';
    }
  };

  const getStepDescription = (step) => {
    switch (step) {
      case 1: return 'Enter your personal information';
      case 2: return 'Tell us about your skills and location';
      case 3: return 'Upload your identification documents';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Section - Form */}
      <div className="w-1/2 p-8 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Become a Tasker</h2>
            <p className="text-gray-600">Join our community of skilled professionals</p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex justify-between mb-4">
              {[1, 2, 3].map(step => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step <= currentStep ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  {step < 3 && <div className={`w-16 h-1 mx-2 ${
                    step < currentStep ? 'bg-green-600' : 'bg-gray-200'
                  }`} />}
                </div>
              ))}
            </div>
            
            {/* Step Title and Description */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">{getStepTitle(currentStep)}</h3>
              <p className="text-sm text-gray-600">{getStepDescription(currentStep)}</p>
            </div>
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

          {/* Step Content */}
          {currentStep === 1 && (
            <TaskerSignUpStep1 
              onNext={(data) => handleStepComplete(data, 1)}
              initialData={formData.step1}
            />
          )}
          {currentStep === 2 && (
            <TaskerSignUpStep2 
              onNext={(data) => handleStepComplete(data, 2)}
              onBack={goToPreviousStep}
              initialData={formData.step2}
            />
          )}
          {currentStep === 3 && (
            <TaskerSignUpStep3 
              onSubmit={(data) => handleStepComplete(data, 3)}
              onBack={goToPreviousStep}
              initialData={formData.step3}
            />
          )}
        </div>
      </div>

      {/* Right Section - Image */}
      <div className="w-1/2 bg-gray-50 flex items-center justify-center">
        <img 
          src={loginImage} 
          alt="Tasker Registration" 
          className="max-w-md"
        />
      </div>
    </div>
  );
};

export default TaskerSignup; 