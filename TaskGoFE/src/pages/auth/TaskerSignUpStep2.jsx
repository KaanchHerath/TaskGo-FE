import React, { useState } from 'react';
import { validateStep2, validateSkills, getFieldError } from '../../utils/validation';
import { PROVINCES, DISTRICTS, getDistrictsForProvince } from '../../config/locations';

const SKILLS = [
  'Plumbing', 'Electrical', 'Cleaning', 'Carpentry', 'Painting', 'Moving', 
  'Gardening', 'Home Repairs', 'Appliance Installation', 'HVAC Services',
  'Pest Control', 'Roofing', 'Flooring', 'Tiling', 'Welding', 'Masonry',
  'Interior Design', 'Delivery Services', 'Pet Care', 'Tutoring',
  'Photography', 'Event Planning', 'Catering', 'Computer Repair',
  'Mobile Phone Repair', 'Car Washing', 'Laundry Services', 'Other'
];

const TaskerSignUpStep2 = ({ onNext, onBack, initialData = {} }) => {
  const [skills, setSkills] = useState(initialData.skills || []);
  const [province, setProvince] = useState(initialData.province || '');
  const [district, setDistrict] = useState(initialData.district || '');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [skillInput, setSkillInput] = useState('');
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSkillInputChange = (e) => {
    const value = e.target.value;
    setSkillInput(value);
    
    // Clear skill error when user starts typing
    if (errors.skills) {
      setErrors(prev => ({ ...prev, skills: null }));
    }
    
    if (value.trim()) {
      const filtered = SKILLS.filter(skill => 
        skill.toLowerCase().includes(value.toLowerCase()) && 
        !skills.includes(skill)
      );
      setFilteredSkills(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSkillAdd = (skill) => {
    if (!skills.includes(skill)) {
      const newSkills = [...skills, skill];
      setSkills(newSkills);
      setSkillInput('');
      setShowSuggestions(false);
      
      // Clear error when skills are added
      if (errors.skills) {
        setErrors(prev => ({ ...prev, skills: null }));
      }
      
      // Validate skills
      const skillsValidation = validateSkills(newSkills);
      if (!skillsValidation.isValid) {
        setErrors(prev => ({ ...prev, skills: skillsValidation.error }));
      }
    }
  };

  const handleSkillRemove = (skillToRemove) => {
    const newSkills = skills.filter(skill => skill !== skillToRemove);
    setSkills(newSkills);
    
    // Validate skills after removal
    const skillsValidation = validateSkills(newSkills);
    if (!skillsValidation.isValid) {
      setErrors(prev => ({ ...prev, skills: skillsValidation.error }));
    } else {
      setErrors(prev => ({ ...prev, skills: null }));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmedInput = skillInput.trim();
      if (trimmedInput && !skills.includes(trimmedInput)) {
        const newSkills = [...skills, trimmedInput];
        setSkills(newSkills);
        setSkillInput('');
        setShowSuggestions(false);
        
        // Clear error when skills are added
        if (errors.skills) {
          setErrors(prev => ({ ...prev, skills: null }));
        }
        
        // Validate skills
        const skillsValidation = validateSkills(newSkills);
        if (!skillsValidation.isValid) {
          setErrors(prev => ({ ...prev, skills: skillsValidation.error }));
        }
      }
    }
  };

  const handleProvinceChange = (e) => {
    const value = e.target.value;
    setProvince(value);
    setDistrict(''); // Reset district when province changes
    
    // Clear errors when province is selected
    if (errors.province) {
      setErrors(prev => ({ ...prev, province: null }));
    }
    if (errors.district) {
      setErrors(prev => ({ ...prev, district: null }));
    }
  };

  const handleDistrictChange = (e) => {
    const value = e.target.value;
    setDistrict(value);
    
    // Clear error when district is selected
    if (errors.district) {
      setErrors(prev => ({ ...prev, district: null }));
    }
    
    // Validate district if it has been touched
    if (touched.district) {
      const districtError = getFieldError('district', value, 'district');
      setErrors(prev => ({ ...prev, district: districtError }));
    }
  };

  const handleDistrictBlur = (e) => {
    const { value } = e.target;
    setTouched(prev => ({ ...prev, district: true }));
    
    const districtError = getFieldError('district', value, 'district');
    setErrors(prev => ({ ...prev, district: districtError }));
  };

  const handleNext = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Mark all fields as touched
    const allTouched = {
      skills: true,
      province: true,
      district: true
    };
    setTouched(allTouched);
    
    // Validate entire form
    const validation = validateStep2({ skills, province, district });
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }
    
    // If validation passes, proceed to next step
    onNext(validation.cleanData);
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-10 space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-gray-900 text-center">Create your account as a <span className="text-blue-600">Tasker</span></h2>
        <p className="text-center text-sm text-gray-600 mt-2">Earn Money your way</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block mb-3 text-gray-700 font-medium">Your skills</label>
          <div className="relative">
            <input
              type="text"
              value={skillInput}
              onChange={handleSkillInputChange}
              onKeyPress={handleKeyPress}
              className={`w-full px-4 py-3 rounded-lg border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 transition ${
                touched.skills && errors.skills ? 'border-red-500 focus:ring-red-500' : 'border-gray-200'
              }`}
              placeholder="Type to search skills or add custom skill (Press Enter to add)"
            />
            
            {/* Suggestions dropdown */}
            {showSuggestions && filteredSkills.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredSkills.map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleSkillAdd(skill)}
                    className="w-full px-4 py-2 text-left hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    {skill}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Selected skills */}
          {skills.length > 0 && (
            <div className="mt-3">
              <div className="flex flex-wrap gap-2">
                {skills.map(skill => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleSkillRemove(skill)}
                      className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {touched.skills && errors.skills && (
            <p className="text-red-500 text-sm mt-1">{errors.skills}</p>
          )}
          
          {touched.skills && !errors.skills && skills.length > 0 && (
            <p className="text-green-500 text-sm mt-1">✓ {skills.length} skill{skills.length > 1 ? 's' : ''} added</p>
          )}
          
          <p className="text-xs text-gray-500 mt-2">
            {skills.length > 0 ? `${skills.length} skill${skills.length > 1 ? 's' : ''} added` : 'Start typing to search existing skills or add your own'}
          </p>
        </div>
        
        <div>
          <label className="block mb-1 text-gray-700 font-medium">Select your province</label>
          <select
            value={province}
            onChange={handleProvinceChange}
            className={`w-full px-4 py-3 rounded-lg border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 transition ${
              touched.province && errors.province ? 'border-red-500 focus:ring-red-500' : 'border-gray-200'
            }`}
            required
          >
            <option value="">Select a province...</option>
            {PROVINCES.map(provinceName => (
              <option key={provinceName} value={provinceName}>{provinceName}</option>
            ))}
          </select>
          {touched.province && errors.province && (
            <p className="text-red-500 text-sm mt-1">{errors.province}</p>
          )}
          {touched.province && !errors.province && province && (
            <p className="text-green-500 text-sm mt-1">✓ Province selected</p>
          )}
        </div>
        
        <div>
          <label className="block mb-1 text-gray-700 font-medium">Select your district</label>
          <select
            value={district}
            onChange={handleDistrictChange}
            onBlur={handleDistrictBlur}
            disabled={!province}
            className={`w-full px-4 py-3 rounded-lg border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 transition ${
              touched.district && errors.district ? 'border-red-500 focus:ring-red-500' : 'border-gray-200'
            } ${!province ? 'opacity-50 cursor-not-allowed' : ''}`}
            required
          >
            <option value="">{province ? 'Select a district...' : 'Select a province first'}</option>
            {province && getDistrictsForProvince(province).map(districtName => (
              <option key={districtName} value={districtName}>{districtName}</option>
            ))}
          </select>
          {touched.district && errors.district && (
            <p className="text-red-500 text-sm mt-1">{errors.district}</p>
          )}
          {touched.district && !errors.district && district && (
            <p className="text-green-500 text-sm mt-1">✓ District selected</p>
          )}
        </div>
        
        <div className="flex gap-2">
          {onBack && (
            <button 
              type="button" 
              className="btn bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition" 
              onClick={onBack}
            >
              Back
            </button>
          )}
          <button 
            onClick={handleNext} 
            disabled={isSubmitting}
            className="w-full py-3 rounded-full bg-black text-white font-semibold hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Validating...' : 'Next'}
          </button>
        </div>
      </div>
      
      <div className="text-center text-sm mt-4">
        Already have an account? <a href="/login" className="font-semibold text-black">Sign In</a>
      </div>
    </div>
  );
};

export default TaskerSignUpStep2;