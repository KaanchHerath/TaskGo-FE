import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaTasks, FaDollarSign, FaStar, FaMapMarkerAlt, FaClock, FaCheck, FaSpinner, FaEye, FaUser, FaCalendar, FaPlus, FaUsers, FaChartLine, FaTools, FaWrench, FaBroom, FaCog, FaPlug, FaHammer, FaLeaf, FaTree, FaAward, FaThumbsUp } from "react-icons/fa";
import homeImage from '../../assets/homeimage.png';
import { taskService } from '../../services/api/taskService';
import { useJobs } from '../../hooks/useJobs';
import AvailableTaskCard from '../../components/task/AvailableTaskCard';
import StatsSection from '../../components/home/StatsSection';
import CategoriesSection from '../../components/home/CategoriesSection';
import HowItWorks from '../../components/home/HowItWorks';
import TestimonialsSection from '../../components/home/TestimonialsSection';

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

const TaskerHeroSection = ({ userName }) => (
  <section className="bg-gradient-to-br from-emerald-50 via-green-50/30 to-teal-50/20 py-12 px-4 md:px-24 relative overflow-hidden">
    {/* Decorative Background Elements */}
    <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>
    <div className="absolute top-10 left-10 w-32 h-32 bg-green-200/20 rounded-full blur-3xl"></div>
    <div className="absolute top-20 right-20 w-48 h-48 bg-emerald-200/20 rounded-full blur-3xl"></div>
    <div className="absolute bottom-10 left-1/4 w-24 h-24 bg-teal-200/20 rounded-full blur-2xl"></div>
    
    {/* Subtle Pattern Overlay */}
    <div className="absolute inset-0 opacity-5" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
    }}></div>
    
    <div className="flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto relative z-10">
      {/* Left side content */}
      <div className="w-full md:w-1/2 text-left mb-10 md:mb-0 pr-0 md:pr-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          {userName ? (
            <>
              <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Welcome back,
              </span>
              <br />
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {userName}!
              </span>
            </>
          ) : (
            <>
              <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Find Tasks and
              </span>
              <br />
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Start Earning Today
              </span>
            </>
          )}
        </h1>
        <p className="text-slate-600 mb-8 max-w-lg text-lg leading-relaxed">
          {userName 
            ? 'Browse available tasks in your area and showcase your skills. Build your reputation and grow your business with TaskGo.'
            : 'Join thousands of skilled professionals earning money by helping others complete their tasks.'
          }
        </p>
        
        {userName ? (
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              to="/browse-jobs" 
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center font-semibold shadow-lg transform hover:scale-105"
            >
              <FaSearch className="mr-2" />
              Browse Tasks
            </Link>
            <Link 
              to="/tasker/profile" 
              className="bg-white/70 backdrop-blur-sm border-2 border-green-600/30 text-green-600 px-8 py-4 rounded-xl hover:bg-white/90 hover:border-green-600/50 transition-all duration-300 flex items-center justify-center font-semibold shadow-lg"
            >
              <FaUser className="mr-2" />
              Update Profile
            </Link>
          </div>
        ) : (
          <>
            {/* Quick Search */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg border border-white/20">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    className="bg-white/80 border-0 pl-12 pr-4 py-4 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 text-slate-700 placeholder-slate-400"
                    placeholder="What tasks can you do?"
                  />
                </div>
                <div className="relative flex-grow">
                  <FaMapMarkerAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    className="bg-white/80 border-0 pl-12 pr-4 py-4 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 text-slate-700 placeholder-slate-400"
                    placeholder="Your Location"
                  />
                </div>
                <button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg">
                  Find Tasks
                </button>
              </div>
              <div className="mt-4 text-sm text-slate-500">
                <span className="font-medium">Popular: </span>
                <span className="text-green-600 hover:text-green-700 cursor-pointer">Plumbing, </span>
                <span className="text-green-600 hover:text-green-700 cursor-pointer">Cleaning, </span>
                <span className="text-green-600 hover:text-green-700 cursor-pointer">Handyman, </span>
                <span className="text-green-600 hover:text-green-700 cursor-pointer">Gardening</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/browse-jobs" 
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center font-semibold shadow-lg transform hover:scale-105"
              >
                <FaSearch className="mr-2" />
                Browse Tasks
              </Link>
              <Link 
                to="/signup/tasker" 
                className="bg-white/70 backdrop-blur-sm border-2 border-green-600/30 text-green-600 px-8 py-4 rounded-xl hover:bg-white/90 hover:border-green-600/50 transition-all duration-300 flex items-center justify-center font-semibold shadow-lg"
              >
                <FaPlus className="mr-2" />
                Join as Tasker
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Right side image */}
      <div className="w-full md:w-1/2 flex justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-3xl blur-3xl"></div>
          <img 
            src={homeImage} 
            alt="Tasker Dashboard" 
            className="max-w-md w-full relative z-10 drop-shadow-2xl"
          />
        </div>
      </div>
    </div>
  </section>
);

const EarningsStats = () => {
  const [stats, setStats] = useState({
    thisMonth: 0,
    totalEarnings: 0,
    completedTasks: 0,
    averageRating: 0,
    activeApplications: 0,
    loading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch tasker's tasks and applications
        const [tasks, applications] = await Promise.all([
          taskService.getTaskerTasks(),
          taskService.getTaskerApplications()
        ]);
        
        const completedTasks = tasks.filter(task => task.status === 'completed').length;
        const totalEarnings = tasks
          .filter(task => task.status === 'completed' && task.agreedPayment)
          .reduce((sum, task) => sum + task.agreedPayment, 0);
        
        // Calculate this month's earnings
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const thisMonth = tasks
          .filter(task => {
            const taskDate = new Date(task.updatedAt);
            return task.status === 'completed' && 
                   taskDate.getMonth() === currentMonth && 
                   taskDate.getFullYear() === currentYear;
          })
          .reduce((sum, task) => sum + (task.agreedPayment || 0), 0);
        
        // Calculate average rating
        const ratedTasks = tasks.filter(task => task.rating > 0);
        const averageRating = ratedTasks.length > 0 
          ? ratedTasks.reduce((sum, task) => sum + task.rating, 0) / ratedTasks.length
          : 0;
        
        const activeApplications = applications.filter(app => app.status === 'pending').length;
        
        setStats({
          thisMonth,
          totalEarnings,
          completedTasks,
          averageRating: Math.round(averageRating * 10) / 10,
          activeApplications,
          loading: false
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, []);

  if (stats.loading) {
    return (
      <section className="py-10 bg-gradient-to-br from-emerald-50 via-green-50/30 to-teal-50/20 relative">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 right-10 w-20 h-20 bg-green-300 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 left-10 w-16 h-16 bg-emerald-300 rounded-full blur-xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <h2 className="text-3xl font-bold mb-8 text-center">
            <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Your Performance Overview
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 animate-pulse">
                <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl mb-3"></div>
                <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg mb-2"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 bg-gradient-to-br from-emerald-50 via-green-50/30 to-teal-50/20 relative">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-10 right-10 w-20 h-20 bg-green-300 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 left-10 w-16 h-16 bg-emerald-300 rounded-full blur-xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <h2 className="text-3xl font-bold mb-8 text-center">
          <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Your Performance Overview
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg">
                <FaDollarSign className="text-xl text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                  ${stats.thisMonth}
                </div>
              </div>
            </div>
            <div className="text-slate-700 font-semibold">This Month</div>
            <div className="text-sm text-green-600 mt-1 font-medium">Current month</div>
          </div>
          
          <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <FaChartLine className="text-xl text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  ${stats.totalEarnings}
                </div>
              </div>
            </div>
            <div className="text-slate-700 font-semibold">Total Earned</div>
            <div className="text-sm text-blue-600 mt-1 font-medium">All time</div>
          </div>
          
          <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <FaCheck className="text-xl text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                  {stats.completedTasks}
                </div>
              </div>
            </div>
            <div className="text-slate-700 font-semibold">Tasks Done</div>
            <div className="text-sm text-purple-600 mt-1 font-medium">Successfully completed</div>
          </div>
          
          <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl shadow-lg">
                <FaStar className="text-xl text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent">
                  {stats.averageRating}
                </div>
              </div>
            </div>
            <div className="text-slate-700 font-semibold">Avg Rating</div>
            <div className="text-sm text-yellow-600 mt-1 font-medium">Based on reviews</div>
          </div>
          
          <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg">
                <FaClock className="text-xl text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                  {stats.activeApplications}
                </div>
              </div>
            </div>
            <div className="text-slate-700 font-semibold">Applications</div>
            <div className="text-sm text-orange-600 mt-1 font-medium">Pending response</div>
          </div>
        </div>
      </div>
    </section>
  );
};

const TaskerQuickActions = () => {
  const quickActions = [
    { 
      title: "Browse Tasks", 
      description: "Find new opportunities", 
      icon: <FaSearch className="text-2xl" />, 
      color: "from-green-500 to-green-600",
      link: "/browse-jobs"
    },
    { 
      title: "My Applications", 
      description: "Track your applications", 
      icon: <FaClock className="text-2xl" />, 
      color: "from-blue-500 to-blue-600",
      link: "/applications"
    },
    { 
      title: "Update Profile", 
      description: "Enhance your profile", 
      icon: <FaUser className="text-2xl" />, 
      color: "from-purple-500 to-purple-600",
      link: "/tasker/profile"
    },
    { 
      title: "Earnings Report", 
      description: "View your earnings", 
      icon: <FaChartLine className="text-2xl" />, 
      color: "from-orange-500 to-orange-600",
      link: "/earnings"
    }
  ];

  return (
    <section className="py-8 bg-gradient-to-r from-emerald-100/50 to-green-100/30 relative">
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
                  <h3 className="font-semibold text-slate-800 group-hover:text-green-600 transition-colors">
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

const RecentActivity = () => {
  const [recentActivity, setRecentActivity] = useState([
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        const [tasks, applications] = await Promise.all([
          taskService.getTaskerTasks(),
          taskService.getTaskerApplications()
        ]);
        
        // Combine tasks and applications
        const allActivity = [
          ...tasks.map(task => ({
            id: task._id,
            title: task.title,
            client: task.customer?.name || 'Unknown Client',
            status: task.status,
            amount: task.agreedPayment || task.maxPayment,
            date: task.updatedAt,
            rating: task.rating || null,
            type: 'task'
          })),
          ...applications.map(app => ({
            id: app._id,
            title: app.task?.title || 'Task Application',
            client: app.task?.customer?.name || 'Unknown Client',
            status: app.status === 'pending' ? 'applied' : app.status,
            amount: app.proposedPayment,
            date: app.createdAt,
            rating: null,
            type: 'application'
          }))
        ];
        
        // Sort by date and get the 3 most recent
        const recentActivity = allActivity
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 3);
        
        setRecentActivity(recentActivity);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching recent activity:', error);
        setLoading(false);
      }
    };

    fetchRecentActivity();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheck className="text-green-500" />;
      case 'scheduled':
        return <FaSpinner className="text-blue-500 animate-spin" />;
      case 'applied':
      case 'pending':
        return <FaClock className="text-orange-500" />;
      case 'active':
        return <FaClock className="text-blue-500" />;
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
      case 'applied':
      case 'pending':
        return 'Applied';
      case 'active':
        return 'Active';
      case 'confirmed':
        return 'Confirmed';
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
      case 'applied':
      case 'pending':
        return 'text-orange-600 bg-orange-50';
      case 'active':
        return 'text-blue-600 bg-blue-50';
      case 'confirmed':
        return 'text-green-600 bg-green-50';
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
              Recent Activity
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
              Recent Activity
            </span>
          </h2>
          <Link 
            to="/tasks" 
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-semibold flex items-center shadow-lg transform hover:scale-105"
          >
            View All Activity <FaEye className="ml-2" />
          </Link>
        </div>
        
        {recentActivity.length === 0 ? (
          <div className="text-center py-10">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaTasks className="text-3xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">No recent activity</h3>
              <p className="text-slate-600 mb-8">Start by browsing and applying for tasks to build your reputation!</p>
              <Link 
                to="/browse-jobs"
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 inline-flex items-center font-semibold shadow-lg transform hover:scale-105"
              >
                <FaSearch className="mr-2" />
                Browse Tasks
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentActivity.map(activity => (
              <div key={activity.id} className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="font-bold text-xl text-slate-800 group-hover:text-green-600 transition-colors line-clamp-2">
                    {activity.title}
                  </h3>
                  <div className="flex items-center ml-4">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                      {getStatusIcon(activity.status)}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center text-slate-600">
                    <FaUser className="text-green-500 mr-3" />
                    <span className="font-medium">Client: {activity.client}</span>
                  </div>
                  
                  <div className="flex items-center text-slate-600">
                    <FaCalendar className="text-green-500 mr-3" />
                    <span>{new Date(activity.date).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <span className={`px-4 py-2 rounded-xl text-sm font-semibold ${getStatusColor(activity.status)} border`}>
                      {getStatusText(activity.status)}
                    </span>
                    <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                      ${activity.amount}
                    </div>
                  </div>
                  
                  {activity.rating && (
                    <div className="flex items-center justify-center pt-4">
                      <span className="text-sm text-slate-600 mr-2 font-medium">Client Rating:</span>
                      <div className="flex text-yellow-400 mr-2">
                        {[...Array(5)].map((_, i) => (
                          <FaStar 
                            key={i} 
                            className={i < activity.rating ? "text-yellow-400" : "text-slate-300"} 
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center pt-2">
                    <span className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                      activity.type === 'task' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200' : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200'
                    }`}>
                      {activity.type === 'task' ? 'Completed Task' : 'Application'}
                    </span>
                  </div>
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
  const { jobs, loading } = useJobs({
    limit: 6,
    status: 'active'
  });
  const [savedTasks, setSavedTasks] = useState(new Set());

  const handleTaskClick = (taskId) => {
    window.location.href = `/task/${taskId}`;
  };

  const toggleSaveTask = (taskId, e) => {
    e.stopPropagation();
    setSavedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} weeks ago`;
  };

  return (
    <section className="py-10 bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/20 relative">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-20 right-20 w-32 h-32 bg-green-300 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-emerald-300 rounded-full blur-2xl"></div>
      </div>
      
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M40 40c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm20 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
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
            Browse All Tasks <FaSearch className="ml-2" />
          </Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200"></div>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent absolute top-0"></div>
            </div>
          </div>
        ) : jobs && jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.slice(0, 6).map((task) => (
              <AvailableTaskCard
                key={task._id}
                task={task}
                onTaskClick={handleTaskClick}
                onSaveTask={toggleSaveTask}
                savedTasks={savedTasks}
                formatDate={formatDate}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                <FaSearch className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">No tasks available</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Check back later for new opportunities or try browsing all tasks.
              </p>
              <Link
                to="/browse-jobs"
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg transform hover:scale-105"
              >
                Browse All Tasks
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

const TaskerDashboard = () => {
  const [userName, setUserName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      const payload = parseJwt(token);
      if (payload) {
        setUserName(payload.fullName || payload.name || payload.email?.split('@')[0] || 'Tasker');
      }
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <main>
        <TaskerHeroSection userName={userName} />
        {isLoggedIn ? (
          <>
            <EarningsStats />
            <TaskerQuickActions />
            <RecentActivity />
            <AvailableTasks />
          </>
        ) : (
          <>
            <StatsSection />
            <CategoriesSection />
            <HowItWorks />
            <TestimonialsSection />
          </>
        )}
      </main>
    </div>
  );
};

export default TaskerDashboard; 