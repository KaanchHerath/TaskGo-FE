import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaSearch, FaStar, FaMapMarkerAlt, FaClock, FaCheck, FaSpinner, FaEye, FaUsers, FaTasks, FaDollarSign, FaChartLine, FaTools, FaWrench, FaBroom, FaCog, FaPlug, FaHammer, FaLeaf, FaTree, FaUser, FaCalendar } from "react-icons/fa";
import homeImage from '../../assets/homeimage.png';
import { taskService } from '../../services/api/taskService';
import FeaturedTaskers from '../../components/tasker/FeaturedTaskers';

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

const CustomerHeroSection = ({ userName }) => (
  <section className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 py-12 px-4 md:px-24 relative overflow-hidden">
    {/* Decorative Background Elements */}
    <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>
    <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-3xl"></div>
    <div className="absolute top-20 right-20 w-48 h-48 bg-indigo-200/20 rounded-full blur-3xl"></div>
    <div className="absolute bottom-10 left-1/4 w-24 h-24 bg-purple-200/20 rounded-full blur-2xl"></div>
    
    {/* Subtle Pattern Overlay */}
    <div className="absolute inset-0 opacity-5" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
    }}></div>
    
    <div className="flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto relative z-10">
      {/* Left side content */}
      <div className="w-full md:w-1/2 text-left mb-10 md:mb-0 pr-0 md:pr-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Welcome back,
          </span>
          <br />
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {userName}!
          </span>
        </h1>
        <p className="text-slate-600 mb-8 max-w-lg text-lg leading-relaxed">
          Post your task and get quotes from verified taskers in your area. 
          From home repairs to personal assistance, we've got you covered.
        </p>
        
        {/* Quick Search */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg border border-white/20">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                className="bg-white/80 border-0 pl-12 pr-4 py-4 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-700 placeholder-slate-400"
                placeholder="What do you need help with?"
              />
            </div>
            <div className="relative flex-grow">
              <FaMapMarkerAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                className="bg-white/80 border-0 pl-12 pr-4 py-4 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-700 placeholder-slate-400"
                placeholder="Your Location"
              />
            </div>
            <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg">
              Find Taskers
            </button>
          </div>
          <div className="mt-4 text-sm text-slate-500">
            <span className="font-medium">Popular: </span>
            <span className="text-blue-600 hover:text-blue-700 cursor-pointer">Cleaning, </span>
            <span className="text-blue-600 hover:text-blue-700 cursor-pointer">Repairs, </span>
            <span className="text-blue-600 hover:text-blue-700 cursor-pointer">Handyman, </span>
            <span className="text-blue-600 hover:text-blue-700 cursor-pointer">Gardening</span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            to="/post-task" 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center font-semibold shadow-lg transform hover:scale-105"
          >
            <FaPlus className="mr-2" />
            Post a Task
          </Link>
          <Link 
            to="/tasks" 
            className="bg-white/70 backdrop-blur-sm border-2 border-blue-600/30 text-blue-600 px-8 py-4 rounded-xl hover:bg-white/90 hover:border-blue-600/50 transition-all duration-300 flex items-center justify-center font-semibold shadow-lg"
          >
            <FaTasks className="mr-2" />
            Browse Tasks
          </Link>
        </div>
      </div>

      {/* Right side image */}
      <div className="w-full md:w-1/2 flex justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-3xl blur-3xl"></div>
          <img 
            src={homeImage} 
            alt="Customer Dashboard" 
            className="max-w-md w-full relative z-10 drop-shadow-2xl"
          />
        </div>
      </div>
    </div>
  </section>
);

