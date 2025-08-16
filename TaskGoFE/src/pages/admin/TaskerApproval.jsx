import React, { useState, useEffect } from 'react';
import { 
  FaUsers, 
  FaClock, 
  FaCheck, 
  FaTimes, 
  FaFilter,
  FaDownload,
  FaChartBar,
  FaBell
} from 'react-icons/fa';
import PendingTaskers from '../../components/admin/PendingTaskers';
import TaskerList from '../../components/admin/TaskerList';
import { getApprovalStatsAdmin } from '../../services/api/adminService';

const TaskerApproval = () => {
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  // Fetch approval statistics
  const fetchApprovalStats = async () => {
    try {
      setLoading(true);
      const data = await getApprovalStatsAdmin();
      const s = data?.stats || {};
      setStats({
        pending: s.pending || 0,
        approved: s.approved || 0,
        rejected: s.rejected || 0,
        total: s.total || 0,
      });
    } catch (error) {
      console.error('Error fetching approval stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovalStats();
  }, []);

  const tabs = [
    { id: 'pending', label: 'Pending', count: stats.pending, icon: FaClock, color: 'text-yellow-600' },
    { id: 'approved', label: 'Approved', count: stats.approved, icon: FaCheck, color: 'text-green-600' },
    { id: 'rejected', label: 'Rejected', count: stats.rejected, icon: FaTimes, color: 'text-red-600' },
    { id: 'all', label: 'All Applications', count: stats.total, icon: FaUsers, color: 'text-blue-600' }
  ];

  const StatCard = ({ title, value, icon: Icon, color, loading }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          {/* Replace <p> with <div> to avoid invalid nesting */}
          <div className={`text-2xl font-bold ${color} mt-1`}>
            {loading ? (
              <div className="animate-pulse bg-gray-300 h-8 w-16 rounded"></div>
            ) : (
              value.toLocaleString()
            )}
          </div>
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
              <h1 className="text-3xl font-bold text-gray-900">Tasker Approval Management</h1>
              <p className="text-gray-600 mt-1">Review and manage tasker applications</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <FaDownload className="w-4 h-4" />
                <span>Export Data</span>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Pending Approvals"
            value={stats.pending}
            icon={FaClock}
            color="text-yellow-600"
            loading={loading}
          />
          <StatCard
            title="Approved Taskers"
            value={stats.approved}
            icon={FaCheck}
            color="text-green-600"
            loading={loading}
          />
          <StatCard
            title="Rejected Applications"
            value={stats.rejected}
            icon={FaTimes}
            color="text-red-600"
            loading={loading}
          />
          <StatCard
            title="Total Applications"
            value={stats.total}
            icon={FaUsers}
            color="text-blue-600"
            loading={loading}
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
            {activeTab === 'pending' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Pending Tasker Approvals</h2>
                    <p className="text-gray-600 mt-1">
                      Review and approve tasker applications
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
                <PendingTaskers />
              </div>
            )}

            {activeTab === 'approved' && (
              <TaskerList status="approved" />
            )}

            {activeTab === 'rejected' && (
              <TaskerList status="rejected" />
            )}

            {activeTab === 'all' && (
              <TaskerList status="all" />
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaUsers className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Bulk Approve</p>
                <p className="text-sm text-gray-600">Approve multiple taskers at once</p>
              </div>
            </button>
            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaDownload className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Export Report</p>
                <p className="text-sm text-gray-600">Download approval statistics</p>
              </div>
            </button>
            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FaChartBar className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Analytics</p>
                <p className="text-sm text-gray-600">View approval trends and insights</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskerApproval; 