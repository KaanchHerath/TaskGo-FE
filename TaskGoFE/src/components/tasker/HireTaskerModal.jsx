import React, { useState } from 'react';
import { FaUser, FaDollarSign, FaCalendarAlt, FaMapMarkerAlt, FaPaperPlane } from 'react-icons/fa';
import { createTargetedTask, TASK_CATEGORIES } from '../../services/api/taskService';
import { ALL_DISTRICTS } from '../../config/locations';
import Modal from '../common/Modal';

const HireTaskerModal = ({ isOpen, onClose, tasker, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    minPayment: '',
    maxPayment: '',
    area: tasker?.area || '',
    startDate: '',
    endDate: '',
    tags: ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

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
    if (formData.minPayment && formData.maxPayment) {
      if (parseFloat(formData.minPayment) >= parseFloat(formData.maxPayment)) {
        newErrors.maxPayment = 'Maximum payment must be greater than minimum payment';
      }
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    setError('');
    try {
      const taskData = {
        title: formData.title.trim(),
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        minPayment: parseFloat(formData.minPayment),
        maxPayment: parseFloat(formData.maxPayment),
        area: formData.area,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        description: formData.description.trim()
      };
      await createTargetedTask(taskData, tasker._id);
      setFormData({
        title: '',
        category: '',
        description: '',
        minPayment: '',
        maxPayment: '',
        area: tasker?.area || '',
        startDate: '',
        endDate: '',
        tags: ''
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error creating targeted task:', err);
      setError(err.response?.data?.message || 'Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      category: '',
      description: '',
      minPayment: '',
      maxPayment: '',
      area: tasker?.area || '',
      startDate: '',
      endDate: '',
      tags: ''
    });
    setErrors({});
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Hire ${tasker?.fullName}`}
      subtitle="Create a task specifically for this tasker"
      icon={FaUser}
      iconColor="text-blue-600"
      iconBgColor="bg-blue-100"
      maxWidth="max-w-2xl"
      showCloseButton
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Task Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.title ? 'border-red-300' : 'border-gray-300'}`}
            placeholder="What do you need done?"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.category ? 'border-red-300' : 'border-gray-300'}`}
            >
              <option value="">Select Category</option>
              {TASK_CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Area *</label>
            <select
              name="area"
              value={formData.area}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.area ? 'border-red-300' : 'border-gray-300'}`}
            >
                          <option value="">Select Area</option>
            {ALL_DISTRICTS.map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
            </select>
            {errors.area && <p className="text-red-500 text-sm mt-1">{errors.area}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Min Payment (LKR) *</label>
            <input
              type="number"
              name="minPayment"
              value={formData.minPayment}
              onChange={handleInputChange}
              min="1"
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.minPayment ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="1000"
            />
            {errors.minPayment && <p className="text-red-500 text-sm mt-1">{errors.minPayment}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Max Payment (LKR) *</label>
            <input
              type="number"
              name="maxPayment"
              value={formData.maxPayment}
              onChange={handleInputChange}
              min="1"
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.maxPayment ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="5000"
            />
            {errors.maxPayment && <p className="text-red-500 text-sm mt-1">{errors.maxPayment}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date *</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.startDate ? 'border-red-300' : 'border-gray-300'}`}
            />
            {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">End Date *</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.endDate ? 'border-red-300' : 'border-gray-300'}`}
            />
            {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.description ? 'border-red-300' : 'border-gray-300'}`}
            placeholder="Describe the task in detail"
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Tags (comma separated)</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-300"
            placeholder="e.g. plumbing, urgent, weekend"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg flex items-center gap-2 disabled:opacity-60"
            disabled={loading}
          >
            <FaPaperPlane className="text-lg" />
            {loading ? 'Sending...' : 'Send Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default HireTaskerModal;
