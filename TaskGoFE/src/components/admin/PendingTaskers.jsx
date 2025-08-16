import React, { useState, useEffect } from 'react';
import { 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaCheck, 
  FaTimes, 
  FaClock, 
  FaUser,
  FaMapMarkerAlt,
  FaStar,
  FaSort,
  FaSortUp,
  FaSortDown
} from 'react-icons/fa';
import { getPendingTaskers, approveTasker, rejectTasker } from '../../services/api/adminService';
import TaskerDetails from './TaskerDetails';
import ApprovalModal from './ApprovalModal';

const PendingTaskers = () => {
  const [taskers, setTaskers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTasker, setSelectedTasker] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    province: '',
    district: '',
    experience: '',
    skills: ''
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  // Fetch pending taskers
  const fetchPendingTaskers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction
      };
      
      const { taskers: list, pagination: pager } = await getPendingTaskers(params);
      setTaskers(list || []);
      setPagination(prev => ({
        ...prev,
        total: pager?.total || 0,
        page: pager?.page || prev.page,
        limit: pager?.limit || prev.limit,
      }));
    } catch (error) {
      console.error('Error fetching pending taskers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingTaskers();
  }, [pagination.page, filters, sortConfig]);

  // Handle approval/rejection
  const handleApprovalAction = async (taskerId, action, reason = '') => {
    try {
      if (action === 'approve') {
        await approveTasker(taskerId, { reason });
      } else {
        await rejectTasker(taskerId, { reason });
      }
      
      // Refresh the list
      fetchPendingTaskers();
      setShowApprovalModal(false);
      setSelectedTasker(null);
    } catch (error) {
      console.error(`Error ${action}ing tasker:`, error);
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

  // Open approval modal
  const openApprovalModal = (tasker, action) => {
    setSelectedTasker(tasker);
    setApprovalAction(action);
    setShowApprovalModal(true);
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
            <div className="h-8 bg-gray-300 rounded w-20"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Pending Tasker Approvals</h2>
            <p className="text-gray-600 mt-1">
              {pagination.total} taskers awaiting approval
            </p>
          </div>
          <button
            onClick={() => fetchPendingTaskers()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
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
            value={filters.experience}
            onChange={(e) => handleFilterChange('experience', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Experience</option>
            <option value="0-1 years">0-1 years</option>
            <option value="1-3 years">1-3 years</option>
            <option value="3-5 years">3-5 years</option>
            <option value="5+ years">5+ years</option>
          </select>

          <select
            value={filters.skills}
            onChange={(e) => handleFilterChange('skills', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Skills</option>
            <option value="cleaning">Cleaning</option>
            <option value="gardening">Gardening</option>
            <option value="plumbing">Plumbing</option>
            <option value="electrical">Electrical</option>
            <option value="carpentry">Carpentry</option>
            <option value="painting">Painting</option>
            <option value="moving">Moving</option>
            <option value="cooking">Cooking</option>
          </select>

          <button
            onClick={() => setFilters({ search: '', province: '', district: '', experience: '', skills: '' })}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Taskers List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <LoadingSkeleton />
        ) : taskers.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('fullName')}
                        className="flex items-center space-x-1 hover:text-gray-700"
                      >
                        <span>Tasker</span>
                        {getSortIcon('fullName')}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('taskerProfile.province')}
                        className="flex items-center space-x-1 hover:text-gray-700"
                      >
                        <span>Location</span>
                        {getSortIcon('taskerProfile.province')}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('taskerProfile.experience')}
                        className="flex items-center space-x-1 hover:text-gray-700"
                      >
                        <span>Experience</span>
                        {getSortIcon('taskerProfile.experience')}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Skills
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('createdAt')}
                        className="flex items-center space-x-1 hover:text-gray-700"
                      >
                        <span>Applied</span>
                        {getSortIcon('createdAt')}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {taskers.map((tasker) => (
                    <tr key={tasker._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <FaUser className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {tasker.fullName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {tasker.email}
                            </div>
                            <div className="text-sm text-gray-500">
                              {tasker.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <FaMapMarkerAlt className="w-4 h-4 text-gray-400 mr-1" />
                          {tasker.taskerProfile?.province}, {tasker.taskerProfile?.district}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {tasker.taskerProfile?.experience || 'Not specified'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {tasker.taskerProfile?.skills?.slice(0, 3).map((skill, index) => (
                            <span
                              key={index}
                              className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800"
                            >
                              {skill}
                            </span>
                          ))}
                          {tasker.taskerProfile?.skills?.length > 3 && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              +{tasker.taskerProfile.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(tasker.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedTasker(tasker);
                              setShowDetails(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="View Details"
                          >
                            <FaEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openApprovalModal(tasker, 'approve')}
                            className="text-green-600 hover:text-green-900 p-1"
                            title="Approve"
                          >
                            <FaCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openApprovalModal(tasker, 'reject')}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Reject"
                          >
                            <FaTimes className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.total > pagination.limit && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page * pagination.limit >= pagination.total}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span>
                      {' '}to{' '}
                      <span className="font-medium">
                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                      </span>
                      {' '}of{' '}
                      <span className="font-medium">{pagination.total}</span>
                      {' '}results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        disabled={pagination.page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={pagination.page * pagination.limit >= pagination.total}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <FaClock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No pending taskers</h3>
            <p className="mt-1 text-sm text-gray-500">
              All tasker applications have been processed.
            </p>
          </div>
        )}
      </div>

      {/* Tasker Details Modal */}
      {showDetails && selectedTasker && (
        <TaskerDetails
          tasker={selectedTasker}
          onClose={() => {
            setShowDetails(false);
            setSelectedTasker(null);
          }}
          onApprove={() => {
            setShowDetails(false);
            openApprovalModal(selectedTasker, 'approve');
          }}
          onReject={() => {
            setShowDetails(false);
            openApprovalModal(selectedTasker, 'reject');
          }}
        />
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedTasker && (
        <ApprovalModal
          tasker={selectedTasker}
          action={approvalAction}
          onConfirm={(reason) => handleApprovalAction(selectedTasker._id, approvalAction, reason)}
          onCancel={() => {
            setShowApprovalModal(false);
            setSelectedTasker(null);
          }}
        />
      )}
    </div>
  );
};

export default PendingTaskers; 