import React, { useState, useEffect } from 'react';
import { 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaUserSlash, 
  FaTrash, 
  FaUser,
  FaMapMarkerAlt,
  FaStar,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaUserCheck,
  FaUserTimes,
  FaClock,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaShieldAlt,
  FaExclamationTriangle
} from 'react-icons/fa';
import { getUsers, suspendUser, deleteUser } from '../../services/api/adminService';
import UserDetails from './UserDetails';
import UserActionModal from './UserActionModal';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: '',
    province: '',
    registrationDate: '',
    lastActive: ''
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

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction
      };
      
      const response = await getUsers(params);
      setUsers(response.users || []);
      setPagination(prev => ({
        ...prev,
        total: response.total || response.pagination?.total || 0
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, filters, sortConfig]);

  // Handle user actions
  const handleUserAction = async (userId, action, reason = '') => {
    try {
      if (action === 'suspend') {
        await suspendUser(userId, { reason, action: 'suspend' });
      } else if (action === 'unsuspend') {
        await suspendUser(userId, { reason, action: 'unsuspend' });
      } else if (action === 'delete') {
        await deleteUser(userId);
      }
      
      // Refresh the list
      fetchUsers();
      setShowActionModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="w-4 h-4 text-gray-400" />;
    return sortConfig.direction === 'asc' 
      ? <FaSortUp className="w-4 h-4 text-blue-600" />
      : <FaSortDown className="w-4 h-4 text-blue-600" />;
  };

  // Open action modal
  const openActionModal = (user, action) => {
    setSelectedUser(user);
    setActionType(action);
    setShowActionModal(true);
  };

  // Get user status badge
  const getUserStatusBadge = (user) => {
    if (user.isSuspended) {
      return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Suspended</span>;
    }
    if (user.isApproved === false) {
      return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
    }
    return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span>;
  };

  // Get user role badge
  const getUserRoleBadge = (user) => {
    const roleColors = {
      admin: 'bg-purple-100 text-purple-800',
      customer: 'bg-blue-100 text-blue-800',
      tasker: 'bg-green-100 text-green-800'
    };
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${roleColors[user.role] || 'bg-gray-100 text-gray-800'}`}>
        {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="p-6">
      <div className="animate-pulse space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">User Filters</h3>
          <button
            onClick={() => setFilters({ search: '', role: '', status: '', province: '', registrationDate: '', lastActive: '' })}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="customer">Customer</option>
            <option value="tasker">Tasker</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>

          <select
            value={filters.province}
            onChange={(e) => handleFilterChange('province', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Provinces</option>
            <option value="Western Province">Western Province</option>
            <option value="Central Province">Central Province</option>
            <option value="Southern Province">Southern Province</option>
            <option value="Northern Province">Northern Province</option>
            <option value="Eastern Province">Eastern Province</option>
            <option value="North Western Province">North Western Province</option>
            <option value="North Central Province">North Central Province</option>
            <option value="Uva Province">Uva Province</option>
            <option value="Sabaragamuwa Province">Sabaragamuwa Province</option>
          </select>

          <select
            value={filters.registrationDate}
            onChange={(e) => handleFilterChange('registrationDate', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>

        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Users ({pagination.total})</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Page {pagination.page} of {Math.max(1, Math.ceil((pagination.total || 0) / (pagination.limit || 1)))}</span>
              <button
                onClick={() => fetchUsers()}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <LoadingSkeleton />
        ) : users.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                      <button onClick={() => handleSort('fullName')} className="flex items-center space-x-1 hover:text-gray-700">
                        <span>User</span>
                        {getSortIcon('fullName')}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                      <button onClick={() => handleSort('role')} className="flex items-center space-x-1 hover:text-gray-700">
                        <span>Role</span>
                        {getSortIcon('role')}
                      </button>
                    </th>
                    
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                      <button onClick={() => handleSort('createdAt')} className="flex items-center space-x-1 hover:text-gray-700">
                        <span>Registered</span>
                        {getSortIcon('createdAt')}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                      <button onClick={() => handleSort('lastActive')} className="flex items-center space-x-1 hover:text-gray-700">
                        <span>Last Active</span>
                        {getSortIcon('lastActive')}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <FaUser className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.fullName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getUserRoleBadge(user)}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <FaMapMarkerAlt className="w-4 h-4 text-gray-400 mr-1" />
                          {user.province || 'Not specified'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.lastActive ? formatDate(user.lastActive) : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDetails(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="View Details"
                          >
                            <FaEye className="w-4 h-4" />
                          </button>
                          {user.isSuspended ? (
                            <button
                              onClick={() => openActionModal(user, 'unsuspend')}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Unsuspend User"
                            >
                              <FaUserCheck className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => openActionModal(user, 'suspend')}
                              className="text-yellow-600 hover:text-yellow-900 p-1"
                              title="Suspend User"
                            >
                              <FaUserSlash className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => openActionModal(user, 'delete')}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Delete User"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && pagination.total > 0 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-700">
                      Page {pagination.page} of {Math.max(1, Math.ceil((pagination.total || 0) / (pagination.limit || 1)))}
                    </span>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page * pagination.limit >= pagination.total}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <FaUser className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showDetails && selectedUser && (
        <UserDetails
          user={selectedUser}
          onClose={() => {
            setShowDetails(false);
            setSelectedUser(null);
          }}
          onSuspend={() => {
            setShowDetails(false);
            openActionModal(selectedUser, 'suspend');
          }}
          onDelete={() => {
            setShowDetails(false);
            openActionModal(selectedUser, 'delete');
          }}
        />
      )}

      {/* User Action Modal */}
      {showActionModal && selectedUser && (
        <UserActionModal
          user={selectedUser}
          action={actionType}
          onConfirm={(reason) => handleUserAction(selectedUser._id, actionType, reason)}
          onCancel={() => {
            setShowActionModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
};

export default UserManagement; 