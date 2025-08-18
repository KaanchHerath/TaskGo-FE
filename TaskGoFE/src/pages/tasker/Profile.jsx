import { useEffect, useState } from 'react';
import { 
  FaEdit, FaUser, FaEnvelope, FaMapMarkerAlt, FaTasks, FaStar, FaTools, 
  FaFileAlt, FaCog, FaCamera, FaPhone, FaDollarSign, FaCheckCircle, 
  FaClock, FaAward, FaChartLine, FaEye, FaHeart, FaUpload, FaTrash,
  FaPlus, FaTimes, FaSave, FaSpinner, FaLock, FaExpand, FaDownload,
  FaFilePdf, FaImage, FaInfoCircle
} from 'react-icons/fa';
import { changePassword, getUserProfile, updateUserProfile } from '../../services/api/userService';
import { updateTaskerAvailability, uploadQualificationDocuments, removeQualificationDocument } from '../../services/api/taskerService';
import { useToast, ToastContainer } from '../../components/common/Toast';
import Modal from '../../components/common/Modal';
import { getMyTasks, getMyRecentTasks, getAvailableTasks } from '../../services/api/taskService';
import { PROVINCES, getDistrictsForProvince, formatLocation } from '../../config/locations';
import { getTaskerReviews } from '../../services/api/taskerService';
import { APP_CONFIG, formatCurrency, formatTimeAgo } from '../../config/appConfig';
import { getToken } from '../../utils/auth';
import ProfileCompletionPrompt from '../../components/common/ProfileCompletionPrompt';

const TaskerProfile = () => {
  const [user, setUser] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [recentTasks, setRecentTasks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [jobAlerts, setJobAlerts] = useState([]);
  const { toasts, removeToast, showSuccess, showError } = useToast();

  // Form state for editing
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    bio: '',
    experience: '',
    skills: [],
    province: '',
    district: '',
    hourlyRate: '',
    advancePaymentAmount: '',
    isAvailable: true
  });

  const [newSkill, setNewSkill] = useState('');
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);
  


  // Document upload state
  const [uploadingDocuments, setUploadingDocuments] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchStatistics();
    fetchRecentTasks();
    fetchReviews();
  }, []);

  useEffect(() => {
    if (user) {
      fetchJobAlerts();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getUserProfile();
      setUser(data);
      setFormData({
        fullName: data.fullName || '',
        email: data.email || '',
        phone: data.phone || '',
        bio: data.taskerProfile?.bio || '',
        experience: data.taskerProfile?.experience || '',
        skills: data.taskerProfile?.skills || [],
        province: data.taskerProfile?.province || '',
        district: data.taskerProfile?.district || '',
        hourlyRate: data.taskerProfile?.hourlyRate || '',
        advancePaymentAmount: data.taskerProfile?.advancePaymentAmount || '',
        isAvailable: data.taskerProfile?.isAvailable || true
      });
    } catch (err) {
      setError('Failed to load profile');
      showError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const data = await getMyTasks();
      const tasks = data.data || [];
      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      const activeTasks = tasks.filter(t => t.status === 'active' || t.status === 'scheduled').length;
      const totalTasks = tasks.length;
      
      // Calculate total earnings as sum of advance payments (20% of agreed payment)
      // Only count tasks that are completed and have advance payment released
      const totalEarnings = tasks
        .filter(t => t.status === 'completed' && t.advancePaymentStatus === 'released' && t.agreedPayment)
        .reduce((sum, t) => {
          // Calculate advance payment (20% of agreed payment)
          const advanceAmount = Math.round(t.agreedPayment * 0.2);
          return sum + advanceAmount;
        }, 0);
      
      let responseRate = 0;
      if (totalTasks > 0) {
        const completionRate = (completedTasks / totalTasks) * 100;
        responseRate = Math.min(Math.max(completionRate, totalTasks > 0 ? 85 : 0), 100);
      }
      setStatistics({
        completedTasks,
        activeTasks,
        totalEarnings,
        responseRate: Math.round(responseRate),
        avgRating: user?.rating?.average || 0,
        totalReviews: user?.rating?.count || 0
      });
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  const fetchRecentTasks = async () => {
    try {
      const data = await getMyRecentTasks();
      setRecentTasks(data.data || []);
    } catch (err) {
      console.error('Error fetching recent tasks:', err);
    }
  };

  const fetchReviews = async () => {
    try {
      const userId = user?._id;
      if (!userId) return;
      const data = await getTaskerReviews(userId);
      setReviews(data.data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const fetchJobAlerts = async () => {
    try {
      const data = await getAvailableTasks();
      const tasks = data.data || [];
      const userSkills = user?.taskerProfile?.skills || [];
      const relevantTasks = tasks.filter(task => {
        if (userSkills.length === 0) return true;
        return userSkills.some(skill => 
          task.title?.toLowerCase().includes(skill.toLowerCase()) ||
          task.description?.toLowerCase().includes(skill.toLowerCase()) ||
          task.category?.toLowerCase().includes(skill.toLowerCase())
        );
      });
      setJobAlerts(relevantTasks.slice(0, 6));
    } catch (err) {
      console.error('Error fetching job alerts:', err);
    }
  };

  const handleAvailabilityChange = async (isAvailable) => {
    try {
      setUpdatingAvailability(true);
      
      // Update the form data immediately for UI responsiveness
      setFormData(prev => ({ ...prev, isAvailable }));
      
      // Call the dedicated availability API
      await updateTaskerAvailability({ isAvailable });
      
      // Update the user state
      setUser(prev => ({
        ...prev,
        taskerProfile: {
          ...prev.taskerProfile,
          isAvailable
        }
      }));
      
      showSuccess(`Availability status updated to ${isAvailable ? 'Available' : 'Not Available'}`);
    } catch (err) {
      // Revert the form data if API call fails
      setFormData(prev => ({ ...prev, isAvailable: !isAvailable }));
      showError('Failed to update availability status');
      console.error('Error updating availability:', err);
    } finally {
      setUpdatingAvailability(false);
    }
  };

  // Helper function to validate token
  const validateToken = (token) => {
    if (!token) return false;
    
    try {
      // Basic JWT structure check
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      // Decode payload to check expiration
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (payload.exp && payload.exp < currentTime) {
        return false;
      }
      
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Validate token before making API call
      const token = getToken();
      if (!token || !validateToken(token)) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        showError('Your session has expired. Please log in again.');
        setTimeout(() => { window.location.href = '/login'; }, 2000);
        return;
      }
      const updateData = {
        fullName: formData.fullName,
        phone: formData.phone,
        taskerProfile: {
          bio: formData.bio,
          experience: formData.experience,
          skills: formData.skills,
          province: formData.province,
          district: formData.district,
          hourlyRate: formData.hourlyRate,
          advancePaymentAmount: formData.advancePaymentAmount
        }
      };
      const updatedUser = await updateUserProfile(updateData);
      setUser(updatedUser);
      setIsEditing(false);
      showSuccess('Profile updated successfully!');
    } catch (err) {
      showError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const handlePasswordChange = async () => {
    try {
      // Validate passwords match
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        showError('New passwords do not match');
        return;
      }
      // Validate password strength
      if (passwordData.newPassword.length < 8) {
        showError('Password must be at least 8 characters long');
        return;
      }
      setChangingPassword(true);
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      showSuccess('Password changed successfully!');
    } catch (err) {
      showError(err.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  // Use the centralized formatCurrency function from appConfig

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper functions for document handling
  const getDocumentUrl = (docPath) => {
    // Handle both absolute and relative paths
    return docPath.includes('uploads/') 
      ? `${APP_CONFIG.API.BASE_URL}/${docPath}`
      : `${APP_CONFIG.API.BASE_URL}/uploads/tasker-docs/${docPath.split(/[\\\/]/).pop()}`;
  };

  const getFileType = (filename) => {
    const extension = filename.toLowerCase().split('.').pop();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return 'image';
    } else if (extension === 'pdf') {
      return 'pdf';
    }
    return 'unknown';
  };

  const handlePreviewDocument = (docPath, title) => {
    setPreviewDocument({
      url: getDocumentUrl(docPath),
      title: title,
      type: getFileType(docPath)
    });
    setShowPreview(true);
  };

  const handleDownloadDocument = (docPath, filename) => {
    const url = getDocumentUrl(docPath);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // File upload handling functions
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
  };

  const handleUploadDocuments = async () => {
    if (selectedFiles.length === 0) {
      showError('Please select files to upload');
      return;
    }

    try {
      setUploadingDocuments(true);
      const response = await uploadQualificationDocuments(selectedFiles);
      
      // Update the user state with new documents
      setUser(prev => ({
        ...prev,
        taskerProfile: {
          ...prev.taskerProfile,
          qualificationDocuments: [
            ...(prev.taskerProfile?.qualificationDocuments || []),
            ...response.data
          ]
        }
      }));

      setSelectedFiles([]);
      setShowUploadModal(false);
      showSuccess('Qualification documents uploaded successfully!');
    } catch (error) {
      showError('Failed to upload documents. Please try again.');
      console.error('Error uploading documents:', error);
    } finally {
      setUploadingDocuments(false);
    }
  };

  const handleRemoveDocument = async (documentPath, index) => {
    try {
      // Extract document ID from path or use index as fallback
      const documentId = documentPath.split('/').pop().split('.')[0] || index;
      await removeQualificationDocument(documentId);
      
      // Update the user state by removing the document
      setUser(prev => ({
        ...prev,
        taskerProfile: {
          ...prev.taskerProfile,
          qualificationDocuments: prev.taskerProfile.qualificationDocuments.filter((_, i) => i !== index)
        }
      }));

      showSuccess('Document removed successfully!');
    } catch (error) {
      showError('Failed to remove document. Please try again.');
      console.error('Error removing document:', error);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaChartLine },
    { id: 'personal', label: 'Personal', icon: FaUser },
    { id: 'profile', label: 'Profile', icon: FaTools },
    { id: 'documents', label: 'Documents', icon: FaFileAlt },
    { id: 'account', label: 'Account Settings', icon: FaCog }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            <span className="text-slate-700 font-medium">Loading profile...</span>
          </div>
      </div>
    </div>
  );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-2xl flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Profile Error</h2>
          <p className="text-slate-600 mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg"
        >
          Try Again
        </button>
      </div>
    </div>
  );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50/20 to-indigo-50/20 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-slate-600 mt-2">
                Manage your profile and account settings
              </p>
              </div>
                </div>
              </div>
            </div>

            {/* Profile Completion Prompt */}
            <div className="max-w-7xl mx-auto px-4 py-4">
              <ProfileCompletionPrompt userProfile={user} />
            </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-80">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => (
            <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-500/80 to-blue-600/80 text-white shadow-lg'
                        : 'text-slate-700 hover:bg-blue-50/60 hover:text-blue-600'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
            </button>
                ))}
              </nav>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
            <div className="space-y-4">
                {/* Welcome Section */}
                <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      {user.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                <div className="flex-1">
                      <h2 className="text-xl font-bold text-slate-800">Welcome back, {user.fullName?.split(' ')[0]}!</h2>
                      <p className="text-sm text-slate-600">Here's your daily activities and Task alerts</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold ${
                        formData.isAvailable 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          formData.isAvailable ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <span>{formData.isAvailable ? 'Available' : 'Unavailable'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick Stats Cards */}
                  {statistics && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-md p-2 border border-blue-200/50">
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="text-blue-600 text-sm font-semibold mb-0.5">Scheduled</p>
                            <p className="text-xl font-bold text-blue-800">{statistics.activeTasks}</p>
                          </div>
                          <div className="w-9 h-9 bg-blue-500 rounded-md flex items-center justify-center ml-1">
                            <FaClock className="w-5 h-5 text-white" />
                          </div>
                </div>
              </div>
              
                      <div className="bg-gradient-to-r from-green-50 to-green-100/50 rounded-md p-2 border border-green-200/50">
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="text-green-600 text-sm font-semibold mb-0.5">Completed</p>
                            <p className="text-xl font-bold text-green-800">{statistics.completedTasks}</p>
                          </div>
                          <div className="w-9 h-9 bg-green-500 rounded-md flex items-center justify-center ml-1">
                            <FaCheckCircle className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
            
                      <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-md p-2 border border-purple-200/50">
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="text-purple-600 text-sm font-semibold mb-0.5">Applied</p>
                            <p className="text-xl font-bold text-purple-800">{recentTasks.length}</p>
                          </div>
                          <div className="w-9 h-9 bg-purple-500 rounded-md flex items-center justify-center ml-1">
                            <FaTasks className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
              
                      <div className="bg-gradient-to-r from-yellow-50 to-yellow-100/50 rounded-md p-2 border border-yellow-200/50">
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="text-yellow-600 text-sm font-semibold mb-0.5">Job Alerts</p>
                            <p className="text-xl font-bold text-yellow-800">{jobAlerts.length}</p>
                          </div>
                          <div className="w-9 h-9 bg-yellow-500 rounded-md flex items-center justify-center ml-1">
                            <FaHeart className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>
                  )}
                </div>

                {/* Performance Statistics */}
                {statistics && (
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-slate-800">Performance Overview</h3>
                      <button className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center space-x-1">
                        <span>View all</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="text-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <FaCheckCircle className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="text-lg font-bold text-slate-800">{statistics.completedTasks}</div>
                        <div className="text-xs text-slate-600">Tasks Completed</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <FaStar className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div className="text-lg font-bold text-slate-800">
                          {statistics.avgRating > 0 ? statistics.avgRating.toFixed(1) : 'New'}
                        </div>
                        <div className="text-xs text-slate-600">Average Rating</div>
        </div>

                      <div className="text-center">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <FaDollarSign className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="text-lg font-bold text-slate-800">{formatCurrency(statistics.totalEarnings)}</div>
                        <div className="text-xs text-slate-600">Total Earned</div>
              </div>
                      
                      <div className="text-center">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <FaChartLine className="w-5 h-5 text-purple-600" />
              </div>
                        <div className="text-lg font-bold text-slate-800">{statistics.responseRate}%</div>
                        <div className="text-xs text-slate-600">Response Rate</div>
              </div>
              </div>
            </div>
                )}

                {/* Recent Tasks */}
                <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-slate-800">Recently Applied</h3>
                    <button className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center space-x-1">
                      <span>View all</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
            </div>

                  {recentTasks.length > 0 ? (
                    <div className="space-y-2">
                      {recentTasks.slice(0, 3).map((task) => (
                        <div key={task._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FaTasks className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-slate-800 text-sm">{task.title}</h4>
                              <p className="text-xs text-slate-600">{task.category}</p>
                              <p className="text-xs text-slate-500">
                                Budget: {formatCurrency(task.maxPayment)} • {formatDate(task.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                              {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                          </span>
                            {task.agreedTime && (
                              <p className="text-xs text-slate-500 mt-1">
                                Scheduled: {formatDate(task.agreedTime)}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                            </div>
                          ) : (
                    <div className="text-center py-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <FaTasks className="w-6 h-6 text-gray-400" />
                      </div>
                      <h4 className="text-sm font-semibold text-slate-800 mb-1">No Recent Tasks</h4>
                      <p className="text-xs text-slate-600">Start applying to tasks to see them here</p>
                    </div>
                  )}
                </div>

                {/* Recent Reviews */}
                <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-slate-800">Recent Reviews</h3>
                    <button className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center space-x-1">
                      <span>View all</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  
                  {reviews.length > 0 ? (
                    <div className="space-y-2">
                      {reviews.slice(0, 2).map((review, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <FaUser className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-medium text-slate-800 text-sm">{review.customer?.fullName || 'Anonymous'}</h4>
                                <div className="flex items-center space-x-1">
                                  {[...Array(5)].map((_, i) => (
                                    <FaStar
                                      key={i}
                                      className={`w-3 h-3 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                    />
                                  ))}
                                  <span className="text-xs text-slate-600 ml-1">({review.rating})</span>
                                </div>
                              </div>
                              <p className="text-xs text-slate-600 mb-1">{review.comment}</p>
                              <p className="text-xs text-slate-500">{formatDate(review.createdAt)}</p>
              </div>
            </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <FaStar className="w-6 h-6 text-gray-400" />
                      </div>
                      <h4 className="text-sm font-semibold text-slate-800 mb-1">No Reviews Yet</h4>
                      <p className="text-xs text-slate-600">Complete tasks to start receiving reviews</p>
                    </div>
                  )}
          </div>

                {/* Job Alerts */}
                <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-slate-800">Job Alerts</h3>
                    <button className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center space-x-1">
                      <span>Browse all jobs</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  
                  {jobAlerts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {jobAlerts.slice(0, 4).map((job) => (
                        <div key={job._id} className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-slate-800 text-sm">{job.title}</h4>
                            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                              {job.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mb-2 line-clamp-2">
                            {job.description?.substring(0, 80)}...
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 text-xs text-slate-500">
                              <span className="flex items-center space-x-1">
                                <FaDollarSign className="w-3 h-3" />
                                <span>{formatCurrency(job.maxPayment)}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <FaMapMarkerAlt className="w-3 h-3" />
                                <span>{job.location}</span>
                              </span>
                            </div>
                            <button className="text-blue-600 hover:text-blue-700 text-xs font-medium">
                              Apply Now
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <FaHeart className="w-6 h-6 text-gray-400" />
                      </div>
                      <h4 className="text-sm font-semibold text-slate-800 mb-1">No Job Alerts</h4>
                      <p className="text-xs text-slate-600">Complete your profile and add skills to get relevant job alerts</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Personal Tab */}
            {activeTab === 'personal' && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-slate-800">Basic Information</h2>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 font-medium shadow-lg"
                  >
                    <FaEdit className="w-4 h-4" />
                    <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                  </button>
                </div>
                
                {/* Profile Picture */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-slate-700 mb-3">Profile Picture</label>
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                        {user.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      {isEditing && (
                        <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                          <FaCamera className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-2">
                        Browse photo or drag here
                      </p>
                      <p className="text-xs text-slate-500">
                        A photo larger than 400 pixels work best. Max photo size 5 MB.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Full name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-700">
                        {user.fullName}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                    <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-700">
                      {user.email}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+94 XX XXX XXXX"
                      />
                    ) : (
                      <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-700">
                        {formData.phone || 'Not provided'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Member Since</label>
                    <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-700">
                      {formatDate(user.createdAt)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Account Status</label>
                    <div className="flex items-center space-x-3">
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                      <span className="text-sm text-slate-600">Your account is verified and active</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Availability Status</label>
                    <div className="flex items-center space-x-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isAvailable}
                          onChange={(e) => handleAvailabilityChange(e.target.checked)}
                          className="sr-only peer"
                          disabled={updatingAvailability}
                        />
                        <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${updatingAvailability ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
                      </label>
                      <div className="flex items-center space-x-2">
                        {updatingAvailability && <FaSpinner className="w-4 h-4 animate-spin text-blue-600" />}
                        <span className="text-sm text-slate-600">
                          {formData.isAvailable ? 'Available for new tasks' : 'Not available for new tasks'}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Toggle your availability status. When unavailable, you won't appear in customer searches.
                    </p>
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-8 flex justify-end">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 font-medium shadow-lg disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <FaSpinner className="w-4 h-4 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <FaSave className="w-4 h-4" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-8">


                {/* Skills Section */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-800">Skills & Expertise</h3>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 font-medium shadow-lg text-sm"
                    >
                      <FaEdit className="w-4 h-4" />
                      <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                    </button>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-3">Your Skills</label>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                        >
                          {skill}
                          {isEditing && (
                            <button
                              onClick={() => removeSkill(skill)}
                              className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                              <FaTimes className="w-3 h-3" />
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                    
                    {isEditing && (
                      <div className="flex items-center space-x-2 mt-4">
                        <input
                          type="text"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          placeholder="Add a skill"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                        />
                        <button
                          onClick={addSkill}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <FaPlus className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-3">Bio</label>
                    {isEditing ? (
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Tell us about yourself and your experience..."
                      />
                    ) : (
                      <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-700 min-h-[100px]">
                        {formData.bio || 'No bio added yet'}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-3">Province</label>
                      {isEditing ? (
                        <select
                          value={formData.province}
                          onChange={(e) => setFormData({ ...formData, province: e.target.value, district: '' })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select province</option>
                          {PROVINCES.map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      ) : (
                        <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-700">
                          {formData.province || 'Not specified'}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-3">District</label>
                      {isEditing ? (
                        <select
                          value={formData.district}
                          onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={!formData.province}
                        >
                          <option value="">{formData.province ? 'Select district' : 'Select province first'}</option>
                          {getDistrictsForProvince(formData.province).map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      ) : (
                        <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-700">
                          {formatLocation(formData.province, formData.district) || 'Not specified'}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-3">Hourly Rate (LKR)</label>
                      {isEditing ? (
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">LKR</span>
                          </div>
                          <input
                            type="number"
                            min="500"
                            max="50000"
                            step="100"
                            value={formData.hourlyRate || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Only allow positive numbers
                              if (value === '' || (Number(value) >= 0 && Number(value) <= 50000)) {
                                setFormData({...formData, hourlyRate: value});
                              }
                            }}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="2000"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">/hour</span>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-700">
                          {formData.hourlyRate ? formatCurrency(formData.hourlyRate) + '/hour' : 'Not specified'}
                        </div>
                      )}
                      {isEditing && (
                        <p className="text-xs text-gray-500 mt-1">
                          Recommended range: {APP_CONFIG.CURRENCY.CODE} {APP_CONFIG.TASK.MIN_PAYMENT} - {APP_CONFIG.TASK.MAX_PAYMENT} per hour
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-3">Experience Level</label>
                      {isEditing ? (
                        <select
                          value={formData.experience}
                          onChange={(e) => setFormData({...formData, experience: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select...</option>
                          <option value="0-1 years">0-1 years</option>
                          <option value="1-3 years">1-3 years</option>
                          <option value="3-5 years">3-5 years</option>
                          <option value="5+ years">5+ years</option>
                        </select>
                      ) : (
                        <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-700">
                          {formData.experience || 'Not specified'}
                        </div>
                      )}
                    </div>

                   
                </div>
                
                  {isEditing && (
                    <div className="mt-8 flex justify-end">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 font-medium shadow-lg disabled:opacity-50"
                      >
                        {saving ? (
                          <>
                            <FaSpinner className="w-4 h-4 animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <FaSave className="w-4 h-4" />
                            <span>Save Changes</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
                </div>
            )}



            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="space-y-8">
                {/* ID Document Section */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
                  <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                    <FaFileAlt className="w-6 h-6 text-blue-600 mr-3" />
                    Identification Document
                  </h3>
                  
                  {user.taskerProfile?.idDocument ? (
                    <div className="border border-gray-200 rounded-xl p-6 bg-blue-50/30">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <FaFileAlt className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-800">ID Document</h4>
                          <p className="text-sm text-slate-600 mt-1">
                            {user.taskerProfile.idDocument.split('/').pop()}
                          </p>
                          <div className="flex items-center space-x-3 mt-3">
                            <button 
                              onClick={() => handleDownloadDocument(user.taskerProfile.idDocument, 'id-document')}
                              className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center space-x-1 bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors"
                            >
                              <FaDownload className="w-4 h-4" />
                              <span>Download</span>
                            </button>
                            <button 
                              onClick={() => {
                                const docPath = user.taskerProfile.idDocument;
                                const url = getDocumentUrl(docPath);
                                window.open(url, '_blank');
                              }}
                              className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center space-x-1 bg-purple-50 px-3 py-1.5 rounded-lg hover:bg-purple-100 transition-colors"
                            >
                              <FaExpand className="w-4 h-4" />
                              <span>Open</span>
                            </button>
                            
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FaFileAlt className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No ID document uploaded</p>
                    </div>
                  )}
                </div>

                {/* Qualification Documents Section */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center">
                      <FaAward className="w-6 h-6 text-green-600 mr-3" />
                      Qualification Documents
                    </h3>
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center space-x-2 font-medium shadow-lg"
                    >
                      <FaPlus className="w-4 h-4" />
                      <span>Add Documents</span>
                    </button>
                  </div>
                  
                  {user.taskerProfile?.qualificationDocuments && user.taskerProfile.qualificationDocuments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {user.taskerProfile.qualificationDocuments.map((doc, index) => (
                        <div key={index} className="border border-gray-200 rounded-xl p-6 bg-green-50/30">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                              <FaAward className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-800">
                                Qualification Document {index + 1}
                              </h4>
                              <p className="text-sm text-slate-600 mt-1">
                                {doc.split('/').pop()}
                              </p>
                              <div className="flex items-center space-x-3 mt-3">
                                <button 
                                  onClick={() => handleDownloadDocument(doc, `qualification-document-${index + 1}`)}
                                  className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center space-x-1 bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors"
                                >
                                  <FaDownload className="w-4 h-4" />
                                  <span>Download</span>
                                </button>
                                <button 
                                  onClick={() => {
                                    const url = getDocumentUrl(doc);
                                    window.open(url, '_blank');
                                  }}
                                  className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center space-x-1 bg-purple-50 px-3 py-1.5 rounded-lg hover:bg-purple-100 transition-colors"
                                >
                                  <FaExpand className="w-4 h-4" />
                                  <span>Open</span>
                                </button>
                                <button 
                                  onClick={() => handleRemoveDocument(doc, index)}
                                  className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center space-x-1 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                                >
                                  <FaTrash className="w-4 h-4" />
                                  <span>Remove</span>
                                </button>
                                
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FaAward className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No qualification documents uploaded</p>
                      <p className="text-sm text-gray-400 mt-2">Click "Add Documents" to upload your qualifications</p>
                    </div>
                  )}

                  {/* Document Upload Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-6">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                        <FaInfoCircle className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-blue-800">Document Management</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          You can now add, remove, and manage your qualification documents directly from this interface. 
                          Supported formats: PDF, JPG, PNG, GIF, WEBP (Max size: 10MB per file).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Account Settings Tab */}
            {activeTab === 'account' && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-8">Account Settings</h2>
                
                <div className="space-y-8">

                  {/* Security Settings */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Security Settings</h3>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center mt-0.5">
                          <FaLock className="w-3 h-3 text-white" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-yellow-800">Two-Factor Authentication</h4>
                          <p className="text-sm text-yellow-700 mt-1">
                            Enhance your account security by enabling two-factor authentication. This feature is coming soon.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Password Change Section */}
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
                        <input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter current password"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter new password"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Password must be at least 8 characters with uppercase, lowercase, number, and special character
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Confirm new password"
                        />
                </div>
                      <button
                        onClick={handlePasswordChange}
                        disabled={changingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center space-x-2 font-medium shadow-lg disabled:opacity-50"
                      >
                        {changingPassword ? (
                          <>
                            <FaSpinner className="w-4 h-4 animate-spin" />
                            <span>Changing Password...</span>
                          </>
                        ) : (
                          <>
                            <FaLock className="w-4 h-4" />
                            <span>Change Password</span>
                          </>
                        )}
                      </button>
                </div>
              </div>
              
                  {/* Account Preferences */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Account Preferences</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                          <FaUser className="w-3 h-3 text-white" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-blue-800">Profile Visibility</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            {formData.isAvailable 
                              ? 'Your profile is currently visible to customers and you will appear in search results.' 
                              : 'Your profile is currently hidden from customers and you will not appear in search results.'
                            } You can toggle your availability status in the Personal section.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

     

      {/* Document Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Qualification Documents"
        icon={FaUpload}
        iconColor="text-blue-600"
        iconBgColor="bg-blue-100"
        maxWidth="max-w-2xl"
        maxHeight="max-h-[90vh]"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            You can upload multiple qualification documents here. Supported formats: PDF, JPG, PNG, GIF, WEBP (Max size: 10MB per file).
          </p>
          <input
            type="file"
            multiple
            accept=".pdf,image/*"
            onChange={handleFileSelect}
            className="block w-full text-sm text-slate-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="text-xs text-slate-500">
            {selectedFiles.length} file(s) selected
          </p>
          <button
            onClick={handleUploadDocuments}
            disabled={selectedFiles.length === 0 || uploadingDocuments}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2 font-medium shadow-lg disabled:opacity-50"
          >
            {uploadingDocuments ? (
              <>
                <FaSpinner className="w-4 h-4 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <FaUpload className="w-4 h-4" />
                <span>Upload Documents</span>
              </>
            )}
          </button>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default TaskerProfile; 