const QuickStats = () => {
  const [stats, setStats] = useState({
    activeTasks: 0,
    completedTasks: 0,
    totalSpent: 0,
    savedMoney: 0,
    loading: true
  });
  const [currentUserId, setCurrentUserId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get current user ID from token
    const token = localStorage.getItem('token');
    if (token) {
      const payload = parseJwt(token);
      if (payload && payload.userId) {
        setCurrentUserId(payload.userId);
      } else {
        // Try different possible field names
        const userId = payload?.id || payload?._id || payload?.sub;
        if (userId) {
          setCurrentUserId(userId);
        } else {
          setError('Unable to get user information from token');
          setStats(prev => ({ ...prev, loading: false }));
        }
      }
    } else {
      setError('No authentication token found');
      setStats(prev => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      if (!currentUserId) return;
      
      try {
        setError(null);
        // Use the new getTasksByCustomerId API to get all tasks
        const response = await taskService.getTasksByCustomerId(currentUserId, {
          page: 1,
          limit: 100 // Get a large number to capture all tasks for stats
        });
        
        const tasksData = response.data;
        const activeTasks = tasksData.filter(task => 
          ['active', 'scheduled'].includes(task.status)
        ).length;
        const completedTasks = tasksData.filter(task => 
          task.status === 'completed'
        ).length;
        const totalSpent = tasksData
          .filter(task => task.status === 'completed' && task.agreedPayment)
          .reduce((sum, task) => sum + task.agreedPayment, 0);
        
        setStats({
          activeTasks,
          completedTasks,
          totalSpent,
          savedMoney: Math.round(totalSpent * 0.15), // Estimated 15% savings
          loading: false
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError('Failed to load statistics');
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, [currentUserId]);

  if (stats.loading) {
    return (
      <section className="py-10 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 relative">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 right-10 w-20 h-20 bg-blue-300 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 left-10 w-16 h-16 bg-indigo-300 rounded-full blur-xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <h2 className="text-3xl font-bold mb-8 text-center">
            <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Your Activity Overview
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 animate-pulse">
                <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl mb-4"></div>
                <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg mb-2"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 relative">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-10 right-10 w-20 h-20 bg-blue-300 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 left-10 w-16 h-16 bg-indigo-300 rounded-full blur-xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <h2 className="text-3xl font-bold mb-8 text-center">
          <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Your Activity Overview
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <FaTasks className="text-xl text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  {stats.activeTasks}
                </div>
              </div>
            </div>
            <div className="text-slate-700 font-semibold">Active Tasks</div>
            <div className="text-sm text-blue-600 mt-1 font-medium">In Progress</div>
          </div>
          
          <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg">
                <FaCheck className="text-xl text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                  {stats.completedTasks}
                </div>
              </div>
            </div>
            <div className="text-slate-700 font-semibold">Completed</div>
            <div className="text-sm text-green-600 mt-1 font-medium">Successfully Done</div>
          </div>
          
          <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <FaDollarSign className="text-xl text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                  LKR {stats.totalSpent?.toLocaleString()}
                </div>
              </div>
            </div>
            <div className="text-slate-700 font-semibold">Total Spent</div>
            <div className="text-sm text-purple-600 mt-1 font-medium">This Month</div>
          </div>
          
          <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg">
                <FaChartLine className="text-xl text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                  LKR {stats.savedMoney?.toLocaleString()}
                </div>
              </div>
            </div>
            <div className="text-slate-700 font-semibold">Money Saved</div>
            <div className="text-sm text-orange-600 mt-1 font-medium">Vs Market Rate</div>
          </div>
        </div>
      </div>
    </section>
  );
};

const QuickActions = () => {
  const quickActions = [
    { 
      title: "Post New Task", 
      description: "Get help with your tasks", 
      icon: <FaPlus className="text-2xl" />, 
      color: "from-blue-500 to-blue-600",
      link: "/post-task"
    },
    { 
      title: "Browse Tasks", 
      description: "Find available tasks", 
      icon: <FaSearch className="text-2xl" />, 
      color: "from-green-500 to-green-600",
      link: "/tasks"
    },
    { 
      title: "Find Taskers", 
      description: "Hire skilled professionals", 
      icon: <FaUsers className="text-2xl" />, 
      color: "from-purple-500 to-purple-600",
      link: "/taskers"
    },
    { 
      title: "My Profile", 
      description: "Manage your account", 
      icon: <FaUser className="text-2xl" />, 
      color: "from-orange-500 to-orange-600",
      link: "/profile"
    }
  ];

  return (
    <section className="py-8 bg-gradient-to-r from-slate-100/50 to-blue-100/30 relative">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Cpath d='M0 0h20v20H0z'/%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link 
              key={index}
              to={action.link}
              className="group bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-md border border-white/30 hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 bg-gradient-to-r ${action.color} rounded-lg shadow-lg`}>
                  <div className="text-white">
                    {action.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-slate-600">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

const RecentTasks = () => {
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    // Get current user ID from token
    const token = localStorage.getItem('token');
    if (token) {
      const payload = parseJwt(token);
      if (payload && payload.userId) {
        setCurrentUserId(payload.userId);
      } else {
        // Try different possible field names
        const userId = payload?.id || payload?._id || payload?.sub;
        if (userId) {
          setCurrentUserId(userId);
        } else {
          setError('Unable to get user information from token');
          setLoading(false);
        }
      }
    } else {
      setError('No authentication token found');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchRecentTasks = async () => {
      if (!currentUserId) return;
      
      try {
        setError(null);
        // Use the new getTasksByCustomerId API
        const response = await taskService.getTasksByCustomerId(currentUserId, {
          page: 1,
          limit: 3
        });
        
        // Transform the response data to match the expected format
        const recentTasksData = response.data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map(task => ({
            id: task._id,
            title: task.title,
            tasker: task.selectedTasker?.fullName || 'Not assigned',
            status: task.status,
            amount: task.agreedPayment || task.maxPayment,
            date: task.createdAt,
            rating: task.customerRating || null,
            category: task.category,
            area: task.area
          }));
        
        setRecentTasks(recentTasksData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching recent tasks:', error);
        setError('Failed to load recent tasks. Please try again later.');
        setLoading(false);
      }
    };

    fetchRecentTasks();
  }, [currentUserId]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheck className="text-green-500" />;
      case 'scheduled':
        return <FaSpinner className="text-blue-500 animate-spin" />;
      case 'active':
        return <FaClock className="text-orange-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'scheduled':
        return 'In Progress';
      case 'active':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'scheduled':
        return 'text-blue-600 bg-blue-50';
      case 'active':
        return 'text-orange-600 bg-orange-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <section className="py-10 bg-white relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <h2 className="text-3xl font-bold mb-8">
            <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Recent Tasks
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 animate-pulse">
                <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl mb-6"></div>
                <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg mb-4"></div>
                <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg mb-4"></div>
                <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 bg-white relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Recent Tasks
            </span>
          </h2>
          <Link 
            to="/tasks" 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold flex items-center shadow-lg transform hover:scale-105"
          >
            View All Tasks <FaEye className="ml-2" />
          </Link>
        </div>
        
        {recentTasks.length === 0 ? (
          <div className="text-center py-10">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaTasks className="text-3xl text-white" />
              </div>
              {error ? (
                <>
                  <h3 className="text-2xl font-bold text-red-600 mb-4">Error Loading Tasks</h3>
                  <p className="text-slate-600 mb-8">{error}</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 inline-flex items-center font-semibold shadow-lg transform hover:scale-105"
                  >
                    Try Again
                  </button>
                </>
              ) : (
                <>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">No tasks found</h3>
              <p className="text-slate-600 mb-8">Start by posting your first task and connect with skilled taskers!</p>
              <Link 
                to="/post-task"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 inline-flex items-center font-semibold shadow-lg transform hover:scale-105"
              >
                <FaPlus className="mr-2" />
                Post Your First Task
              </Link>
                </>
              )}
            </div>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentTasks.map(task => (
            <div key={task.id} className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="flex justify-between items-start mb-6">
                <h3 className="font-bold text-xl text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {task.title}
                </h3>
                <div className="flex items-center ml-4">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                    {getStatusIcon(task.status)}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {task.category && (
                  <div className="flex items-center text-slate-600">
                    <FaTasks className="text-blue-500 mr-3" />
                    <span className="font-medium">{task.category}</span>
                  </div>
                )}
                
                {task.area && (
                  <div className="flex items-center text-slate-600">
                    <FaMapMarkerAlt className="text-blue-500 mr-3" />
                    <span className="font-medium">{task.area}</span>
                  </div>
                )}
                
                <div className="flex items-center text-slate-600">
                  <FaUser className="text-blue-500 mr-3" />
                  <span className="font-medium">Tasker: {task.tasker}</span>
                </div>
                
                <div className="flex items-center text-slate-600">
                  <FaCalendar className="text-blue-500 mr-3" />
                  <span>{new Date(task.date).toLocaleDateString()}</span>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <span className={`px-4 py-2 rounded-xl text-sm font-semibold ${getStatusColor(task.status)} border`}>
                    {getStatusText(task.status)}
                  </span>
                  <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                    LKR {task.amount?.toLocaleString()}
                  </div>
                </div>
                
                {task.rating && (
                  <div className="flex items-center justify-center pt-4">
                    <div className="flex text-yellow-400 mr-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <FaStar key={star} className={star <= task.rating ? 'text-yellow-400' : 'text-slate-300'} />
                      ))}
                    </div>
                    <span className="text-sm text-slate-600 font-medium">({task.rating}/5)</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </section>
  );
};



const PopularCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Define category metadata with icons and colors
  const categoryMetadata = {
    'Cleaning': { title: "Cleaning Services", icon: <FaBroom className="w-8 h-8" />, color: "from-purple-500 to-purple-600" },
    'Repairing': { title: "Repairs", icon: <FaWrench className="w-8 h-8" />, color: "from-green-500 to-green-600" },
    'Handyman': { title: "Handyman Services", icon: <FaHammer className="w-8 h-8" />, color: "from-indigo-500 to-indigo-600" },
    'Maintenance': { title: "Home Maintenance", icon: <FaTools className="w-8 h-8" />, color: "from-blue-500 to-blue-600" },
    'Gardening': { title: "Gardening", icon: <FaLeaf className="w-8 h-8" />, color: "from-emerald-500 to-emerald-600" },
    'Landscaping': { title: "Landscaping", icon: <FaTree className="w-8 h-8" />, color: "from-teal-500 to-teal-600" },
    'Installations': { title: "Installations", icon: <FaPlug className="w-8 h-8" />, color: "from-red-500 to-red-600" },
    'Security': { title: "Security Services", icon: <FaCog className="w-8 h-8" />, color: "from-orange-500 to-orange-600" }
  };

  useEffect(() => {
    const fetchCategoryStats = async () => {
      try {
        setLoading(true);
        const response = await taskService.getCategoryStats();
        
        // Filter and map the categories we want to display
        const displayCategories = ['Cleaning', 'Repairing', 'Handyman', 'Maintenance', 
                                   'Gardening', 'Landscaping', 'Installations', 'Security'];
        
        const categoriesWithMetadata = displayCategories.map(categoryName => {
          const categoryData = response.data.find(cat => cat.category === categoryName);
          const count = categoryData ? categoryData.count : 0;
          const metadata = categoryMetadata[categoryName];
          
          return {
            title: metadata.title,
            tasks: `${count} Open Tasks`,
            count: count,
            icon: metadata.icon,
            color: metadata.color
          };
        });
        
        setCategories(categoriesWithMetadata);
      } catch (err) {
        console.error('Error fetching category stats:', err);
        
        // Fallback to static data if API fails
        const fallbackCategories = Object.keys(categoryMetadata).map(categoryName => {
          const metadata = categoryMetadata[categoryName];
          return {
            title: metadata.title,
            tasks: "0 Open Tasks",
            count: 0,
            icon: metadata.icon,
            color: metadata.color
          };
        });
        setCategories(fallbackCategories);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryStats();
  }, []);

  return (
    <section className="py-10 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 relative">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-5 left-5 w-16 h-16 bg-blue-300 rounded-full blur-xl"></div>
        <div className="absolute bottom-5 right-5 w-20 h-20 bg-indigo-300 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/3 w-12 h-12 bg-purple-300 rounded-full blur-lg"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Popular Categories
            </span>
          </h2>
          <Link 
            to="/categories" 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold flex items-center shadow-lg transform hover:scale-105"
          >
            View All Categories
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 animate-pulse">
                <div className="w-16 h-16 bg-gray-300 rounded-xl mb-6"></div>
                <div className="h-6 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <div key={index} className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
                <div className={`p-4 bg-gradient-to-r ${category.color} rounded-xl shadow-lg mb-6 w-fit`}>
                  <div className="text-white">
                    {category.icon}
                  </div>
                </div>
                <h3 className="font-bold text-xl text-slate-800 group-hover:text-blue-600 transition-colors mb-2">
                  {category.title}
                </h3>
                <p className="text-slate-600 font-medium">{category.tasks}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const CustomerDashboard = () => {
  const [userName, setUserName] = useState('');
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = parseJwt(token);
      if (payload) {
        setUserName(payload.fullName || payload.name || payload.email?.split('@')[0] || 'Customer');
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <main>
        <CustomerHeroSection userName={userName} />
        <QuickStats />
        <QuickActions />
        <RecentTasks />
        <PopularCategories />
        <FeaturedTaskers />
      </main>
    </div>
  );
};

export default CustomerDashboard; 