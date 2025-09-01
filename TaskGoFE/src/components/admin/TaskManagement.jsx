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
  FaPlay,
  FaTruck,
  FaWrench,
  FaCog,
  FaLeaf,
  FaPaintBrush,
  FaPlug,
  FaHammer
} from 'react-icons/fa';
import { getTasks, updateTaskStatus, getUserDetails } from '../../services/api/adminService';
import TaskStatusModal from './TaskStatusModal';
import TaskDetails from './TaskDetails';

/**
 * TaskManagement Component
 * 
 * Expected task data structure from adminService.getTasks():
 * {
 *   _id: string,
 *   title: string,
 *   status: string,
 *   category: string,
 *   area: string,
 *   minPayment: number,
 *   maxPayment: number,
 *   agreedPayment?: number,
 *   createdAt: string,
 *   customer: {
 *     _id: string,
 *     fullName: string,
 *     phone: string
 *   },
 *   selectedTasker?: {
 *     _id: string,
 *     fullName: string,
 *     phone: string
 *   },
 *   targetedTasker?: {
 *     _id: string,
 *     fullName: string,
 *     phone: string
 *   }
 * }
 */
const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [userDetails, setUserDetails] = useState({});
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    search: '',
    dateFrom: '',
    dateTo: '',
    minPayment: '',
    maxPayment: ''
  });
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

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
      const taskList = response.data || [];
      
      setTasks(taskList);
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

  // Fallback: fetch user details for any tasks where customer/tasker are still IDs
  useEffect(() => {
    const idsToFetch = new Set();
    tasks.forEach(task => {
      if (task?.customer && typeof task.customer !== 'object' && !userDetails[task.customer]) {
        idsToFetch.add(task.customer);
      }
      const taskerId = (task?.selectedTasker && typeof task.selectedTasker !== 'object')
        ? task.selectedTasker
        : (task?.targetedTasker && typeof task.targetedTasker !== 'object' ? task.targetedTasker : null);
      if (taskerId && !userDetails[taskerId]) {
        idsToFetch.add(taskerId);
      }
    });

    if (idsToFetch.size === 0) return;

    (async () => {
      await Promise.all(Array.from(idsToFetch).map(async (id) => {
        try {
          const res = await getUserDetails(id);
          const userData = res?.data?.user || res?.user || res;
          if (userData) {
            setUserDetails(prev => ({ ...prev, [id]: userData }));
          }
        } catch (e) {
          // Silently ignore; UI will keep showing Loading/N/A
        }
      }));
    })();
  }, [tasks]);

  // Fetch tasks when component mounts or dependencies change
  useEffect(() => {
    fetchTasks();
  }, [pagination.page, pagination.limit, filters, sortConfig]);

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
    setShowDetailsModal(true);
  };

  const handleStatusUpdate = (task, action) => {
    setSelectedTask({ ...task, statusAction: action });
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

  // Format status text with proper capitalization
  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Get customer display info
  const getCustomerInfo = (task) => {
    if (!task.customer) return { name: 'N/A', phone: 'N/A' };
    
    // If populated object
    if (typeof task.customer === 'object' && task.customer !== null) {
      const name = task.customer.fullName || task.customer.name || task.customer.firstName || 'N/A';
      const phone = task.customer.phone || task.customer.phoneNumber || 'N/A';
      return { name, phone };
    }
    // If it's an ID, try to read from userDetails
    const id = task.customer;
    const customerObj = userDetails[id];
    if (customerObj) {
      const name = customerObj.fullName || customerObj.name || customerObj.firstName || 'N/A';
      const phone = customerObj.phone || customerObj.phoneNumber || 'N/A';
      return { name, phone };
    }
    // Still loading
    return { name: 'Loading...', phone: 'Loading...' };
  };

  // Get tasker display info
  const getTaskerInfo = (task) => {
    const taskerData = task.selectedTasker || task.targetedTasker;
    if (!taskerData) return { name: 'N/A', phone: 'N/A' };
    
    // If populated object
    if (typeof taskerData === 'object' && taskerData !== null) {
      const name = taskerData.fullName || taskerData.name || taskerData.firstName || 'N/A';
      const phone = taskerData.phone || taskerData.phoneNumber || 'N/A';
      return { name, phone };
    }
    // If it's an ID, try to read from userDetails
    const id = taskerData;
    const taskerObj = userDetails[id];
    if (taskerObj) {
      const name = taskerObj.fullName || taskerObj.name || taskerObj.firstName || 'N/A';
      const phone = taskerObj.phone || taskerObj.phoneNumber || 'N/A';
      return { name, phone };
    }
    // Still loading
    return { name: 'Loading...', phone: 'Loading...' };
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
              search: '', status: '', category: '', dateFrom: '', dateTo: '', minPayment: '', maxPayment: ''
            })}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Clear Filters
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
                      <span>Customer Details</span>
                      {getSortIcon('customer')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('selectedTasker')}>
                    <div className="flex items-center space-x-1">
                      <span>Tasker Details</span>
                      {getSortIcon('selectedTasker')}
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
                          {formatStatus(task.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getCustomerInfo(task).name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {getCustomerInfo(task).phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getTaskerInfo(task).name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {getTaskerInfo(task).phone}
                        </div>
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
      {showDetailsModal && selectedTask && (
        <TaskDetails
          task={selectedTask}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedTask(null);
          }}
          onStatusUpdate={(newStatus) => {
            fetchTasks();
            setShowDetailsModal(false);
            setSelectedTask(null);
          }}
        />
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedTask && (
        <TaskStatusModal
          task={selectedTask}
          action={selectedTask.statusAction}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedTask(null);
          }}
          onSuccess={() => {
            fetchTasks();
            setShowStatusModal(false);
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
};

export default TaskManagement; 