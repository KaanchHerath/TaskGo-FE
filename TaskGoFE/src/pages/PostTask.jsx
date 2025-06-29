import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTask, uploadTaskPhotos, TASK_CATEGORIES, CANADIAN_PROVINCES } from '../services/api/taskService';

const PostTask = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    tags: '',
    minPayment: '',
    maxPayment: '',
    area: '',
    startDate: '',
    endDate: '',
    description: '',
    photos: []
  });

  const [errors, setErrors] = useState({});

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle photo upload
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.photos.length > 5) {
      setError('You can upload maximum 5 photos');
      return;
    }

    // Convert files to base64 for preview
    const photoPromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve({
          file,
          preview: e.target.result,
          name: file.name
        });
        reader.readAsDataURL(file);
      });
    });

    Promise.all(photoPromises).then(photos => {
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...photos]
      }));
    });
  };

  // Remove photo
  const removePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Task title is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.minPayment) newErrors.minPayment = 'Minimum payment is required';
    if (!formData.maxPayment) newErrors.maxPayment = 'Maximum payment is required';
    if (!formData.area) newErrors.area = 'Area is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.description.trim().length < 10) newErrors.description = 'Description must be at least 10 characters long';

    // Validate payment range
    if (formData.minPayment && formData.maxPayment) {
      if (parseFloat(formData.minPayment) >= parseFloat(formData.maxPayment)) {
        newErrors.maxPayment = 'Maximum payment must be greater than minimum payment';
      }
    }

    // Validate dates
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (startDate < today) {
        newErrors.startDate = 'Start date must be in the future';
      }
      if (endDate <= startDate) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to post a task. Please log in first.');
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      let photoUrls = [];
      
      // Upload photos if any are selected
      if (formData.photos.length > 0) {
        const photoFiles = formData.photos.map(photo => photo.file);
        const uploadResponse = await uploadTaskPhotos(photoFiles);
        photoUrls = uploadResponse.data.map(photo => photo.url);
      }

      const taskData = {
        title: formData.title.trim(),
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        minPayment: parseFloat(formData.minPayment),
        maxPayment: parseFloat(formData.maxPayment),
        area: formData.area,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        description: formData.description.trim(),
        photos: photoUrls
      };

      const response = await createTask(taskData);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/tasks');
      }, 2000);

    } catch (err) {
      console.error('Error creating task:', err);
      
      // Handle validation errors specifically
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const validationErrors = err.response.data.errors.join(', ');
        setError(`Validation errors: ${validationErrors}`);
      } else {
        setError(err.response?.data?.message || 'Failed to create task. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Task Posted Successfully!</h2>
          <p className="text-gray-600 mb-4">Your task has been posted and is now visible to taskers.</p>
          <p className="text-sm text-gray-500">Redirecting to tasks page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Post a Task</h1>
          <p className="mt-2 text-gray-600">Tell us what you need done and get offers from skilled taskers</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            
            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Task Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-2">
                Task Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Add job title, role, vacancies etc"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Tags and Category Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="tags" className="block text-sm font-semibold text-gray-900 mb-2">
                  Tags
                </label>
                <div className="relative">
                  <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="Job keyword, tags etc..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-gray-900 mb-2">
                  Task Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select...</option>
                  {TASK_CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>
            </div>

            {/* Payment Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                Payment *
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="minPayment" className="block text-sm font-medium text-gray-700 mb-2">
                    Min Payment
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">$</span>
                    <input
                      type="number"
                      id="minPayment"
                      name="minPayment"
                      value={formData.minPayment}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className={`w-full pl-8 pr-16 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.minPayment ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <span className="absolute right-3 top-3 text-gray-500">CAD</span>
                  </div>
                  {errors.minPayment && <p className="text-red-500 text-sm mt-1">{errors.minPayment}</p>}
                </div>

                <div>
                  <label htmlFor="maxPayment" className="block text-sm font-medium text-gray-700 mb-2">
                    Max Payment
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">$</span>
                    <input
                      type="number"
                      id="maxPayment"
                      name="maxPayment"
                      value={formData.maxPayment}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className={`w-full pl-8 pr-16 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.maxPayment ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <span className="absolute right-3 top-3 text-gray-500">CAD</span>
                  </div>
                  {errors.maxPayment && <p className="text-red-500 text-sm mt-1">{errors.maxPayment}</p>}
                </div>
              </div>
            </div>

            {/* Advanced Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Information *</h3>
              
              {/* Area */}
              <div className="mb-6">
                <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-2">
                  Area
                </label>
                <div className="relative">
                  <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <select
                    id="area"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.area ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select...</option>
                    {CANADIAN_PROVINCES.map(province => (
                      <option key={province} value={province}>{province}</option>
                    ))}
                  </select>
                </div>
                {errors.area && <p className="text-red-500 text-sm mt-1">{errors.area}</p>}
              </div>

              {/* Date Range */}
              <div>
                <h4 className="block text-sm font-medium text-gray-700 mb-3">
                  Task completion Date Range (Task will expire on the ending date) *
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="startDate" className="block text-xs font-medium text-gray-600 mb-2">
                      Starting Date
                    </label>
                    <div className="relative">
                      <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.startDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
                  </div>

                  <div>
                    <label htmlFor="endDate" className="block text-xs font-medium text-gray-600 mb-2">
                      Ending Date
                    </label>
                    <div className="relative">
                      <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        min={formData.startDate || new Date().toISOString().split('T')[0]}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.endDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
                Description *
              </label>
              <p className="text-sm text-gray-600 mb-3">Description</p>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Add your job description..."
                rows={6}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              
              {/* Text formatting toolbar (visual only) */}
              <div className="flex items-center space-x-2 mt-2 p-2 border-t border-gray-200">
                <button type="button" className="p-1 text-gray-500 hover:text-gray-700">
                  <strong>B</strong>
                </button>
                <button type="button" className="p-1 text-gray-500 hover:text-gray-700">
                  <em>I</em>
                </button>
                <button type="button" className="p-1 text-gray-500 hover:text-gray-700">
                  <u>U</u>
                </button>
                <button type="button" className="p-1 text-gray-500 hover:text-gray-700">
                  <s>S</s>
                </button>
                <button type="button" className="p-1 text-gray-500 hover:text-gray-700">
                  🔗
                </button>
                <button type="button" className="p-1 text-gray-500 hover:text-gray-700">
                  •
                </button>
                <button type="button" className="p-1 text-gray-500 hover:text-gray-700">
                  1.
                </button>
              </div>
            </div>

            {/* Photo Upload */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Upload Photos of the Task</h3>
              
              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div className="space-y-2">
                  <label htmlFor="photos" className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-500 font-medium">Browse photo</span>
                    <span className="text-gray-500"> or drop here</span>
                  </label>
                  <input
                    type="file"
                    id="photos"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500">
                    A photo larger than 400 pixels work best. Max photo size 5 MB.
                  </p>
                </div>
              </div>

              {/* Photo Previews */}
              {formData.photos.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo.preview}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Required Fields Note */}
            <div className="text-sm text-red-600">
              Fields with the * marks are required
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={loading}
                className={`px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Posting Task...
                  </>
                ) : (
                  <>
                    Post Task
                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostTask;