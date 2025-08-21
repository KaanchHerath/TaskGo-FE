import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaSearch, FaDollarSign } from 'react-icons/fa';
import { useJobs } from '../../hooks/useJobs';
import AvailableTaskCard from '../../components/task/AvailableTaskCard';
import SearchHeader from '../../components/common/SearchHeader';
import SearchSection from '../../components/common/SearchSection';
import Pagination from '../../components/common/Pagination';

const Tasks = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPayment, setMinPayment] = useState('');
  const [maxPayment, setMaxPayment] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [savedTasks, setSavedTasks] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  
  const { jobs, pagination, loading, error, setParams } = useJobs();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'Cleaning', label: 'Cleaning' },
    { value: 'Repairing', label: 'Repairing' },
    { value: 'Handyman', label: 'Handyman' },
    { value: 'Maintenance', label: 'Maintenance' },
    { value: 'Gardening', label: 'Gardening' },
    { value: 'Landscaping', label: 'Landscaping' },
    { value: 'Installations', label: 'Installations' },
    { value: 'Security', label: 'Security' },
    { value: 'Moving', label: 'Moving' },
    { value: 'Plumbing', label: 'Plumbing' },
    { value: 'Electrical', label: 'Electrical' },
    { value: 'Painting', label: 'Painting' },
    { value: 'Carpentry', label: 'Carpentry' },
    { value: 'Repairs', label: 'Repairs' },
    { value: 'Delivery', label: 'Delivery' },
    { value: 'Other', label: 'Other' }
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Latest First' },
    { value: 'minPayment', label: 'Payment: Low to High' },
    { value: 'maxPayment', label: 'Payment: High to Low' },
    { value: 'endDate', label: 'Deadline' }
  ];

  // Read URL parameters and set initial state
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    const areaParam = searchParams.get('area');
    const minPaymentParam = searchParams.get('minPayment');
    const maxPaymentParam = searchParams.get('maxPayment');
    
    if (categoryParam) setSelectedCategory(categoryParam);
    if (searchParam) setSearchTerm(searchParam);
    if (areaParam) setLocation(areaParam);
    if (minPaymentParam) setMinPayment(minPaymentParam);
    if (maxPaymentParam) setMaxPayment(maxPaymentParam);
  }, [searchParams]);


  useEffect(() => {
    const hasParams = searchParams.toString().length > 0;
    if (hasParams) {

      const timeoutId = setTimeout(() => {
        handleSearch();
      }, 100);
      return () => clearTimeout(timeoutId);
    } else {
      handleSearch();
    }
  }, [searchParams.toString()]);

  const handleSearch = () => {
    const searchParams = {
      page: 1,
      limit: 12,
      ...(searchTerm && { search: searchTerm }),
      ...(location && { area: location }),
      ...(selectedCategory && { category: selectedCategory }),
      ...(minPayment && { minPayment: Number(minPayment) }),
      ...(maxPayment && { maxPayment: Number(maxPayment) }),
      sortBy,
      sortOrder: 'desc'
    };
    
    // Update URL parameters
    const urlParams = new URLSearchParams();
    if (searchTerm) urlParams.set('search', searchTerm);
    if (location) urlParams.set('area', location);
    if (selectedCategory) urlParams.set('category', selectedCategory);
    if (minPayment) urlParams.set('minPayment', minPayment);
    if (maxPayment) urlParams.set('maxPayment', maxPayment);
    setSearchParams(urlParams);
    
    setCurrentPage(1);
    setParams(searchParams);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setLocation('');
    setSelectedCategory('');
    setMinPayment('');
    setMaxPayment('');
    setSortBy('createdAt');
    

    setSearchParams(new URLSearchParams());
    
    handleSearch();
  };

  const hasActiveFilters = selectedCategory || minPayment || maxPayment || location;

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.pages) {
      setCurrentPage(page);
      setParams(prev => ({ ...prev, page }));
      window.scrollTo({ top: 180, behavior: 'smooth' });
    }
  };

  const handleTaskClick = (taskId) => {
    if (taskId) {
      navigate(`/tasks/${taskId}`);
    }
  };

  const toggleSaveTask = (taskId, e) => {
    e.stopPropagation();
    const newSavedTasks = new Set(savedTasks);
    if (newSavedTasks.has(taskId)) {
      newSavedTasks.delete(taskId);
    } else {
      newSavedTasks.add(taskId);
    }
    setSavedTasks(newSavedTasks);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const handleFilterChange = (key, value) => {
    switch (key) {
      case 'minPayment':
        setMinPayment(value);
        break;
      case 'maxPayment':
        setMaxPayment(value);
        break;
      default:
        break;
    }
  };

  const advancedFilters = [
    {
      key: 'minPayment',
      type: 'number',
      label: 'Min Payment',
      placeholder: 'Min LKR',
      value: minPayment,
      min: 0
    },
    {
      key: 'maxPayment',
      type: 'number',
      label: 'Max Payment',
      placeholder: 'Max LKR',
      value: maxPayment,
      min: 0
    }
  ];



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
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-gradient-to-r from-blue-500/80 to-blue-600/80 backdrop-blur-sm text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-blue-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#48d669af] via-[#d8dad898] to-[#498f649f]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-tr from-[#4a7c59]/30 via-[#8b9f47]/25 to-[#e8f5df]/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-24 w-[32rem] h-[32rem] bg-gradient-to-tr from-[#8b9f47]/20 via-[#e8f5df]/25 to-[#4a7c59]/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-6rem] left-1/3 w-[28rem] h-[28rem] bg-gradient-to-tr from-[#e8f5df]/25 to-[#8b9f47]/30 rounded-full blur-3xl"></div></div>
      <div 
        className="absolute inset-0 opacity-10" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
        }}
        ></div>
        
      {/* Search Header */}
      <SearchHeader 
        title="Find Tasks" 
        subtitle="Discover opportunities" 
        icon={FaSearch} 
      />

      {/* Search Section */}
      <SearchSection
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        location={location}
        setLocation={setLocation}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        onSearch={handleSearch}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
        searchPlaceholder="What task are you looking for?"
        locationPlaceholder="Location"
        filterIcon={FaDollarSign}
        filterLabel="LKR"
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
                  <span className="text-blue-600">{pagination.total}</span> tasks
                </>
              ) : (
                'No tasks found'
              )}
            </h2>
          </div>
        </div>

        {/* Tasks Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30"></div>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500/80 border-t-transparent absolute top-0"></div>
            </div>
          </div>
        ) : jobs && jobs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((task) => (
                <AvailableTaskCard
                  key={task._id}
                  task={task}
                  onTaskClick={handleTaskClick}
                  onSaveTask={toggleSaveTask}
                  savedTasks={savedTasks}
                  formatDate={formatDate}
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
                <FaSearch className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">No tasks found</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Try adjusting your search criteria or filters to discover more opportunities.
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

export default Tasks;