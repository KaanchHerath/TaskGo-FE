import React, { useState } from 'react';

const COUNTRIES = [
  'Sri Lanka', 'India', 'Pakistan', 'Bangladesh', 'Nepal', 'Other'
];
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
  const [country, setCountry] = useState(initialData.country || 'Sri Lanka');
  const [area, setArea] = useState(initialData.area || '');
  const [error, setError] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSkillInputChange = (e) => {
    const value = e.target.value;
    setSkillInput(value);
    
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
      setSkills([...skills, skill]);
      setSkillInput('');
      setShowSuggestions(false);
      setError('');
    }
  };

  const handleSkillRemove = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmedInput = skillInput.trim();
      if (trimmedInput && !skills.includes(trimmedInput)) {
        setSkills([...skills, trimmedInput]);
        setSkillInput('');
        setShowSuggestions(false);
        setError('');
      }
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!skills.length || !country || !area) {
      setError('All fields are required.');
      return;
    }
    onNext({ skills, country, area });
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
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 transition"
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
          
          <p className="text-xs text-gray-500 mt-2">
            {skills.length > 0 ? `${skills.length} skill${skills.length > 1 ? 's' : ''} added` : 'Start typing to search existing skills or add your own'}
          </p>
        </div>
        <div>
          <label className="block mb-1 text-gray-700 font-medium">Select your country</label>
          <select
            value={country}
            onChange={e => setCountry(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 transition"
            required
          >
            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block mb-1 text-gray-700 font-medium">Area</label>
          <input
            type="text"
            value={area}
            onChange={e => setArea(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 transition"
            required
            placeholder="Central Province"
          />
        </div>
        {error && <div className="text-red-500 text-center">{error}</div>}
        <div className="flex gap-2">
          {onBack && <button type="button" className="btn bg-gray-200 text-gray-700 px-6 py-2 rounded-lg" onClick={onBack}>Back</button>}
          <button onClick={handleNext} className="w-full py-3 rounded-full bg-black text-white font-semibold hover:bg-gray-900 transition">Next</button>
        </div>
      </div>
      <div className="text-center text-sm mt-4">
        Already have an account? <a href="/login" className="font-semibold text-black">Sign In</a>
      </div>
    </div>
  );
};

export default TaskerSignUpStep2;