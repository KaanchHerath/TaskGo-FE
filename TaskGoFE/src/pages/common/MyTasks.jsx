import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTasks, FaUser, FaUsers, FaEye, FaEdit, FaTrash, FaCalendar, FaDollarSign, FaMapMarkerAlt, FaClock, FaCheckCircle, FaTimesCircle, FaHourglass, FaList, FaBars } from 'react-icons/fa';

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = parseJwt(token);
      if (payload) {
        setUserRole(payload.role);
      }
    }
  }, []);

  useEffect(() => {
    if (userRole) {
      fetchMyTasks();
      if (userRole === 'tasker') {
        fetchMyApplications();
      }
    }
  }, [userRole, activeTab]);

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const statusFilter = activeTab !== 'all' ? `?status=${activeTab}` : '';
      
      const response = await fetch(`http://localhost:5000/api/v1/tasks/my-tasks${statusFilter}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data = await response.json();
      setTasks(data.data || []);
    } catch (error) {
      console.error('Error fetching my tasks:', error);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const statusFilter = activeTab !== 'all' ? `?status=${activeTab}` : '';
      
      const response = await fetch(`http://localhost:5000/api/v1/tasks/my-applications${statusFilter}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const data = await response.json();
      setApplications(data.data || []);
    } catch (error) {
      console.error('Error fetching my applications:', error);
      setError('Failed to load applications. Please try again.');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <FaHourglass className="w-4 h-4 text-blue-500" />;
      case 'scheduled':
        return <FaCalendar className="w-4 h-4 text-yellow-500" />;
      case 'completed':
        return <FaCheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <FaTimesCircle className="w-4 h-4 text-red-500" />;
      default:
        return <FaClock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return `LKR ${amount?.toLocaleString()}`;
  };

  const handleTaskClick = (taskId, applicationId = null) => {
    if (userRole === 'customer') {
      // For customers, go to task details with applications management
      navigate(`/tasks/${taskId}`);
    } else {
      // For taskers, go to the dedicated task view page
      navigate(`/tasker/task/${taskId}`);
    }
  };

  const handleEditTask = (taskId, e) => {
    e.stopPropagation();
    navigate(`/edit-task/${taskId}`);
  };

  const tabs = [
    { id: 'all', label: 'All', count: userRole === 'customer' ? tasks.length : applications.length },
    { id: 'active', label: 'Active', count: userRole === 'customer' ? tasks.filter(t => t.status === 'active').length : applications.filter(a => a.task.status === 'active').length },
    { id: 'scheduled', label: 'Scheduled', count: userRole === 'customer' ? tasks.filter(t => t.status === 'scheduled').length : applications.filter(a => a.task.status === 'scheduled').length },
    { id: 'completed', label: 'Completed', count: userRole === 'customer' ? tasks.filter(t => t.status === 'completed').length : applications.filter(a => a.task.status === 'completed').length },
    { id: 'cancelled', label: 'Cancelled', count: userRole === 'customer' ? tasks.filter(t => t.status === 'cancelled').length : applications.filter(a => a.task.status === 'cancelled').length }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30"></div>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500/80 border-t-transparent absolute top-0"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="text-center bg-gradient-to-r from-white/60 to-white/40 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/30">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-red-100/60 to-red-200/60 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Something went wrong</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-gradient-to-r from-blue-500/80 to-blue-600/80 backdrop-blur-sm text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-blue-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const currentData = userRole === 'customer' ? tasks : applications;
  const filteredData = activeTab === 'all' ? currentData : currentData.filter(item => {
    if (userRole === 'customer') {
      return item.status === activeTab;
    } else {
      // For taskers, filter by the task status (not application status)
      return item.task.status === activeTab;
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50/20 to-indigo-50/20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500/80 to-indigo-600/80 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-md shadow-blue-500/25">
                <FaTasks className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  My Tasks
                </h1>
                <p className="text-slate-600">
                  {userRole === 'customer' 
                    ? 'Manage your posted tasks and track their progress' 
                    : 'View tasks you\'ve applied for and track your applications'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Mobile sidebar toggle */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden bg-white/60 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-white/30 text-slate-600 hover:text-blue-600 transition-all duration-200"
              >
                <FaBars className="w-5 h-5" />
              </button>
              {userRole === 'customer' && (
                <button
                  onClick={() => navigate('/post-task')}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 font-medium shadow-lg hover:shadow-blue-200"
                >
                  <FaTasks className="w-4 h-4" />
                  <span className="hidden sm:inline">Post New Task</span>
                  <span className="sm:hidden">Post</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto w-80 lg:w-72 xl:w-80`}>
            {/* Mobile overlay */}
            {sidebarOpen && (
              <div 
                className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm"
                onClick={() => setSidebarOpen(false)}
              />
            )}
            
            {/* Sidebar content */}
            <div className="relative h-full lg:h-auto bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-6 mt-20 lg:mt-0">
              {/* Mobile close button */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                ✕
              </button>

              {/* Sidebar Header */}
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-800 mb-2 flex items-center space-x-2">
                  <FaList className="w-5 h-5 text-blue-500" />
                  <span>Filter Tasks</span>
                </h2>
                <p className="text-sm text-slate-600">
                  Browse your tasks by status
                </p>
              </div>

              {/* Navigation Tabs */}
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSidebarOpen(false); // Close mobile sidebar on selection
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-xl text-left transition-all duration-200 group ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-500/80 to-blue-600/80 text-white shadow-lg shadow-blue-500/25'
                        : 'text-slate-700 hover:bg-blue-50/60 hover:text-blue-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                        activeTab === tab.id 
                          ? 'bg-white/20' 
                          : 'bg-slate-100 group-hover:bg-blue-100'
                      }`}>
                        {tab.id === 'all' && <FaList className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : 'text-slate-600 group-hover:text-blue-600'}`} />}
                        {tab.id === 'active' && <FaHourglass className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : 'text-blue-500'}`} />}
                        {tab.id === 'scheduled' && <FaCalendar className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : 'text-yellow-500'}`} />}
                        {tab.id === 'completed' && <FaCheckCircle className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : 'text-green-500'}`} />}
                        {tab.id === 'cancelled' && <FaTimesCircle className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : 'text-red-500'}`} />}
                      </div>
                      <div>
                        <div className="font-medium">{tab.label}</div>
                        <div className={`text-xs ${
                          activeTab === tab.id ? 'text-white/80' : 'text-slate-500'
                        }`}>
                          {tab.count} {tab.count === 1 ? 'task' : 'tasks'}
                        </div>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      activeTab === tab.id 
                        ? 'bg-white/20 text-white' 
                        : 'bg-slate-200 text-slate-600 group-hover:bg-blue-200 group-hover:text-blue-700'
                    }`}>
                      {tab.count}
                    </div>
                  </button>
                ))}
              </nav>

              {/* Quick Actions */}
              <div className="mt-8 pt-6 border-t border-slate-200/60">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  {userRole === 'customer' ? (
                    <button
                      onClick={() => navigate('/post-task')}
                      className="w-full flex items-center space-x-3 p-3 rounded-xl text-left text-slate-600 hover:bg-blue-50/60 hover:text-blue-600 transition-all duration-200"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FaTasks className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium">Post New Task</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('/tasks')}
                      className="w-full flex items-center space-x-3 p-3 rounded-xl text-left text-slate-600 hover:bg-blue-50/60 hover:text-blue-600 transition-all duration-200"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FaTasks className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium">Browse Tasks</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Tasks/Applications Grid */}
        {filteredData.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto bg-gradient-to-r from-white/50 to-white/30 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-xl">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-slate-100/60 to-slate-200/60 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <FaTasks className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                {activeTab === 'all' ? 'No tasks found' : `No ${activeTab} tasks`}
              </h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                {userRole === 'customer' 
                  ? 'You haven\'t posted any tasks yet. Start by posting your first task!'
                  : 'You haven\'t applied for any tasks yet. Browse available tasks to get started!'
                }
              </p>
              {userRole === 'customer' ? (
                <button
                  onClick={() => navigate('/post-task')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500/80 to-blue-600/80 backdrop-blur-sm text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-blue-200"
                >
                  Post Your First Task
                </button>
              ) : (
                <button
                  onClick={() => navigate('/tasks')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500/80 to-blue-600/80 backdrop-blur-sm text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-blue-200"
                >
                  Browse Available Tasks
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map((item) => {
              const task = userRole === 'customer' ? item : item.task;
              const isApplication = userRole === 'tasker';
              
              return (
                <div
                  key={isApplication ? item._id : task._id}
                  onClick={() => handleTaskClick(task._id, isApplication ? item._id : null)}
                  className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30 hover:shadow-xl hover:bg-white/80 transition-all duration-300 cursor-pointer group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(task.status)}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </span>
                    </div>
                    {userRole === 'customer' && task.status === 'active' && (
                      <button
                        onClick={(e) => handleEditTask(task._id, e)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Task Title */}
                  <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {task.title}
                  </h3>

                  {/* Task Description */}
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                    {task.description}
                  </p>

                  {/* Task Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                      <FaMapMarkerAlt className="w-3 h-3" />
                      <span>{task.area}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                      <FaDollarSign className="w-3 h-3" />
                      <span>{formatCurrency(task.minPayment)} - {formatCurrency(task.maxPayment)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                      <FaCalendar className="w-3 h-3" />
                      <span>Posted {formatDate(task.createdAt)}</span>
                    </div>
                    {isApplication && (
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <FaClock className="w-3 h-3" />
                        <span>Applied {formatDate(item.createdAt)}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200/60">
                    {userRole === 'customer' ? (
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <FaUsers className="w-3 h-3" />
                        <span>{task.applicationCount || 0} applications</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <FaUser className="w-3 h-3" />
                        <span>{task.customer?.fullName}</span>
                      </div>
                    )}
                    
                    <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium group-hover:translate-x-1 transition-all duration-200">
                      <FaEye className="w-3 h-3" />
                      <span>{userRole === 'customer' ? 'View' : 'Manage'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTasks; 