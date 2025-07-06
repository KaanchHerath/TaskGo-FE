import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaSearch, FaStar, FaMapMarkerAlt, FaClock, FaCheck, FaSpinner, FaEye, FaUsers, FaTasks, FaDollarSign, FaChartLine, FaUser, FaCalendar } from "react-icons/fa";
import homeImage from '../../assets/homeimage.png';
import { taskService } from '../../services/api/taskService';
import { getUserProfile } from '../../services/api/userService';
import FeaturedTaskers from '../../components/tasker/FeaturedTaskers';
import { dashboardCategories, generateCategoriesWithMetadata } from '../../config/categories';
import { customerActions } from '../../config/dashboardActions';

// Import reusable components
import HeroSection from '../../components/common/HeroSection';
import StatsSection from '../../components/common/StatsSection';
import CategoriesGrid from '../../components/common/CategoriesGrid';

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

const RecentTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = parseJwt(token);
      if (payload && payload.userId) {
        setCurrentUserId(payload.userId);
      } else {
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
        const response = await taskService.getTasksByCustomerId(currentUserId, {
          page: 1,
          limit: 4
        });
        setTasks(response.data);
      } catch (error) {
        console.error('Error fetching recent tasks:', error);
        setError('Failed to load recent tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentTasks();
  }, [currentUserId]);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'active': return <FaClock className="text-yellow-500" />;
      case 'completed': return <FaCheck className="text-green-500" />;
      case 'scheduled': return <FaCalendar className="text-blue-500" />;
      default: return <FaSpinner className="text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'active': return 'Active';
      case 'completed': return 'Completed';
      case 'scheduled': return 'Scheduled';
      default: return 'Pending';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Recent Tasks
              </span>
            </h2>
            <Link 
              to="/my-tasks" 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold flex items-center shadow-lg transform hover:scale-105"
            >
              View All Tasks
              <FaEye className="ml-2" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 animate-pulse">
                <div className="h-6 bg-gray-300 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="h-8 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4 text-red-600">Error Loading Tasks</h2>
            <p className="text-slate-600">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Recent Tasks
            </span>
          </h2>
          <Link 
            to="/my-tasks" 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold flex items-center shadow-lg transform hover:scale-105"
          >
            View All Tasks
            <FaEye className="ml-2" />
          </Link>
        </div>
        
        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
              <FaTasks className="text-6xl text-slate-400 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No Tasks Yet</h3>
              <p className="text-slate-600 mb-6">Get started by posting your first task!</p>
              <Link 
                to="/post-task" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold inline-flex items-center shadow-lg"
              >
                <FaPlus className="mr-2" />
                Post Your First Task
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tasks.map((task) => (
              <div key={task._id} className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {task.title}
                  </h3>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)} flex items-center gap-1`}>
                    {getStatusIcon(task.status)}
                    {getStatusText(task.status)}
                  </div>
                </div>
                
                <p className="text-slate-600 text-sm mb-4 line-clamp-3">{task.description}</p>
                
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center text-sm text-slate-500">
                    <FaMapMarkerAlt className="mr-1" />
                    {task.location}
                  </div>
                  <div className="text-lg font-bold text-green-600">
                    ${task.budget || task.agreedPayment || 0}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-sm text-slate-500">
                    {task.applications?.length || 0} applications
                  </div>
                  <Link 
                    to={`/task/${task._id}`} 
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
                  >
                    View Details
                    <FaEye className="ml-1" />
                  </Link>
                </div>
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
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const payload = parseJwt(token);
          if (payload) {
            setCurrentUserId(payload.userId || payload.id || payload._id || payload.sub);
            
            // Fetch user profile to get the actual name
            const userProfile = await getUserProfile();
            const fullName = userProfile.fullName || userProfile.name || 'Customer';
            const displayName = fullName.split(' ')[0]; // Get only the first name
            setUserName(displayName);
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Fallback to JWT token data if profile fetch fails
        const token = localStorage.getItem('token');
        if (token) {
          const payload = parseJwt(token);
          if (payload) {
            const fallbackName = payload.name || payload.username || 'Customer';
            const displayName = fallbackName.split(' ')[0]; // Get only the first name
            setUserName(displayName);
            setCurrentUserId(payload.userId || payload.id || payload._id || payload.sub);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Hero section configuration
  const heroConfig = {
    title: "Welcome back,",
    subtitle: `${userName}!`,
    description: "Post your task and get quotes from verified taskers in your area. From home repairs to personal assistance, we've got you covered.",
    primaryButton: {
      text: "Post a Task",
      to: "/post-task",
      icon: <FaPlus />
    },
    secondaryButton: {
      text: "Browse Tasks",
      to: "/tasks",
      icon: <FaTasks />
    },
    image: homeImage,
    imageAlt: "Customer Dashboard",
    colorScheme: "blue"
  };

  // Stats configuration for customer dashboard
  const statsConfig = {
    title: "Your Activity Overview",
    stats: [
      {
        title: "Active Tasks",
        key: "activeTasks",
        icon: <FaTasks className="text-2xl text-white" />,
        color: "from-blue-500 to-blue-600",
        description: "Currently in progress",
        fallbackValue: 0
      },
      {
        title: "Completed Tasks",
        key: "completedTasks",
        icon: <FaCheck className="text-2xl text-white" />,
        color: "from-green-500 to-green-600",
        description: "Successfully finished",
        fallbackValue: 0
      },
      {
        title: "Total Spent",
        key: "totalSpent",
        icon: <FaDollarSign className="text-2xl text-white" />,
        color: "from-purple-500 to-purple-600",
        description: "On completed tasks",
        fallbackValue: 0
      },
      {
        title: "Money Saved",
        key: "savedMoney",
        icon: <FaChartLine className="text-2xl text-white" />,
        color: "from-orange-500 to-orange-600",
        description: "Estimated savings",
        fallbackValue: 0
      }
    ],
    apiEndpoint: currentUserId ? `http://localhost:5000/api/stats/customer/${currentUserId}` : null,
    fallbackStats: {
      activeTasks: 0,
      completedTasks: 0,
      totalSpent: 0,
      savedMoney: 0
    }
  };

  // Memoize fallback categories to prevent infinite re-renders
  const fallbackCategories = useMemo(() => generateCategoriesWithMetadata(dashboardCategories), []);
  
  // Memoize the getCategoryStats function
  const getCategoryStats = taskService.useCategoryStats();

  return (
    <div className="min-h-screen bg-white">
      <main>
        <HeroSection {...heroConfig} />
        <StatsSection {...statsConfig} />
        <RecentTasks />
        <CategoriesGrid 
          title="Popular Categories"
          description="Discover the most in-demand services"
          apiEndpoint={getCategoryStats}
          fallbackCategories={fallbackCategories}
          showViewAll={true}
          viewAllLink="/categories"
          maxCategories={4}
        />
        <FeaturedTaskers />
      </main>
    </div>
  );
};

export default CustomerDashboard; 