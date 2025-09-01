import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaClock, FaMapMarkerAlt, FaPhone, FaEnvelope, FaStar, FaShare, FaFacebook, FaTwitter, FaPinterest, FaDollarSign, FaCalendar, FaUser, FaTag, FaEye, FaHeart, FaFlag, FaArrowLeft, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useJobs } from '../hooks/useJobs';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { applyForTask } from '../services/api/taskService';
import ApplyButton from '../components/task/ApplyButton';

const TaskDescription = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isApplying, setIsApplying] = useState(false);
  const [applicationData, setApplicationData] = useState({
    proposedPayment: '',
    note: '',
    estimatedDuration: '',
    availableStartDate: '',
    availableEndDate: ''
  });

  useEffect(() => {
    if (!id) {
      navigate('/tasks');
    }
  }, [id, navigate]);

  const { job, loading, error } = useJobs(id);

  const handleApply = async (applicationData) => {
    try {
      setIsApplying(true);
      await applyForTask(id, applicationData);
      alert('Application submitted successfully!');
      // Optionally refresh job data or redirect
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to submit application';
      alert(errorMessage);
      console.error('Error applying:', err);
      throw err; // Re-throw to let the modal handle it
    } finally {
      setIsApplying(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300';
      case 'scheduled':
        return 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300';
      case 'completed':
        return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300';
      case 'cancelled':
        return 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300';
      default:
        return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <FaCheckCircle className="text-green-500" />;
      case 'scheduled':
        return <FaClock className="text-blue-500" />;
      case 'completed':
        return <FaCheckCircle className="text-gray-500" />;
      case 'cancelled':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour(s) ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} weeks ago`;
  };

  // Helper to construct absolute URLs for images saved in backend uploads
  const getTaskPhotoUrl = (photoPath) => {
    if (!photoPath) return '';
    // If already an absolute URL or data URI
    if (/^https?:\/\//i.test(photoPath) || /^data:image\//i.test(photoPath)) return photoPath;
    
    // Normalize Windows backslashes and clean the path
    const normalized = photoPath.replace(/\\/g, '/');
    
    // Remove any leading slashes and check if path already contains 'uploads/'
    const cleaned = normalized.replace(/^\/+/, '');
    
    // If the path already starts with 'uploads/', use it as is
    if (cleaned.startsWith('uploads/')) {
      return `http://localhost:5000/${cleaned}`;
    }
    
    // If the path doesn't start with 'uploads/', add it
    return `http://localhost:5000/uploads/${cleaned}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            <span className="text-slate-700 font-medium">Loading task details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 text-center max-w-md">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaTimesCircle className="text-2xl text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Task Not Found</h2>
          <p className="text-slate-600 mb-6">{error || 'The task you are looking for does not exist or has been removed.'}</p>
          <button 
            onClick={() => navigate('/tasks')} 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg transform hover:scale-105"
          >
            <FaArrowLeft className="mr-2" />
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 py-8 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-3xl"></div>
      <div className="absolute top-20 right-20 w-48 h-48 bg-indigo-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-1/4 w-24 h-24 bg-purple-200/20 rounded-full blur-2xl"></div>
      
      {/* Subtle Pattern Overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Back Button */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/tasks')}
            className="bg-white/70 backdrop-blur-sm border border-white/30 text-slate-700 px-4 py-2 rounded-xl hover:bg-white/90 transition-all duration-300 flex items-center font-medium shadow-lg"
          >
            <FaArrowLeft className="mr-2" />
            Back to Tasks
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`px-4 py-2 rounded-xl text-sm font-semibold ${getStatusColor(job.status)}`}>
                      {getStatusIcon(job.status)}
                      <span className="ml-2 capitalize">{job.status}</span>
                    </span>
                    <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-4 py-2 rounded-xl text-sm font-semibold border border-blue-200">
                      <FaTag className="mr-2" />
                      {job.category}
                    </span>
                  </div>
                  
                  <h1 className="text-3xl md:text-4xl font-bold mb-4">
                    <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                      {job.title}
                    </span>
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-4 text-slate-600">
                    <div className="flex items-center">
                      <FaUser className="text-blue-500 mr-2" />
                      <span className="font-medium">{job.customer?.fullName || 'Anonymous'}</span>
                    </div>
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="text-blue-500 mr-2" />
                      <span>{job.area}</span>
                    </div>
                    <div className="flex items-center">
                      <FaClock className="text-blue-500 mr-2" />
                      <span>Posted {formatTimeAgo(job.createdAt)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 mt-6 md:mt-0">
                  <button className="p-3 bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl hover:bg-white/90 transition-all duration-300 shadow-lg">
                    <FaHeart className="text-slate-600" />
                  </button>
                  <button className="p-3 bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl hover:bg-white/90 transition-all duration-300 shadow-lg">
                    <FaShare className="text-slate-600" />
                  </button>
                  <button className="p-3 bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl hover:bg-white/90 transition-all duration-300 shadow-lg">
                    <FaFlag className="text-slate-600" />
                  </button>
                </div>
              </div>

              {/* Budget Display */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700 font-medium mb-1">Budget Range</p>
                    <div className="flex items-center text-3xl font-bold">
                      <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        LKR {job.minPayment?.toLocaleString()} - {job.maxPayment?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
                    <FaDollarSign className="text-2xl text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
              <h2 className="text-2xl font-bold mb-6">
                <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Task Description
                </span>
              </h2>
              <div className="prose prose-slate max-w-none text-lg">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{job.description || ''}</ReactMarkdown>
              </div>
            </div>

            {/* Tags */}
            {job.tags && job.tags.length > 0 && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
                <h3 className="text-xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Tags
                  </span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-3 py-2 rounded-xl text-sm font-medium border border-blue-200"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Photos */}
            {job.photos && job.photos.length > 0 && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
                <h3 className="text-xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Task Photos
                  </span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {job.photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={getTaskPhotoUrl(photo)} 
                        alt={`Task photo ${index + 1}`}
                        className="w-full h-48 object-cover rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-xl transition-all duration-300 flex items-center justify-center">
                        <FaEye className="text-white opacity-0 group-hover:opacity-100 text-2xl transition-all duration-300" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Task Overview */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <h3 className="text-xl font-bold mb-6">
                <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Task Overview
                </span>
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                    <FaCalendar className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Start Date</p>
                    <p className="font-semibold text-slate-800">{formatDate(job.startDate)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                    <FaCalendar className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">End Date</p>
                    <p className="font-semibold text-slate-800">{formatDate(job.endDate)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                    <FaClock className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Posted</p>
                    <p className="font-semibold text-slate-800">{formatDate(job.createdAt)}</p>
                  </div>
                </div>

                {job.applicationCount && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                      <FaUser className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Applications</p>
                      <p className="font-semibold text-slate-800">{job.applicationCount} received</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Info */}
            {job.customer && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <h3 className="text-xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Customer Information
                  </span>
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <FaUser className="text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{job.customer.fullName}</p>
                      <p className="text-sm text-slate-500">Customer</p>
                    </div>
                  </div>
                  
                  {job.customer.email && (
                    <div className="flex items-center gap-3">
                      <FaEnvelope className="text-blue-500" />
                      <span className="text-slate-700">{job.customer.email}</span>
                    </div>
                  )}
                  
                  {job.customer.phone && (
                    <div className="flex items-center gap-3">
                      <FaPhone className="text-blue-500" />
                      <span className="text-slate-700">{job.customer.phone}</span>
                    </div>
                  )}
                  
                  {job.customer.rating && (
                    <div className="flex items-center gap-3">
                      <FaStar className="text-yellow-500" />
                      <span className="text-slate-700">{job.customer.rating}/5 Rating</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Apply Button */}
            <ApplyButton 
              task={job} 
              applying={isApplying} 
              onApply={handleApply} 
            />

            {/* Share Task */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <h3 className="text-lg font-bold mb-4">
                <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Share this Task
                </span>
              </h3>
              <div className="flex gap-3">
                <button className="flex-1 p-3 bg-[#1877F2] text-white rounded-xl hover:bg-[#1565C0] transition-colors shadow-lg">
                  <FaFacebook className="mx-auto" />
                </button>
                <button className="flex-1 p-3 bg-[#1DA1F2] text-white rounded-xl hover:bg-[#1976D2] transition-colors shadow-lg">
                  <FaTwitter className="mx-auto" />
                </button>
                <button className="flex-1 p-3 bg-[#E60023] text-white rounded-xl hover:bg-[#C51162] transition-colors shadow-lg">
                  <FaPinterest className="mx-auto" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDescription;