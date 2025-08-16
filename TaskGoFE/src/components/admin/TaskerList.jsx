import React, { useEffect, useState } from 'react';
import { FaSearch, FaMapMarkerAlt, FaUser, FaClock } from 'react-icons/fa';
import { getUsers } from '../../services/api/adminService';

const TaskerList = ({ status = 'approved' }) => {
  const [taskers, setTaskers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  const fetchTaskers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        role: 'tasker',
        ...(status !== 'all' ? { status } : {}),
        ...(search ? { search } : {}),
      };
      const resp = await getUsers(params);
      // getUsers returns backend body; our service unwraps response.data to body
      // which contains { data: users, pagination }
      setTaskers(resp.data || []);
      setPagination(prev => ({ ...prev, ...(resp.pagination || {}), total: resp.pagination?.total || 0 }));
    } catch (e) {
      console.error('Error loading taskers:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit, status, search]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative w-full max-w-sm">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            value={search}
            onChange={(e) => { setPagination(p => ({ ...p, page: 1 })); setSearch(e.target.value); }}
            placeholder="Search by name, email, or phone"
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        ) : taskers.length === 0 ? (
          <div className="p-10 text-center text-gray-600">
            <FaClock className="mx-auto h-10 w-10 text-gray-400 mb-2" />
            No taskers found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasker</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skills</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {taskers.map((t) => (
                  <tr key={t._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <FaUser className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{t.fullName}</div>
                          <div className="text-sm text-gray-500">{t.email}</div>
                          <div className="text-sm text-gray-500">{t.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="w-4 h-4 text-gray-400 mr-1" />
                        {t.taskerProfile?.province}, {t.taskerProfile?.district}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                        t.taskerProfile?.approvalStatus === 'approved' ? 'bg-green-100 text-green-800' :
                        t.taskerProfile?.approvalStatus === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {t.taskerProfile?.approvalStatus || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <div className="flex flex-wrap gap-1">
                        {(t.taskerProfile?.skills || []).slice(0, 3).map((s, i) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">{s}</span>
                        ))}
                        {(t.taskerProfile?.skills?.length || 0) > 3 && (
                          <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">+{t.taskerProfile.skills.length - 3} more</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination.total > pagination.limit && (
        <div className="flex items-center justify-between">
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={pagination.page === 1}
            onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
          >Previous</button>
          <span className="text-sm text-gray-600">Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit) || 1}</span>
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
            onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
          >Next</button>
        </div>
      )}
    </div>
  );
};

export default TaskerList;


