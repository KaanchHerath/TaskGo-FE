import { FaChevronDown, FaDollarSign, FaTimes, FaSearch } from 'react-icons/fa';

const FilterControls = ({ 
  selectedCategory, 
  setSelectedCategory, 
  categories, 
  showFilters, 
  setShowFilters, 
  hasActiveFilters, 
  onClearFilters, 
  onSearch, 
  isScrolled = false,
  filterIcon: FilterIcon = FaDollarSign,
  filterLabel = '$'
}) => {
  return (
    <div className="flex gap-2 items-center">
      {/* Category Dropdown */}
      <div className="relative">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className={`appearance-none cursor-pointer pr-8 pl-3 transition-all duration-700 ease-out focus:outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/50 font-medium ${
            isScrolled 
              ? 'py-2.5 bg-white/40 backdrop-blur-xl border border-white/50 rounded-full text-sm focus:bg-white/60 shadow-md min-w-28' 
              : 'py-3 bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl focus:bg-white/70 text-sm shadow-sm min-w-32'
          } ${selectedCategory ? 'text-blue-600' : 'text-slate-600'}`}
        >
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>
              {isScrolled && cat.label.length > 8 ? cat.label.substring(0, 8) + '...' : cat.label}
            </option>
          ))}
        </select>
        <FaChevronDown className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none transition-all duration-300 ${
          selectedCategory ? 'text-blue-500' : ''
        }`} />
      </div>

      {/* Filter Toggle Button */}
      <button 
        onClick={() => setShowFilters(!showFilters)}
        className={`flex items-center gap-1.5 transition-all duration-700 ease-out font-medium shadow-md hover:shadow-lg border ${
          hasActiveFilters || showFilters
            ? 'bg-blue-500/80 backdrop-blur-xl border-blue-400/50 text-white' 
            : 'bg-white/50 backdrop-blur-sm border-white/40 text-slate-600 hover:bg-white/70'
        } ${
          isScrolled 
            ? 'px-3 py-2.5 rounded-full text-sm' 
            : 'px-4 py-3 rounded-xl text-sm'
        }`}
      >
        <FilterIcon className="w-3 h-3" />
        {isScrolled ? (hasActiveFilters ? '✓' : filterLabel) : (hasActiveFilters ? '✓' : filterLabel)}
      </button>
      
      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button 
          onClick={onClearFilters}
          className={`flex items-center gap-1 transition-all duration-700 ease-out font-medium shadow-md hover:shadow-lg bg-red-500/80 backdrop-blur-xl border border-red-400/50 text-white hover:bg-red-600/80 ${
            isScrolled 
              ? 'px-2.5 py-2.5 rounded-full text-sm' 
              : 'px-3 py-3 rounded-xl text-sm'
          }`}
        >
          <FaTimes className="w-3 h-3" />
        </button>
      )}

      {/* Search Button */}
      <button 
        onClick={onSearch}
        className={`transition-all duration-700 ease-out font-bold shadow-md hover:shadow-lg bg-gradient-to-r from-blue-500/90 to-blue-600/90 backdrop-blur-xl text-white border border-blue-400/50 hover:from-blue-600 hover:to-blue-700 ${
          isScrolled
            ? 'px-5 py-2.5 rounded-full text-sm'
            : 'px-6 py-3 rounded-xl text-sm'
        }`}
      >
        <FaSearch className="w-4 h-4" />
      </button>
    </div>
  );
};

export default FilterControls; 