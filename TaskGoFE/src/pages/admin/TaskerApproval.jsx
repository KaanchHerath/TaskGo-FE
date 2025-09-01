import React, { useState, useEffect } from 'react';
import { 
  FaUsers, 
  FaClock, 
  FaCheck, 
  FaTimes, 
  FaFilter,
  FaDownload,
  FaChartBar,
  FaBell,
  FaUserCheck,
  FaUserTimes,
  FaUserClock,
  FaFileAlt
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
    { id: 'pending', label: 'Pending', count: stats.pending, icon: FaUserClock, color: 'text-amber-600', bgColor: 'bg-amber-100' },
    { id: 'approved', label: 'Approved', count: stats.approved, icon: FaUserCheck, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
    { id: 'rejected', label: 'Rejected', count: stats.rejected, icon: FaUserTimes, color: 'text-red-600', bgColor: 'bg-red-100' },
    { id: 'all', label: 'All Applications', count: stats.total, icon: FaUsers, color: 'text-blue-600', bgColor: 'bg-blue-100' }
  ];

  const StatCard = ({ title, value, icon: Icon, color, bgColor, loading }) => (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-slate-100 group">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-slate-600 text-sm font-medium mb-2">{title}</p>
          <div className={`text-3xl font-bold ${color} mb-1`}>
            {loading ? (
              <div className="animate-pulse bg-slate-200 h-10 w-20 rounded-lg"></div>
            ) : (
              value.toLocaleString()
            )}
          </div>
        </div>
        <div className={`p-4 rounded-2xl ${bgColor} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`text-2xl ${color}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-6 lg:mb-0">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Tasker Approval Management</h1>
            <p className="text-slate-600 text-lg">Review and manage tasker applications efficiently</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Pending Approvals"
          value={stats.pending}
          icon={FaUserClock}
          color="text-amber-600"
          bgColor="bg-amber-100"
          loading={loading}
        />
        <StatCard
          title="Approved Taskers"
          value={stats.approved}
          icon={FaUserCheck}
          color="text-emerald-600"
          bgColor="bg-emerald-100"
          loading={loading}
        />
        <StatCard
          title="Rejected Applications"
          value={stats.rejected}
          icon={FaUserTimes}
          color="text-red-600"
          bgColor="bg-red-100"
          loading={loading}
        />
        <StatCard
          title="Total Applications"
          value={stats.total}
          icon={FaUsers}
          color="text-blue-600"
          bgColor="bg-blue-100"
          loading={loading}
        />
      </div>

      {/* Main Content Tabs */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        {/* Enhanced Tabs */}
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
          {activeTab === 'pending' && (
            <div>
              
              <PendingTaskers />
            </div>
          )}

          {activeTab === 'approved' && (
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Approved Taskers</h2>
                <p className="text-slate-600 text-lg">View all approved taskers on the platform</p>
              </div>
              <TaskerList status="approved" />
            </div>
          )}

          {activeTab === 'rejected' && (
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Rejected Applications</h2>
                <p className="text-slate-600 text-lg">Review rejected tasker applications</p>
              </div>
              <TaskerList status="rejected" />
            </div>
          )}

          {activeTab === 'all' && (
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">All Applications</h2>
                <p className="text-slate-600 text-lg">Complete overview of all tasker applications</p>
              </div>
              <TaskerList status="all" />
            </div>
          )}
        </div>
      </div>

    
    </div>
  );
};

export default TaskerApproval; 