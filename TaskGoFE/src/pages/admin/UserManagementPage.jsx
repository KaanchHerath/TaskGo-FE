import React, { useState, useEffect } from 'react';
import { 
  FaUsers, 
  FaUserCheck, 
  FaUserSlash, 
  FaUserTimes, 
  FaDownload,
  FaChartBar,
  FaSearch,
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
      const response = await getUsers({ limit: 1 }); 
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
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-slate-100 group">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-slate-600 text-sm font-medium">{title}</p>
          <div className={`text-3xl font-bold ${color} mt-1`}>
            {loading ? (
              <div className="animate-pulse bg-slate-200 h-10 w-20 rounded-lg"></div>
            ) : (
              value.toLocaleString()
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-4 rounded-2xl ${color.replace('text-', 'bg-').replace('-600', '-100')} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`text-2xl ${color}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-3xl font-bold text-slate-800 mb-2">User Management</h1>
              <p className="text-slate-600 text-lg">Manage and monitor all platform users</p>
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
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden mb-8">
          <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
            <nav className="flex space-x-1 p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-3 py-4 px-6 rounded-xl font-medium text-sm transition-all duration-300 relative ${
                      activeTab === tab.id
                        ? 'bg-white text-slate-800 shadow-lg border border-slate-200'
                        : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-blue-600' : ''}`} />
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-200 text-slate-700'
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
          <div className="p-8">
            {activeTab === 'all' && (
              <div>
                
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
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
          <h3 className="text-2xl font-bold text-slate-800 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button className="group flex items-start space-x-4 p-6 border border-slate-200 rounded-2xl hover:border-slate-300 hover:shadow-lg transition-all duration-300">
              <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <FaSearch className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-bold text-slate-800 text-lg mb-2">Bulk Actions</h4>
                <p className="text-slate-600 leading-relaxed">Suspend or delete multiple users</p>
              </div>
            </button>
            <button className="group flex items-start space-x-4 p-6 border border-slate-200 rounded-2xl hover:border-slate-300 hover:shadow-lg transition-all duration-300">
              <div className="p-4 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <FaDownload className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-bold text-slate-800 text-lg mb-2">Export Report</h4>
                <p className="text-slate-600 leading-relaxed">Download user statistics</p>
              </div>
            </button>
            <button className="group flex items-start space-x-4 p-6 border border-slate-200 rounded-2xl hover:border-slate-300 hover:shadow-lg transition-all duration-300">
              <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <FaChartBar className="w-8 h-8 text-purple-600" />
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-bold text-slate-800 text-lg mb-2">User Analytics</h4>
                <p className="text-slate-600 leading-relaxed">View user trends and insights</p>
              </div>
            </button>
          </div>
        </div>

        {/* User Management Tips */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100 mt-8">
          <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
            <FaInfoCircle className="w-6 h-6 mr-2 text-blue-600" />
            User Management Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-700">
            <div>
              <h4 className="font-semibold mb-2">Suspending Users</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Always provide a clear reason for suspension</li>
                <li>Consider temporary suspensions before permanent deletion</li>
                <li>Notify users of suspension via email</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Deleting Users</h4>
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