import { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import FilterControls from './FilterControls';
import AdvancedFilters from './AdvancedFilters';

const SearchSection = ({ 
  searchTerm, 
  setSearchTerm, 
  location, 
  setLocation, 
  selectedCategory, 
  setSelectedCategory, 
  categories, 
  onSearch, 
  onClearFilters, 
  hasActiveFilters,
  searchPlaceholder = "What are you looking for?",
  locationPlaceholder = "Location",
  filterIcon,
  filterLabel = '$',
  advancedFilters = [],
  onFilterChange,
  sortOptions = [],
  sortBy,
  setSortBy
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll detection for responsive design
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 80);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`sticky top-16 z-40 transition-all duration-700 ease-out ${
      isScrolled 
        ? 'bg-transparent' 
        : 'bg-gradient-to-r from-white/15 to-white/5 backdrop-blur-sm'
    }`}>
      <div className={`max-w-7xl mx-auto px-4 transition-all duration-700 ease-out ${
        isScrolled ? 'py-2' : 'py-2'
      }`}>
        {/* Search Container */}
        <div className={`transition-all duration-700 ease-out ${
          isScrolled 
            ? 'bg-gradient-to-r from-white/25 via-white/15 to-white/25 backdrop-blur-2xl border border-white/30 rounded-full shadow-xl shadow-black/5 mx-auto max-w-4xl' 
            : 'bg-gradient-to-r from-white/30 to-white/15 backdrop-blur-lg border border-white/20 rounded-2xl shadow-lg'
        }`}>
          
          {/* Main Search Row */}
          <div className={`flex flex-col lg:flex-row transition-all duration-700 ease-out ${
            isScrolled 
              ? 'gap-2 px-6 py-3' 
              : 'gap-3 p-4'
          }`}>
            
            {/* Search Bar */}
            <SearchBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              location={location}
              setLocation={setLocation}
              onSearch={onSearch}
              isScrolled={isScrolled}
              searchPlaceholder={searchPlaceholder}
              locationPlaceholder={locationPlaceholder}
            />

            {/* Filter Controls */}
            <FilterControls
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categories={categories}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={onClearFilters}
              onSearch={onSearch}
              isScrolled={isScrolled}
              filterIcon={filterIcon}
              filterLabel={filterLabel}
            />
          </div>

          {/* Advanced Filters */}
          <AdvancedFilters
            showFilters={showFilters}
            isScrolled={isScrolled}
            filters={advancedFilters}
            onFilterChange={onFilterChange}
            sortOptions={sortOptions}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
        </div>
      </div>
    </div>
  );
};

export default SearchSection; 