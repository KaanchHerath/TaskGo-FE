import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaSearch, FaStar, FaMapMarkerAlt, FaClock, FaCheck, FaSpinner, FaEye, FaUsers, FaTasks, FaDollarSign, FaChartLine, FaUser, FaCalendar } from "react-icons/fa";
import homeImage from '../../assets/homeimage.png';
import { taskService } from '../../services/api/taskService';
import { getUserProfile } from '../../services/api/userService';
import FeaturedTaskers from '../../components/tasker/FeaturedTaskers';
import { dashboardCategories, generateCategoriesWithMetadata } from '../../config/categories';
import { parseJwt, getToken, getCachedUserName, setCachedUserName } from '../../utils/auth';
import { customerActions } from '../../config/dashboardActions';

// Import reusable components
import HeroSection from '../../components/common/HeroSection';
import StatsSection from '../../components/common/StatsSection';
import CategoriesGrid from '../../components/common/CategoriesGrid';
import RecentReviews from '../../components/common/RecentReviews';
import { getMyRecentTasks } from '../../services/api/taskService';

 

const RecentTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const token = getToken();
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
        const response = await getMyRecentTasks(4);
        setTasks(response.data || []);
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
      <section className="py-12 bg-transparent">
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
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30 animate-pulse">
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
      <section className="py-12 bg-transparent">
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
    <section className="py-10 bg-transparent">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Recent Tasks
            </span>
          </h2>
          <Link 
            to="/my-tasks" 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold flex items-center shadow-lg"
          >
            View All Tasks
            <FaEye className="ml-2" />
          </Link>
        </div>
        
        {tasks.length === 0 ? (
          <div className="text-center py-10">
            <div className="bg-white/60 backdrop-blur-sm rounded-[2rem] p-6 shadow-lg border border-white/30">
              <FaTasks className="text-6xl text-slate-400 mb-4 mx-auto" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No Tasks Yet</h3>
              <p className="text-slate-600 mb-6">Get started by posting your first task!</p>
              <Link 
                to="/post-task" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold inline-flex items-center shadow-lg"
              >
                <FaPlus className="mr-2" />
                Post Your First Task
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white/60 backdrop-blur-sm rounded-[2.5rem] p-6 shadow-lg border border-white/30">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {tasks.map((task) => (
                <div key={task._id} className="group bg-white/60 backdrop-blur-sm rounded-2xl p-5 shadow-md border border-white/30 hover:shadow-xl transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-base text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {task.title}
                    </h3>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)} flex items-center gap-1`}>
                      {getStatusIcon(task.status)}
                      {getStatusText(task.status)}
                    </div>
                  </div>
                  
                  <p className="text-slate-600 text-sm mb-3 line-clamp-3">{task.description}</p>
                  
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
                      {task.applicationCount || 0} applications
                    </div>
                    <Link 
                      to={`/tasks/${task._id}`} 
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
                    >
                      View Details
                      <FaEye className="ml-1" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
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
        const token = getToken();
        if (token) {
          const payload = parseJwt(token);
          if (payload) {
            setCurrentUserId(payload.userId || payload.id || payload._id || payload.sub);

            // Use cached name if available; otherwise fetch and cache
            const cached = getCachedUserName();
            if (cached) {
              setUserName(cached);
            } else {
              const userProfile = await getUserProfile();
              const fullName = userProfile.fullName || userProfile.name || 'Customer';
              const displayName = fullName.split(' ')[0];
              setUserName(displayName);
              setCachedUserName(displayName);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Fallback to JWT token data if profile fetch fails
        const token = getToken();
        if (token) {
          const payload = parseJwt(token);
          if (payload) {
            const fallbackName = payload.name || payload.username || 'Customer';
            const displayName = fallbackName.split(' ')[0];
            setUserName(displayName);
            setCachedUserName(displayName);
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
    title: "Welcome Back,",
    subtitle: `${userName}!`,
    description: "Post your task and get quotes from verified taskers in your area. From home repairs to personal assistance, we've got you covered.",
    primaryButton: {
      text: "Post a Task",
      to: "/post-task",
      icon: <FaPlus />
    },
    secondaryButton: {
      text: "Browse Taskers",
      to: "/taskers",
      icon: <FaTasks />
    },
    image: homeImage,
    imageAlt: "Customer Dashboard",
    colorScheme: "lightBlue",
    transparent: true,
    headingSize: 'text-5xl md:text-7xl lg:text-8xl mb-4'
  };

  // Stats configuration for customer dashboard
  const statsConfig = useMemo(() => ({
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
        title: "Scheduled Tasks",
        key: "scheduledTasks",
        icon: <FaCalendar className="text-2xl text-white" />,
        color: "from-orange-500 to-orange-600",
        description: "Upcoming appointments",
        fallbackValue: 0
      }
    ],
    apiEndpoint: currentUserId ? `/stats/customer/${currentUserId}` : null,
    fallbackStats: {
      activeTasks: 0,
      completedTasks: 0,
      totalSpent: 0,
      scheduledTasks: 0
    }
  }), [currentUserId]);

  // Memoize fallback categories to prevent infinite re-renders
  const fallbackCategories = useMemo(() => generateCategoriesWithMetadata(dashboardCategories), []);
  
  // Memoize the getCategoryStats function
  const getCategoryStats = taskService.useCategoryStats();

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-sky-100 via-blue-200 to-indigo-200">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-tr from-sky-400/40 via-blue-500/30 to-indigo-500/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-24 w-[32rem] h-[32rem] bg-gradient-to-tr from-indigo-400/30 via-blue-400/30 to-sky-300/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-6rem] left-1/3 w-[28rem] h-[28rem] bg-gradient-to-tr from-sky-300/40 to-blue-400/30 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
      <main className="relative z-10">
        <HeroSection {...heroConfig} density="compact" />
        <StatsSection {...statsConfig} density="compact" transparent pill pillSize="lg" />
        <RecentTasks />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <RecentReviews 
            title="Recent Community Reviews"
            limit={6}
            className="mb-6"
            density="compact"
            cardStyle="compact"
            transparent
            pill
            pillSize="sm"
          />
        </div>
        <CategoriesGrid 
          title="Popular Categories"
          description="Discover the most in-demand services"
          apiEndpoint={getCategoryStats}
          fallbackCategories={fallbackCategories}
          showViewAll={true}
          viewAllLink="/categories"
          maxCategories={4}
          density="compact"
          transparent
          pill
          pillSize="md"
        />
        <FeaturedTaskers transparent pill pillSize="lg" />
      </main>
    </div>
  );
};

export default CustomerDashboard; 
 