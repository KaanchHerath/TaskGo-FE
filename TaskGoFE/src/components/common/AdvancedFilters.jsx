import { FaDollarSign, FaTag, FaStar, FaClock } from 'react-icons/fa';

const AdvancedFilters = ({ 
  showFilters, 
  isScrolled = false, 
  filters = [], 
  onFilterChange,
  sortOptions = [],
  sortBy,
  setSortBy
}) => {
  if (!showFilters) return null;

  const getFilterIcon = (type) => {
    switch (type) {
      case 'payment':
      case 'rate':
        return FaDollarSign;
      case 'rating':
        return FaStar;
      case 'time':
        return FaClock;
      default:
        return FaTag;
    }
  };

  return (
    <div className={`border-t border-white/20 animate-in slide-in-from-top-2 duration-300 ${
      isScrolled ? 'px-6 py-3' : 'px-4 py-3'
    }`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {filters.map((filter, index) => {
          const FilterIcon = getFilterIcon(filter.type);
          
          return (
            <div key={index}>
              <label className="block font-medium text-slate-700 mb-1 text-sm">
                <FilterIcon className="inline w-3 h-3 mr-1" />
                {filter.label}
              </label>
              {filter.type === 'select' ? (
                <select
                  value={filter.value}
                  onChange={(e) => onFilterChange(filter.key, e.target.value)}
                  className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/50 focus:bg-white/70 transition-all text-sm"
                >
                  {filter.options.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={filter.type}
                  placeholder={filter.placeholder}
                  value={filter.value}
                  onChange={(e) => onFilterChange(filter.key, e.target.value)}
                  className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/50 focus:bg-white/70 transition-all placeholder-slate-500 text-sm"
                  min={filter.min}
                  max={filter.max}
                  step={filter.step}
                />
              )}
            </div>
          );
        })}
        
        {/* Sort Options */}
        {sortOptions.length > 0 && (
          <div>
            <label className="block font-medium text-slate-700 mb-1 text-sm">
              <FaTag className="inline w-3 h-3 mr-1" />
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/50 focus:bg-white/70 transition-all text-sm"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedFilters; 