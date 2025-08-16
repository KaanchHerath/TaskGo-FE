import React, { useState, useEffect } from 'react';
import { 
  FaTasks, 
  FaCheckCircle, 
  FaClock, 
  FaTimesCircle, 
  FaFilter,
  FaDownload,
  FaChartBar,
  FaBell,
  FaSearch,
  FaEye,
  FaEdit,
  FaExclamationTriangle,
  FaPlay,
  FaPause,
  FaHourglass,
  FaCalendarAlt
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
      const response = await getTasks({ limit: 1 }); // Just to get counts
      
      // In a real implementation, you'd have separate endpoints for these stats
      // For now, we'll simulate the data
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
    { id: 'all', label: 'All Tasks', count: stats.total, icon: FaTasks, color: 'text-blue-600' },
    { id: 'active', label: 'Active', count: stats.active, icon: FaPlay, color: 'text-green-600' },
    { id: 'in_progress', label: 'In Progress', count: stats.inProgress, icon: FaHourglass, color: 'text-orange-600' },
    { id: 'scheduled', label: 'Scheduled', count: stats.scheduled, icon: FaCalendarAlt, color: 'text-blue-600' },
    { id: 'paused', label: 'Paused', count: stats.paused, icon: FaPause, color: 'text-yellow-600' },
    { id: 'completed', label: 'Completed', count: stats.completed, icon: FaCheckCircle, color: 'text-green-600' },
    { id: 'cancelled', label: 'Cancelled', count: stats.cancelled, icon: FaTimesCircle, color: 'text-red-600' }
  ];

  const quickActions = [
    {
      title: 'Export Tasks',
      description: 'Download task data as CSV',
      icon: FaDownload,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      action: () => console.log('Export tasks')
    },
    {
      title: 'Task Analytics',
      description: 'View detailed task statistics',
      icon: FaChartBar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      action: () => console.log('View analytics')
    },
    {
      title: 'Bulk Actions',
      description: 'Perform actions on multiple tasks',
      icon: FaEdit,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      action: () => console.log('Bulk actions')
    },
    {
      title: 'Task Alerts',
      description: 'Configure task notifications',
      icon: FaBell,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      action: () => console.log('Task alerts')
    }
  ];

  const managementTips = [
    {
      title: 'Monitor Active Tasks',
      description: 'Regularly check active tasks to ensure timely completion and customer satisfaction.',
      icon: FaPlay,
      color: 'text-green-600'
    },
    {
      title: 'Review Disputed Tasks',
      description: 'Pay special attention to tasks with disputes or negative feedback for resolution.',
      icon: FaExclamationTriangle,
      color: 'text-red-600'
    },
    {
      title: 'Track Tasker Performance',
      description: 'Monitor tasker completion rates and customer ratings to maintain quality.',
      icon: FaChartBar,
      color: 'text-blue-600'
    },
    {
      title: 'Optimize Task Flow',
      description: 'Analyze task status transitions to identify bottlenecks and improve efficiency.',
      icon: FaFilter,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaTasks className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
                <p className="text-sm text-gray-500">Monitor and manage all platform tasks</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <FaDownload className="h-4 w-4 mr-2 inline" />
                Export
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <FaChartBar className="h-4 w-4 mr-2 inline" />
                Analytics
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaTasks className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaPlay className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FaHourglass className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaCheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                  {tabs.map((tab) => {
                    const TabIcon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <TabIcon className="h-4 w-4" />
                        <span>{tab.label}</span>
                        <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                          activeTab === tab.id
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {tab.count}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Task Management Component */}
            <TaskManagement />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {quickActions.map((action, index) => {
                  const ActionIcon = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={action.action}
                      className="w-full flex items-center p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className={`p-2 ${action.bgColor} rounded-lg`}>
                        <ActionIcon className={`h-4 w-4 ${action.color}`} />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{action.title}</p>
                        <p className="text-xs text-gray-500">{action.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Management Tips */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Management Tips</h3>
              <div className="space-y-4">
                {managementTips.map((tip, index) => {
                  const TipIcon = tip.icon;
                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <TipIcon className={`h-5 w-5 ${tip.color} mt-0.5`} />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{tip.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">{tip.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Task #1234 completed</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">New task posted</p>
                    <p className="text-xs text-gray-500">4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Task #1235 paused</p>
                    <p className="text-xs text-gray-500">6 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Task #1236 cancelled</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
              </div>
              <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
                View All Activity
              </button>
            </div>

            {/* Task Status Legend */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Legend</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Active</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">In Progress</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Scheduled</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Paused</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <span className="text-sm text-gray-700">Completed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Cancelled</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskManagementPage; 