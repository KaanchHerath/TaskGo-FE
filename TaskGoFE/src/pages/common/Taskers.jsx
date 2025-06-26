import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaStar, FaDollarSign } from 'react-icons/fa';
import TaskerCard from '../../components/tasker/TaskerCard';
import { getAllTaskers } from '../../services/api/taskerService';
import SearchHeader from '../../components/common/SearchHeader';
import SearchSection from '../../components/common/SearchSection';
import Pagination from '../../components/common/Pagination';

const Taskers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [minRating, setMinRating] = useState('');
  const [maxHourlyRate, setMaxHourlyRate] = useState('');
  const [sortBy, setSortBy] = useState('rating.average');
  const [currentPage, setCurrentPage] = useState(1);
  
  const [taskers, setTaskers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  const skills = [
    { value: '', label: 'All Skills' },
    { value: 'Cleaning', label: 'Cleaning' },
    { value: 'Handyman', label: 'Handyman' },
    { value: 'Moving', label: 'Moving' },
    { value: 'Plumbing', label: 'Plumbing' },
    { value: 'Electrical', label: 'Electrical' },
    { value: 'Gardening', label: 'Gardening' },
    { value: 'Painting', label: 'Painting' },
    { value: 'Carpentry', label: 'Carpentry' },
    { value: 'Installation', label: 'Installation' },
    { value: 'Repairs', label: 'Repairs' },
    { value: 'Delivery', label: 'Delivery' },
    { value: 'Other', label: 'Other' }
  ];

  const sortOptions = [
    { value: 'rating.average', label: 'Highest Rated' },
    { value: 'createdAt', label: 'Newest First' },
    { value: 'completedTasks', label: 'Most Experienced' },
    { value: 'hourlyRate', label: 'Price: Low to High' }
  ];

  const fetchTaskers = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const filters = {
        page: currentPage,
        limit: 12,
        sortBy,
        sortOrder: 'desc',
        ...params
      };

      if (searchTerm) filters.search = searchTerm;
      if (location) filters.area = location;
      if (selectedSkill) filters.skills = selectedSkill;
      if (minRating) filters.minRating = Number(minRating);
      if (maxHourlyRate) filters.maxHourlyRate = Number(maxHourlyRate);

      const response = await getAllTaskers(filters);
      setTaskers(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching taskers:', error);
      setError('Failed to load taskers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchTaskers({ page: 1 });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setLocation('');
    setSelectedSkill('');
    setMinRating('');
    setMaxHourlyRate('');
    setSortBy('rating.average');
    setCurrentPage(1);
    fetchTaskers({ page: 1 });
  };

  const hasActiveFilters = selectedSkill || minRating || maxHourlyRate || location;

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.pages) {
      setCurrentPage(page);
      fetchTaskers({ page });
      window.scrollTo({ top: 180, behavior: 'smooth' });
    }
  };

  const handleTaskerClick = (tasker) => {
    if (tasker._id) {
      navigate(`/taskers/${tasker._id}`);
    }
  };

  const handleFilterChange = (key, value) => {
    switch (key) {
      case 'minRating':
        setMinRating(value);
        break;
      case 'maxHourlyRate':
        setMaxHourlyRate(value);
        break;
      default:
        break;
    }
  };

  const advancedFilters = [
    {
      key: 'minRating',
      type: 'number',
      label: 'Minimum Rating',
      placeholder: 'Min Rating (1-5)',
      value: minRating,
      min: 1,
      max: 5,
      step: 0.1
    },
    {
      key: 'maxHourlyRate',
      type: 'number',
      label: 'Max Hourly Rate',
      placeholder: 'Max LKR/hour',
      value: maxHourlyRate,
      min: 0
    }
  ];

  useEffect(() => {
    fetchTaskers();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center bg-gradient-to-r from-white/60 to-white/40 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/30">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-red-100/60 to-red-200/60 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Something went wrong</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button 
            onClick={() => fetchTaskers()} 
            className="px-6 py-3 bg-gradient-to-r from-blue-500/80 to-blue-600/80 backdrop-blur-sm text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-blue-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Search Header */}
      <SearchHeader 
        title="Find Taskers" 
        subtitle="Discover skilled professionals" 
        icon={FaUsers} 
      />

      {/* Search Section */}
      <SearchSection
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        location={location}
        setLocation={setLocation}
        selectedCategory={selectedSkill}
        setSelectedCategory={setSelectedSkill}
        categories={skills}
        onSearch={handleSearch}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
        searchPlaceholder="Search by name or skills..."
        locationPlaceholder="Location"
        filterIcon={FaStar}
        filterLabel="★"
        advancedFilters={advancedFilters}
        onFilterChange={handleFilterChange}
        sortOptions={sortOptions}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Results Summary */}
        <div className="flex justify-between items-center mb-4">
          <div className="bg-gradient-to-r from-white/40 to-white/20 backdrop-blur-lg rounded-xl px-4 py-2 border border-white/20 shadow-sm">
            <h2 className="text-base font-bold text-slate-800">
              {pagination.total > 0 ? (
                <>
                  <span className="text-blue-600">{pagination.total}</span> taskers
                </>
              ) : (
                'No taskers found'
              )}
            </h2>
          </div>
        </div>

        {/* Taskers Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30"></div>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500/80 border-t-transparent absolute top-0"></div>
            </div>
          </div>
        ) : taskers && taskers.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {taskers.map((tasker) => (
                <TaskerCard
                  key={tasker._id}
                  tasker={tasker}
                  onClick={() => handleTaskerClick(tasker)}
                />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.pages}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto bg-gradient-to-r from-white/50 to-white/30 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-xl">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-slate-100/60 to-slate-200/60 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <FaUsers className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">No taskers found</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Try adjusting your search criteria or filters to discover more skilled professionals.
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-gradient-to-r from-blue-500/80 to-blue-600/80 backdrop-blur-sm text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-blue-200"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Taskers; 