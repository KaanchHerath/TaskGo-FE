import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TaskerSignUpStep1 from './TaskerSignUpStep1';
import TaskerSignUpStep2 from './TaskerSignUpStep2';
import TaskerSignUpStep3 from './TaskerSignUpStep3';
import loginImage from '../../assets/homeimage.png';

const TaskerSignup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    step1: {},
    step2: {},
    step3: {}
  });
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

      const response = await fetch('http://localhost:5000/api/auth/register-tasker', {
        method: 'POST',
        body: finalData
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        
        // Dispatch custom event to notify navbar of auth change
        window.dispatchEvent(new Event('authStateChanged'));
        
        navigate('/tasker/dashboard');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed: ' + error.message);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
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
          <div className="flex justify-between mb-8">
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