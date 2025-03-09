import { useState } from 'react';
import { FaSearch, FaMapMarkerAlt, FaFilter, FaClock, FaMapMarkerAlt as FaLocation } from 'react-icons/fa';
import { useJobs } from '../hooks/useJobs';

const Tasks = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { jobs, loading, error, setParams } = useJobs();

  const handleSearch = () => {
    setParams({
      search: searchTerm,
      location,
      page: currentPage
    });
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Find Task</h1>
            <div className="flex space-x-2">
              <span>Home</span>
              <span>/</span>
              <span className="text-gray-500">Find Task</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-4 mb-8">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by: Task title, Category, Keyword..."
              className="w-full pl-10 pr-4 py-3 border rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex-1 relative">
            <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="City, state or zip code"
              className="w-full pl-10 pr-4 py-3 border rounded-lg"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <button className="px-4 py-2 bg-gray-100 rounded-lg flex items-center gap-2">
            <FaFilter />
            Filters
          </button>
          <button 
            onClick={handleSearch}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg"
          >
            Find Tasks
          </button>
        </div>

        {/* Tasks Grid */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Search section remains the same ... */}

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <div key={job.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    {/* Category Badge */}
                    <div className="flex justify-between items-start mb-4">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium uppercase"
                        style={{ 
                          backgroundColor: job.category === 'CLEANING' ? '#E8F5E9' : 
                                        job.category === 'REPAIRS' ? '#FFF3E0' : '#E3F2FD',
                          color: job.category === 'CLEANING' ? '#2E7D32' :
                                job.category === 'REPAIRS' ? '#EF6C00' : '#1565C0'
                        }}>
                        {job.category}
                      </span>
                      <span className="text-sm text-gray-500">{job.area}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold mb-3">{job.title}</h3>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {job.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.tags?.map((tag, index) => (
                        <span key={index} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Details */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span className="flex items-center">
                        <FaClock className="mr-1" />
                        {new Date(job.startDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <FaLocation className="mr-1" />
                        {job.area}
                      </span>
                    </div>

                    {/* Payment Range */}
                    <div className="flex justify-between items-center pt-4 border-t">
                      <div>
                        <p className="text-sm text-gray-500">Payment Range</p>
                        <p className="font-semibold">
                          LKR {job.minPayment} - {job.maxPayment}
                        </p>
                      </div>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                        Apply Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-center mt-8 space-x-2">
            {[1, 2, 3, 4, 5].map((page) => (
              <button
                key={page}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => {
                  setCurrentPage(page);
                  setParams(prev => ({ ...prev, page }));
                }}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tasks;