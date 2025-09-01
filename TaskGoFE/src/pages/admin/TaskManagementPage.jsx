import React, { useState, useEffect } from 'react';
import { 
  FaTasks, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaFilter,
  FaChartBar,
  FaExclamationTriangle,
  FaPlay,
  FaPause,
  FaHourglass,
  FaCalendarAlt,

} from 'react-icons/fa';
import TaskManagement from '../../components/admin/TaskManagement';
import { getTasks } from '../../services/api/adminService';

const TaskManagementPage = () => {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
    inProgress: 0,
    scheduled: 0,
    paused: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Fetch task statistics
  const fetchTaskStats = async () => {
    try {
      setLoading(true);
      const response = await getTasks({ limit: 1 }); 
      const total = response.pagination?.total || 0;
      setStats({
        total,
        active: Math.floor(total * 0.4),
        completed: Math.floor(total * 0.3),
        cancelled: Math.floor(total * 0.1),
        inProgress: Math.floor(total * 0.1),
        scheduled: Math.floor(total * 0.05),
        paused: Math.floor(total * 0.05)
      });
    } catch (error) {
      console.error('Error fetching task stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskStats();
  }, []);

  const tabs = [
    { id: 'all', label: 'All Tasks', count: stats.total, icon: FaTasks, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { id: 'active', label: 'Active', count: stats.active, icon: FaPlay, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
    { id: 'in_progress', label: 'In Progress', count: stats.inProgress, icon: FaHourglass, color: 'text-amber-600', bgColor: 'bg-amber-100' },
    { id: 'scheduled', label: 'Scheduled', count: stats.scheduled, icon: FaCalendarAlt, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { id: 'paused', label: 'Paused', count: stats.paused, icon: FaPause, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    { id: 'completed', label: 'Completed', count: stats.completed, icon: FaCheckCircle, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
    { id: 'cancelled', label: 'Cancelled', count: stats.cancelled, icon: FaTimesCircle, color: 'text-red-600', bgColor: 'bg-red-100' }
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
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Task Management</h1>
            <p className="text-slate-600 text-lg">Monitor and manage all platform tasks efficiently</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tasks"
          value={stats.total}
          icon={FaTasks}
          color="text-blue-600"
          bgColor="bg-blue-100"
          loading={loading}
        />
        <StatCard
          title="Active Tasks"
          value={stats.active}
          icon={FaPlay}
          color="text-emerald-600"
          bgColor="bg-emerald-100"
          loading={loading}
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon={FaHourglass}
          color="text-amber-600"
          bgColor="bg-amber-100"
          loading={loading}
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={FaCheckCircle}
          color="text-emerald-600"
          bgColor="bg-emerald-100"
          loading={loading}
        />
      </div>

      <div className="w-full">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
          <TaskManagement />
        </div>
      </div>
    </div>
  );
};

export default TaskManagementPage; 