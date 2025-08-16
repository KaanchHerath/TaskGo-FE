import React, { useState, useEffect } from 'react';
import { 
  FaUsers, 
  FaUserCheck, 
  FaUserSlash, 
  FaUserTimes, 
  FaFilter,
  FaDownload,
  FaChartBar,
  FaBell,
  FaSearch,
  FaEye,
  FaTrash,
  FaUserCog,
  FaInfoCircle
} from 'react-icons/fa';
import UserManagement from '../../components/admin/UserManagement';
import { getUsers } from '../../services/api/adminService';

const UserManagementPage = () => {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    suspended: 0,
    pending: 0,
    customers: 0,
    taskers: 0,
    admins: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Fetch user statistics
  const fetchUserStats = async () => {
    try {
      setLoading(true);
      const response = await getUsers({ limit: 1 }); // Just to get counts
      
      // In a real implementation, you'd have separate endpoints for these stats
      // For now, we'll simulate the data
      const total = response.total || 0;
      setStats({
        total,
        active: Math.floor(total * 0.8),
        suspended: Math.floor(total * 0.1),
        pending: Math.floor(total * 0.1),
        customers: Math.floor(total * 0.6),
        taskers: Math.floor(total * 0.35),
        admins: Math.floor(total * 0.05)
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserStats();
  }, []);

  const tabs = [
    { id: 'all', label: 'All Users', count: stats.total, icon: FaUsers, color: 'text-blue-600' },
    { id: 'active', label: 'Active', count: stats.active, icon: FaUserCheck, color: 'text-green-600' },
    { id: 'suspended', label: 'Suspended', count: stats.suspended, icon: FaUserSlash, color: 'text-red-600' },
    { id: 'pending', label: 'Pending', count: stats.pending, icon: FaUserTimes, color: 'text-yellow-600' }
  ];

  const StatCard = ({ title, value, icon: Icon, color, loading, subtitle }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className={`text-2xl font-bold ${color} mt-1`}>
            {loading ? (
              <div className="animate-pulse bg-gray-300 h-8 w-16 rounded"></div>
            ) : (
              value.toLocaleString()
            )}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          <Icon className={`text-2xl ${color}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-1">Manage and monitor all platform users</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <FaDownload className="w-4 h-4" />
                <span>Export Users</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <FaBell className="w-4 h-4" />
                <span>Notifications</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.total}
            icon={FaUsers}
            color="text-blue-600"
            loading={loading}
            subtitle="All registered users"
          />
          <StatCard
            title="Active Users"
            value={stats.active}
            icon={FaUserCheck}
            color="text-green-600"
            loading={loading}
            subtitle="Currently active"
          />
          <StatCard
            title="Suspended Users"
            value={stats.suspended}
            icon={FaUserSlash}
            color="text-red-600"
            loading={loading}
            subtitle="Temporarily suspended"
          />
          <StatCard
            title="Pending Users"
            value={stats.pending}
            icon={FaUserTimes}
            color="text-yellow-600"
            loading={loading}
            subtitle="Awaiting approval"
          />
        </div>

        {/* User Type Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Customers"
            value={stats.customers}
            icon={FaUsers}
            color="text-blue-600"
            loading={loading}
            subtitle="Service requesters"
          />
          <StatCard
            title="Taskers"
            value={stats.taskers}
            icon={FaUserCog}
            color="text-green-600"
            loading={loading}
            subtitle="Service providers"
          />
          <StatCard
            title="Admins"
            value={stats.admins}
            icon={FaUserCheck}
            color="text-purple-600"
            loading={loading}
            subtitle="Platform administrators"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'all' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">All Users</h2>
                    <p className="text-gray-600 mt-1">
                      Manage all users across the platform
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      <FaFilter className="w-4 h-4" />
                      <span>Advanced Filters</span>
                    </button>
                    <button className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <FaChartBar className="w-4 h-4" />
                      <span>View Analytics</span>
                    </button>
                  </div>
                </div>
                <UserManagement />
              </div>
            )}

            {activeTab === 'active' && (
              <div className="text-center py-12">
                <FaUserCheck className="mx-auto h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Active Users</h3>
                <p className="text-gray-600">
                  This section will show all active users with their details and activity metrics.
                </p>
                <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  View Active Users
                </button>
              </div>
            )}

            {activeTab === 'suspended' && (
              <div className="text-center py-12">
                <FaUserSlash className="mx-auto h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Suspended Users</h3>
                <p className="text-gray-600">
                  This section will show all suspended users with suspension reasons and unsuspension options.
                </p>
                <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  View Suspended Users
                </button>
              </div>
            )}

            {activeTab === 'pending' && (
              <div className="text-center py-12">
                <FaUserTimes className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Pending Users</h3>
                <p className="text-gray-600">
                  This section will show all pending users awaiting approval or verification.
                </p>
                <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  View Pending Users
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaSearch className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Bulk Actions</p>
                <p className="text-sm text-gray-600">Suspend or delete multiple users</p>
              </div>
            </button>
            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaDownload className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Export Report</p>
                <p className="text-sm text-gray-600">Download user statistics</p>
              </div>
            </button>
            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FaChartBar className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">User Analytics</p>
                <p className="text-sm text-gray-600">View user trends and insights</p>
              </div>
            </button>
          </div>
        </div>

        {/* User Management Tips */}
        <div className="bg-blue-50 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
            <FaInfoCircle className="w-5 h-5 mr-2" />
            User Management Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">Suspending Users</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Always provide a clear reason for suspension</li>
                <li>Consider temporary suspensions before permanent deletion</li>
                <li>Notify users of suspension via email</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Deleting Users</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Deletion is permanent and cannot be undone</li>
                <li>Ensure all user data is properly backed up</li>
                <li>Consider legal implications before deletion</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage; 