import React, { useState, useEffect } from 'react';
import { 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaEdit, 
  FaCheck, 
  FaTimes, 
  FaClock,
  FaUser,
  FaMapMarkerAlt,
  FaDollarSign,
  FaCalendarAlt,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaTools,
  FaExclamationTriangle,
  FaCheckCircle,
  FaHourglass,
  FaTimesCircle,
  FaPause,
  FaPlay
} from 'react-icons/fa';
import { getTasks, updateTaskStatus } from '../../services/api/adminService';
import TaskDetails from './TaskDetails';
import TaskStatusModal from './TaskStatusModal';

const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusAction, setStatusAction] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: '',
    customerId: '',
    taskerId: '',
    dateFrom: '',
    dateTo: '',
    minPayment: '',
    maxPayment: ''
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0
  });

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction
      };
      
      const response = await getTasks(params);
      setTasks(response.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.pagination?.total || 0
      }));
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [pagination.page, filters, sortConfig]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle sort
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  // Handle task actions
  const handleViewDetails = (task) => {
    setSelectedTask(task);
    setShowDetails(true);
  };

  const handleStatusUpdate = (task, action) => {
    setSelectedTask(task);
    setStatusAction(action);
    setShowStatusModal(true);
  };

  // Get status icon and color
  const getStatusInfo = (status) => {
    switch (status) {
      case 'active':
        return { icon: FaPlay, color: 'text-green-600', bgColor: 'bg-green-100' };
      case 'scheduled':
        return { icon: FaClock, color: 'text-blue-600', bgColor: 'bg-blue-100' };
      case 'in_progress':
        return { icon: FaHourglass, color: 'text-orange-600', bgColor: 'bg-orange-100' };
      case 'completed':
        return { icon: FaCheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' };
      case 'cancelled':
        return { icon: FaTimesCircle, color: 'text-red-600', bgColor: 'bg-red-100' };
      case 'paused':
        return { icon: FaPause, color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
      default:
        return { icon: FaClock, color: 'text-gray-600', bgColor: 'bg-gray-100' };
    }
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    const categoryLower = category?.toLowerCase() || '';
    
    if (categoryLower.includes('cleaning')) return FaTools;
    if (categoryLower.includes('repair')) return FaWrench;
    if (categoryLower.includes('maintenance')) return FaCog;
    if (categoryLower.includes('gardening')) return FaLeaf;
    if (categoryLower.includes('moving')) return FaTruck;
    if (categoryLower.includes('painting')) return FaPaintBrush;
    if (categoryLower.includes('electrical')) return FaPlug;
    if (categoryLower.includes('plumbing')) return FaWrench;
    if (categoryLower.includes('carpentry')) return FaHammer;
    if (categoryLower.includes('delivery')) return FaTruck;
    
    return FaTools;
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `LKR ${parseInt(amount).toLocaleString()}`;
  };

  // Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="w-4 h-4 text-gray-400" />;
    return sortConfig.direction === 'asc' ? <FaSortUp className="w-4 h-4 text-blue-600" /> : <FaSortDown className="w-4 h-4 text-blue-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Task Filters</h3>
          <button
            onClick={() => setFilters({
              search: '', status: '', category: '', customerId: '', taskerId: '',
              dateFrom: '', dateTo: '', minPayment: '', maxPayment: ''
            })}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear All
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="paused">Paused</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Repairing">Repairing</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Gardening">Gardening</option>
              <option value="Moving">Moving</option>
              <option value="Painting">Painting</option>
              <option value="Electrical">Electrical</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Carpentry">Carpentry</option>
              <option value="Delivery">Delivery</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Payment Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Payment</label>
            <input
              type="number"
              placeholder="Min amount"
              value={filters.minPayment}
              onChange={(e) => handleFilterChange('minPayment', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Payment</label>
            <input
              type="number"
              placeholder="Max amount"
              value={filters.maxPayment}
              onChange={(e) => handleFilterChange('maxPayment', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Tasks ({pagination.total})
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
              </span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('title')}>
                    <div className="flex items-center space-x-1">
                      <span>Task</span>
                      {getSortIcon('title')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('status')}>
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                      {getSortIcon('status')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('customer')}>
                    <div className="flex items-center space-x-1">
                      <span>Customer</span>
                      {getSortIcon('customer')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('selectedTasker')}>
                    <div className="flex items-center space-x-1">
                      <span>Tasker</span>
                      {getSortIcon('selectedTasker')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('maxPayment')}>
                    <div className="flex items-center space-x-1">
                      <span>Payment</span>
                      {getSortIcon('maxPayment')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('createdAt')}>
                    <div className="flex items-center space-x-1">
                      <span>Created</span>
                      {getSortIcon('createdAt')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tasks.map((task) => {
                  const statusInfo = getStatusInfo(task.status);
                  const StatusIcon = statusInfo.icon;
                  const CategoryIcon = getCategoryIcon(task.category);
                  
                  return (
                    <tr key={task._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                              <CategoryIcon className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 line-clamp-1">
                              {task.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {task.category}
                            </div>
                            <div className="text-xs text-gray-400 flex items-center mt-1">
                              <FaMapMarkerAlt className="mr-1" />
                              {task.area}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {task.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {task.customer?.fullName || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {task.customer?.email || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {task.selectedTasker?.fullName || task.targetedTasker?.fullName || 'Unassigned'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {task.applicationCount || 0} applications
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(task.minPayment)} - {formatCurrency(task.maxPayment)}
                        </div>
                        {task.agreedPayment && (
                          <div className="text-xs text-green-600">
                            Agreed: {formatCurrency(task.agreedPayment)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(task.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewDetails(task)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="View Details"
                          >
                            <FaEye className="h-4 w-4" />
                          </button>
                          
                          {/* Status Update Actions */}
                          {task.status === 'active' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(task, 'pause')}
                                className="text-yellow-600 hover:text-yellow-900 p-1"
                                title="Pause Task"
                              >
                                <FaPause className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(task, 'cancel')}
                                className="text-red-600 hover:text-red-900 p-1"
                                title="Cancel Task"
                              >
                                <FaTimes className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          
                          {task.status === 'paused' && (
                            <button
                              onClick={() => handleStatusUpdate(task, 'resume')}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Resume Task"
                            >
                              <FaPlay className="h-4 w-4" />
                            </button>
                          )}
                          
                          {task.status === 'in_progress' && (
                            <button
                              onClick={() => handleStatusUpdate(task, 'complete')}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Mark Complete"
                            >
                              <FaCheck className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.total > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-700">
                  Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Task Details Modal */}
      {showDetails && selectedTask && (
        <TaskDetails
          task={selectedTask}
          onClose={() => {
            setShowDetails(false);
            setSelectedTask(null);
          }}
          onStatusUpdate={(newStatus) => {
            fetchTasks();
            setShowDetails(false);
            setSelectedTask(null);
          }}
        />
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedTask && (
        <TaskStatusModal
          task={selectedTask}
          action={statusAction}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedTask(null);
            setStatusAction(null);
          }}
          onSuccess={() => {
            fetchTasks();
            setShowStatusModal(false);
            setSelectedTask(null);
            setStatusAction(null);
          }}
        />
      )}
    </div>
  );
};

export default TaskManagement; 