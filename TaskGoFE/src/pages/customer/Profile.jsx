import { useEffect, useState } from 'react';
import { 
  FaEdit, FaUser, FaEnvelope, FaMapMarkerAlt, FaTasks, FaStar, FaCog, 
  FaCamera, FaPhone, FaDollarSign, FaCheckCircle, FaClock, FaChartLine, 
  FaEye, FaHeart, FaSpinner, FaLock, FaSave, FaTimes
} from 'react-icons/fa';
import { changePassword, getUserProfile, updateUserProfile } from '../../services/api/userService';
import { useToast, ToastContainer } from '../../components/common/Toast';
import { getMyTasks, getMyRecentTasks } from '../../services/api/taskService';
import { PROVINCES, getDistrictsForProvince, formatLocation } from '../../config/locations';
import { APP_CONFIG, formatCurrency, formatTimeAgo } from '../../config/appConfig';
import { getToken } from '../../utils/auth';


const CustomerProfile = () => {
  const [user, setUser] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [recentTasks, setRecentTasks] = useState([]);
  const { toasts, removeToast, showSuccess, showError } = useToast();

  // Form state for editing
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    province: '',
    district: ''
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Bank details state (temporary local persistence until backend supports it)
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: '',
    bankName: '',
    branch: '',
    accountNumber: '',
    swiftOrIfsc: ''
  });

  useEffect(() => {
    fetchProfile();
    fetchStatistics();
    fetchRecentTasks();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getUserProfile();
      setUser(data);
      setFormData({
        fullName: data.fullName || '',
        email: data.email || '',
        phone: data.phone || '',
        province: data.customerProfile?.province || '',
        district: data.customerProfile?.district || ''
      });

      // Load bank details (from backend if available, else from localStorage)
      try {
        const backendBank = data.customerProfile?.bankDetails || null;
        const localBank = JSON.parse(localStorage.getItem('customerBankDetails') || 'null');
        const effective = backendBank || localBank;
        if (effective) setBankDetails(effective);
      } catch (_) {}
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
      
      // Calculate total spent from completed tasks
      const totalSpent = tasks
        .filter(t => t.status === 'completed' && t.agreedPayment)
        .reduce((sum, t) => sum + t.agreedPayment, 0);
      
      setStatistics({
        completedTasks,
        activeTasks,
        totalTasks,
        totalSpent
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

  // Helper function to validate token
  const validateToken = (token) => {
    if (!token) return false;
    
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
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
        customerProfile: {
          province: formData.province,
          district: formData.district
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

  const handlePasswordChange = async () => {
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        showError('New passwords do not match');
        return;
      }
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

  const handleSaveBankDetails = async () => {
    try {
      // Try to persist to backend if supported
      const updateData = {
        customerProfile: {
          bankDetails
        }
      };
      try {
        await updateUserProfile(updateData);
        showSuccess('Bank details saved');
      } catch (apiErr) {
        // Backend may not support bankDetails yet; fall back to local storage only
        console.warn('Bank details API not available, storing locally instead', apiErr);
        showSuccess('Bank details saved locally');
      }
    } catch (err) {
      showError('Failed to save bank details');
      return;
    }

    // Always persist locally so user does not lose data
    try {
      localStorage.setItem('customerBankDetails', JSON.stringify(bankDetails));
    } catch (_) {}
  };

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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaChartLine },
    { id: 'personal', label: 'Personal', icon: FaUser },
    { id: 'account', label: 'Account Settings', icon: FaCog }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-200 to-indigo-200 flex items-center justify-center">
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
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-200 to-indigo-200 flex items-center justify-center">
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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-sky-100 via-blue-200 to-indigo-200">
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
                      <p className="text-sm text-slate-600">Here's your task activity and statistics</p>
                    </div>
                  </div>
                  
                  {/* Quick Stats Cards */}
                  {statistics && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-md p-2 border border-blue-200/50">
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="text-blue-600 text-sm font-semibold mb-0.5">Total Tasks</p>
                            <p className="text-xl font-bold text-blue-800">{statistics.totalTasks}</p>
                          </div>
                          <div className="w-9 h-9 bg-blue-500 rounded-md flex items-center justify-center ml-1">
                            <FaTasks className="w-5 h-5 text-white" />
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
                            <p className="text-purple-600 text-sm font-semibold mb-0.5">Active</p>
                            <p className="text-xl font-bold text-purple-800">{statistics.activeTasks}</p>
                          </div>
                          <div className="w-9 h-9 bg-purple-500 rounded-md flex items-center justify-center ml-1">
                            <FaClock className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-yellow-50 to-yellow-100/50 rounded-md p-2 border border-yellow-200/50">
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="text-yellow-600 text-sm font-semibold mb-0.5">Total Spent</p>
                            <p className="text-xl font-bold text-yellow-800">{formatCurrency(statistics.totalSpent)}</p>
                          </div>
                          <div className="w-9 h-9 bg-yellow-500 rounded-md flex items-center justify-center ml-1">
                            <FaDollarSign className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

               

                {/* Recent Tasks */}
                <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-slate-800">Recent Tasks</h3>
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
                      <p className="text-xs text-slate-600">Start posting tasks to see them here</p>
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
                    <label className="block text-sm font-medium text-slate-700 mb-2">Province</label>
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
                    <label className="block text-sm font-medium text-slate-700 mb-2">District</label>
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
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default CustomerProfile; 