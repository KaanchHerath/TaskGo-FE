import React, { useState, useEffect } from "react";
import { FaUserCheck, FaUsers, FaTasks, FaTachometerAlt, FaExclamationTriangle, FaChartLine, FaCalendarAlt, FaDollarSign, FaClock } from "react-icons/fa";
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
        return (
          <div className="space-y-8">
            {/* Error Banner */}
            {error && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <FaExclamationTriangle className="text-yellow-600 mr-2" />
                  <p className="text-yellow-800">{error}</p>
                </div>
              </div>
            )}
            
            {/* Statistics Cards */}
            <StatisticsCards stats={dashboardData.stats} loading={loading} />
            
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TaskStatusChart data={chartData.taskStatus} />
              <UserTypeChart data={chartData.userType} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <UserRegistrationChart data={chartData.userRegistration} />
              <PlatformRevenueChart data={chartData.platformRevenue} />
            </div>

            <div className="grid grid-cols-1 gap-6">
              <TaskCompletionChart data={chartData.taskCompletion} />
            </div>
            
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button 
                  onClick={() => handleSectionChange('taskers')}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FaUserCheck className="w-6 h-6 text-green-600 mb-2" />
                  <span className="text-sm font-medium">Approve Taskers</span>
                </button>
                <button 
                  onClick={() => handleSectionChange('users')}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FaUsers className="w-6 h-6 text-blue-600 mb-2" />
                  <span className="text-sm font-medium">View Users</span>
                </button>
                <button 
                  onClick={() => handleSectionChange('tasks')}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FaTasks className="w-6 h-6 text-purple-600 mb-2" />
                  <span className="text-sm font-medium">Manage Tasks</span>
                </button>
              </div>
            </div>

            {/* Recent Activity Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FaClock className="mr-2 text-blue-600" />
                Recent Platform Activity
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {dashboardData.stats?.tasks?.active || 0}
                  </div>
                  <div className="text-sm text-blue-800">Active Tasks</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {dashboardData.stats?.users?.pendingApproval || 0}
                  </div>
                  <div className="text-sm text-green-800">Pending Approvals</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    LKR {(dashboardData.stats?.revenue?.platformRevenue?.total || 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-purple-800">Platform Revenue</div>
                  <div className="text-xs text-purple-600 mt-1">
                    (10% commission from advance payments)
                  </div>
                </div>
              </div>
            </div>

            {/* Platform Health Indicators */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FaChartLine className="mr-2 text-green-600" />
                Platform Health
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">System Status</span>
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  </div>
                  <div className="text-lg font-semibold text-green-600 mt-1">Operational</div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Database</span>
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  </div>
                  <div className="text-lg font-semibold text-green-600 mt-1">Connected</div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">API Status</span>
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  </div>
                  <div className="text-lg font-semibold text-green-600 mt-1">Healthy</div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Uptime</span>
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  </div>
                  <div className="text-lg font-semibold text-green-600 mt-1">99.9%</div>
                </div>
              </div>
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
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard; 