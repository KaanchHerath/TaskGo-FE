import React, { useState, useEffect } from "react";
import { 
  FaUserCheck, 
  FaUsers, 
  FaTasks, 
  FaTachometerAlt, 
  FaExclamationTriangle, 
  FaChartLine, 
  FaCalendarAlt, 
  FaDollarSign, 
  FaClock,
  FaBuilding,
  FaUserPlus,
  FaCheckCircle,
  FaEnvelope,
  FaFileContract,
  FaAddressBook,
  FaChartBar,
  FaBell,
  FaFileAlt,
  FaUser,
  FaGem
} from "react-icons/fa";
import { 
  getDashboardStats, 
  getTaskStats, 
  getUserStats, 
  getPaymentStats, 
  getRecentActivity 
} from "../../services/api/adminService";
import { StatisticsCards } from "../../components/admin/StatisticsCards";
import { 
  TaskStatusChart, 
  UserRegistrationChart, 
  RevenueChart, 
  TaskCompletionChart, 
  UserTypeChart,
  PlatformRevenueChart 
} from "../../components/admin/ChartComponents";
import UserManagementPage from "./UserManagementPage";
import TaskManagementPage from "./TaskManagementPage";
import TaskerApproval from "./TaskerApproval";
import { useLocation, useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {},
    taskStats: {},
    userStats: {},
    paymentStats: {},
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Handle route-based navigation from main navbar
  useEffect(() => {
    const path = location.pathname;
    if (path === '/admin' || path === '/admin/dashboard') {
      setActiveSection('dashboard');
    } else if (path === '/admin/taskers') {
      setActiveSection('taskers');
    } else if (path === '/admin/tasks') {
      setActiveSection('tasks');
    } else if (path === '/admin/users') {
      setActiveSection('users');
    }
  }, [location.pathname]);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all dashboard data in parallel
      const [stats, taskStats, userStats, paymentStats, recentActivity] = await Promise.all([
        getDashboardStats(),
        getTaskStats(),
        getUserStats(),
        getPaymentStats(),
        getRecentActivity(10)
      ]);

      setDashboardData({
        stats: stats || {},
        taskStats: taskStats || {},
        userStats: userStats || {},
        paymentStats: paymentStats || {},
        recentActivity: recentActivity || []
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data. Some features may not work properly.");
      // Set default stats to prevent complete failure
      setDashboardData({ 
        stats: {
          users: { total: 0, active: 0, approved: 0, pendingApproval: 0 },
          tasks: { active: 0, completed: 0 },
          revenue: { total: 0 }
        },
        taskStats: {},
        userStats: {},
        paymentStats: {},
        recentActivity: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Navigation items
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FaTachometerAlt, path: '/admin' },
    { id: 'taskers', label: 'Taskers', icon: FaUserCheck, path: '/admin/taskers' },
    { id: 'tasks', label: 'Tasks', icon: FaTasks, path: '/admin/tasks' },
    { id: 'users', label: 'Users', icon: FaUsers, path: '/admin/users' }
  ];

  // Sidebar navigation items
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FaTachometerAlt, path: '/admin' },
    { id: 'taskers', label: 'Tasker Management', icon: FaUserCheck, path: '/admin/taskers' },
    { id: 'tasks', label: 'Task Management', icon: FaTasks, path: '/admin/tasks' },
    { id: 'users', label: 'User Management', icon: FaUsers, path: '/admin/users' }
  ];

  // Handle section change and update URL
  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    // Update URL for proper routing
    const path = navigationItems.find(item => item.id === sectionId)?.path || '/admin';
    navigate(path);
  };

  // Prepare chart data from backend
  const prepareChartData = () => {
    const { stats, taskStats, userStats, paymentStats } = dashboardData;
    
    return {
      taskStatus: {
        labels: ['Active', 'In Progress', 'Completed', 'Cancelled', 'Scheduled'],
        values: [
          stats?.tasks?.active || 0,
          stats?.tasks?.inProgress || 0,
          stats?.tasks?.completed || 0,
          stats?.tasks?.cancelled || 0,
          stats?.tasks?.scheduled || 0
        ]
      },
      userRegistration: {
        labels: userStats?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        values: userStats?.values || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      },
      revenue: {
        labels: paymentStats?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        values: paymentStats?.values || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      },
      taskCompletion: {
        labels: taskStats?.trendLabels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        completed: taskStats?.completedTrend || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        total: taskStats?.totalTrend || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      },
      userType: [
        stats?.users?.customers || 0,
        stats?.users?.taskers || 0,
        stats?.users?.admins || 0
      ],
      platformRevenue: {
        labels: paymentStats?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        values: paymentStats?.platformRevenueValues || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      }
    };
  };

  // Render content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        const chartData = prepareChartData();
        const { stats } = dashboardData;
        
        return (
          <div className="space-y-8">
            {/* Error Banner */}
            {error && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                <div className="flex items-center">
                  <FaExclamationTriangle className="text-amber-600 mr-3 text-xl" />
                  <p className="text-amber-800 text-lg font-medium">{error}</p>
                </div>
              </div>
            )}
            
            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Total Revenue Card */}
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-emerald-100 rounded-2xl">
                    <FaCheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-800 mb-2">
                  LKR {(stats?.revenue?.platformRevenue?.total || 0).toLocaleString()}
                </div>
                <div className="text-sm font-medium text-slate-600">TOTAL REVENUE</div>
              </div>

              {/* Total Taskers Card */}
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-2xl">
                    <FaUserCheck className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-800 mb-2">
                  {stats?.users?.taskers || 0}
                </div>
                <div className="text-sm font-medium text-slate-600">TOTAL TASKERS</div>
              </div>

              {/* Total Customers Card */}
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-2xl">
                    <FaUsers className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-800 mb-2">
                  {stats?.users?.customers || 0}
                </div>
                <div className="text-sm font-medium text-slate-600">TOTAL CUSTOMERS</div>
              </div>

              {/* Task Status Overview Card */}
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-slate-100">
                <div className="mb-4">
                  <div className="text-lg font-bold text-slate-800 mb-4">TASK STATUS OVERVIEW</div>
                  
                  {/* Task Status Breakdown */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 font-medium">Active</span>
                      <span className="font-bold text-amber-600">{stats?.tasks?.active || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 font-medium">Scheduled</span>
                      <span className="font-bold text-blue-600">{stats?.tasks?.scheduled || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 font-medium">Completed</span>
                      <span className="font-bold text-emerald-600">{stats?.tasks?.completed || 0}</span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div className="flex h-3 rounded-full overflow-hidden">
                      <div 
                        className="bg-amber-500 h-3 transition-all duration-500"
                        style={{ width: `${stats?.tasks?.total > 0 ? (stats?.tasks?.active / stats?.tasks?.total) * 100 : 0}%` }}
                      ></div>
                      <div 
                        className="bg-blue-500 h-3 transition-all duration-500"
                        style={{ width: `${stats?.tasks?.total > 0 ? (stats?.tasks?.scheduled / stats?.tasks?.total) * 100 : 0}%` }}
                      ></div>
                      <div 
                        className="bg-emerald-500 h-3 transition-all duration-500"
                        style={{ width: `${stats?.tasks?.total > 0 ? (stats?.tasks?.completed / stats?.tasks?.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <TaskStatusChart data={chartData.taskStatus} />
              <UserTypeChart data={chartData.userType} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <UserRegistrationChart data={chartData.userRegistration} />
              <PlatformRevenueChart data={chartData.platformRevenue} />
            </div>

            <div className="grid grid-cols-1 gap-8">
              <TaskCompletionChart data={chartData.taskCompletion} />
            </div>
          </div>
        );

      case 'taskers':
        return <TaskerApproval />;
      case 'tasks':
        return <TaskManagementPage />;
      case 'users':
        return <UserManagementPage />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="flex">
        {/* Left Sidebar - Fixed Position */}
        <div className={`fixed left-0 top-0 h-screen bg-white border-r border-slate-200 transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'} shadow-lg z-40`}>
          {/* Sidebar Header with Toggle */}
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <h2 className="text-lg font-bold text-slate-800">Admin Panel</h2>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200"
                title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                <FaChartLine className={`w-4 h-4 text-slate-600 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Main Navigation */}
          <nav className="p-6 flex-1">
            <div className="mb-6">
              <h3 className={`text-xs font-semibold text-slate-400 uppercase tracking-wider ${sidebarCollapsed ? 'text-center' : 'mb-4'}`}>
                {sidebarCollapsed ? 'Menu' : 'Main Navigation'}
              </h3>
            </div>
            
            <ul className="space-y-2">
              {sidebarItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleSectionChange(item.id)}
                    className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl text-left transition-all duration-300 group relative ${
                      activeSection === item.id
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200 shadow-lg'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800 hover:shadow-md'
                    }`}
                  >
                    {/* Active indicator */}
                    {activeSection === item.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 to-purple-600 rounded-r-full"></div>
                    )}
                    
                    <div className={`p-3 rounded-xl transition-all duration-300 ${
                      activeSection === item.id
                        ? 'bg-gradient-to-br from-blue-100 to-purple-100 text-blue-600 shadow-md'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-600 group-hover:shadow-sm'
                    }`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    
                    {!sidebarCollapsed && (
                      <>
                        <span className={`font-semibold transition-all duration-300 ${
                          activeSection === item.id ? 'text-blue-700' : 'text-slate-700'
                        }`}>
                          {item.label}
                        </span>
                        {item.hasDropdown && (
                          <FaChartLine className="w-4 h-4 ml-auto text-slate-400 group-hover:text-slate-600 transition-colors duration-300" />
                        )}
                      </>
                    )}
                  </button>
                </li>
              ))}
            </ul>

            {/* Quick Stats Section */}
            {!sidebarCollapsed && (
              <div className="mt-10 p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border border-slate-200 shadow-md">
                <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center">
                  <FaChartLine className="w-4 h-4 mr-2 text-blue-600" />
                  Quick Stats
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 font-medium">Active Tasks</span>
                    <span className="font-bold text-blue-600 text-lg">{dashboardData.stats?.tasks?.active || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 font-medium">Pending Approvals</span>
                    <span className="font-bold text-amber-600 text-lg">{dashboardData.stats?.users?.pendingApproval || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 font-medium">Total Users</span>
                    <span className="font-bold text-green-600 text-lg">{dashboardData.stats?.users?.total || 0}</span>
                  </div>
                </div>
              </div>
            )}
          </nav>
        </div>

        {/* Main Content - With left margin to account for fixed sidebar */}
        <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <div className="max-w-7xl mx-auto px-8 py-10">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 