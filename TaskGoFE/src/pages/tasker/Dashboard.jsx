import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaTasks, FaDollarSign, FaStar, FaMapMarkerAlt, FaClock, FaCheck, FaSpinner, FaEye, FaUser, FaCalendar, FaPlus, FaUsers, FaChartLine, FaAward, FaThumbsUp } from "react-icons/fa";
import homeImage from '../../assets/homeimage.png';
import { taskService } from '../../services/api/taskService';
import { getUserProfile } from '../../services/api/userService';
import { useJobs } from '../../hooks/useJobs';
import AvailableTaskCard from '../../components/task/AvailableTaskCard';
import { dashboardCategories, generateCategoriesWithMetadata } from '../../config/categories';
import { taskerActions } from '../../config/dashboardActions';
import { APP_CONFIG } from '../../config/appConfig';

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

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        const [applicationsResponse, tasksResponse] = await Promise.all([
          taskService.getTaskerApplications(),
          taskService.getTaskerTasks()
        ]);
        
        // Extract data from responses (handle both direct arrays and {data: [...]} structures)
        const applications = Array.isArray(applicationsResponse) ? applicationsResponse : (applicationsResponse?.data || []);
        const tasks = Array.isArray(tasksResponse) ? tasksResponse : (tasksResponse?.data || []);
        
        // Combine and sort activities
        const allActivities = [
          ...applications.map(app => ({
            id: app._id,
            type: 'application',
            title: app.task?.title || 'Task Application',
            description: `Applied for ${app.task?.title || 'a task'}`,
            date: app.createdAt,
            status: app.status,
            amount: app.proposedPayment,
            taskId: app.task?._id
          })),
          ...tasks.map(task => ({
            id: task._id,
            type: 'task',
            title: task.title,
            description: task.description,
            date: task.updatedAt,
            status: task.status,
            amount: task.agreedPayment,
            taskId: task._id
          }))
        ]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 6);
        
        setActivities(allActivities);
      } catch (error) {
        console.error('Error fetching recent activity:', error);
        setError('Failed to load recent activity');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivity();
  }, []);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <FaClock className="text-yellow-500" />;
      case 'accepted': return <FaCheck className="text-green-500" />;
      case 'completed': return <FaCheck className="text-green-500" />;
      case 'active': return <FaSpinner className="text-blue-500" />;
      case 'scheduled': return <FaCalendar className="text-blue-500" />;
      default: return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'pending': return 'Pending';
      case 'accepted': return 'Accepted';
      case 'completed': return 'Completed';
      case 'active': return 'Active';
      case 'scheduled': return 'Scheduled';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">
            <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Recent Activity
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
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
            <h2 className="text-3xl font-bold mb-4 text-red-600">Error Loading Activity</h2>
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
              Recent Activity
            </span>
          </h2>
          <Link 
            to="/tasker/activities" 
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-semibold flex items-center shadow-lg transform hover:scale-105"
          >
            View All Activity
            <FaEye className="ml-2" />
          </Link>
        </div>
        
        {activities.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
              <FaTasks className="text-6xl text-slate-400 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No Activity Yet</h3>
              <p className="text-slate-600 mb-6">Start by browsing available tasks!</p>
              <Link 
                to="/browse-jobs" 
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-semibold inline-flex items-center shadow-lg"
              >
                <FaSearch className="mr-2" />
                Browse Tasks
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((activity) => (
              <div key={activity.id} className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg text-slate-800 group-hover:text-green-600 transition-colors line-clamp-2">
                    {activity.title}
                  </h3>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)} flex items-center gap-1`}>
                    {getStatusIcon(activity.status)}
                    {getStatusText(activity.status)}
                  </div>
                </div>
                
                <p className="text-slate-600 text-sm mb-4 line-clamp-3">{activity.description}</p>
                
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-slate-500">
                    {new Date(activity.date).toLocaleDateString()}
                  </div>
                  {activity.amount && (
                    <div className="text-lg font-bold text-green-600">
                      ${activity.amount}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-sm text-slate-500 capitalize">
                    {activity.type}
                  </div>
                  <Link 
                    to={`/task/${activity.taskId}`} 
                    className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center"
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

const AvailableTasks = () => {
  const { jobs, loading, error } = useJobs();
  const [savedTasks, setSavedTasks] = useState([]);

  const handleTaskClick = (taskId) => {
    // Navigate to task details or handle task selection
  };

  const toggleSaveTask = (taskId, e) => {
    e.stopPropagation();
    setSavedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <section className="py-12 bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">
            <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Available Tasks
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
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
      <section className="py-12 bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/20">
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
    <section className="py-12 bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Available Tasks
            </span>
          </h2>
          <Link 
            to="/browse-jobs" 
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-semibold flex items-center shadow-lg transform hover:scale-105"
          >
            Browse All Tasks
            <FaSearch className="ml-2" />
          </Link>
        </div>
        
        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
              <FaTasks className="text-6xl text-slate-400 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No Available Tasks</h3>
              <p className="text-slate-600 mb-6">Check back later for new opportunities!</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.slice(0, 6).map((job) => (
              <AvailableTaskCard 
                key={job._id} 
                task={job}
                onTaskClick={handleTaskClick}
                onSaveTask={toggleSaveTask}
                isSaved={savedTasks.includes(job._id)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const TaskerDashboard = () => {
  const [userName, setUserName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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
            setIsLoggedIn(true);
            
            // Fetch user profile to get the actual name
            const userProfile = await getUserProfile();
            const fullName = userProfile.fullName || userProfile.name || 'Tasker';
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
            const fallbackName = payload.name || payload.username || payload.fullName || 'Tasker';
            const displayName = fallbackName.split(' ')[0]; // Get only the first name
            setUserName(displayName);
            setIsLoggedIn(true);
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
    title: isLoggedIn ? "Welcome back," : "Find Tasks and",
    subtitle: isLoggedIn ? `${userName}!` : "Start Earning Today",
    description: isLoggedIn 
      ? "Browse available tasks in your area and showcase your skills. Build your reputation and grow your business with TaskGo."
      : "Join thousands of skilled professionals earning money by helping others complete their tasks.",
    showSearch: !isLoggedIn,
    searchPlaceholder: "What tasks can you do?",
    primaryButton: {
      text: "Browse Tasks",
      to: "/browse-jobs",
      icon: <FaSearch />
    },
    secondaryButton: isLoggedIn ? {
      text: "Update Profile",
      to: "/tasker/profile",
      icon: <FaUser />
    } : {
      text: "Join as Tasker",
      to: "/signup/tasker",
      icon: <FaPlus />
    },
    image: homeImage,
    imageAlt: "Tasker Dashboard",
    colorScheme: "green"
  };

  // Stats configuration for tasker dashboard
  const statsConfig = {
    title: "Your Performance Overview",
    stats: [
      {
        title: "This Month",
        key: "thisMonth",
        icon: <FaDollarSign className="text-2xl text-white" />,
        color: "from-green-500 to-green-600",
        description: "Earnings this month",
        fallbackValue: 0
      },
      {
        title: "Total Earnings",
        key: "totalEarnings",
        icon: <FaChartLine className="text-2xl text-white" />,
        color: "from-blue-500 to-blue-600",
        description: "All time earnings",
        fallbackValue: 0
      },
      {
        title: "Completed Tasks",
        key: "completedTasks",
        icon: <FaCheck className="text-2xl text-white" />,
        color: "from-purple-500 to-purple-600",
        description: "Successfully finished",
        fallbackValue: 0
      },
      {
        title: "Average Rating",
        key: "averageRating",
        icon: <FaStar className="text-2xl text-white" />,
        color: "from-orange-500 to-orange-600",
        description: "Customer satisfaction",
        fallbackValue: 0
      }
    ],
                apiEndpoint: currentUserId ? `${APP_CONFIG.API.BASE_URL}/api/stats/tasker/${currentUserId}` : null,
    fallbackStats: {
      thisMonth: 0,
      totalEarnings: 0,
      completedTasks: 0,
      averageRating: 0
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
        {isLoggedIn && <StatsSection {...statsConfig} />}

        {isLoggedIn && <RecentActivity />}
        <AvailableTasks />
        <CategoriesGrid 
          title="Popular Categories"
          description="Discover the most in-demand services"
          apiEndpoint={getCategoryStats}
          fallbackCategories={fallbackCategories}
          showViewAll={true}
          viewAllLink="/categories"
          colorScheme="green"
          maxCategories={4}
        />
      </main>
    </div>
  );
};

export default TaskerDashboard; 