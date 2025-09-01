import { FaSearch, FaMapMarkerAlt } from 'react-icons/fa';

const SearchBar = ({ 
  searchTerm, 
  setSearchTerm, 
  location, 
  setLocation, 
  onSearch, 
  isScrolled = false,
  searchPlaceholder = "What are you looking for?",
  locationPlaceholder = "Location"
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-3 flex-1">
      {/* Search Input */}
      <div className="flex-1 relative group">
        <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 group-focus-within:text-blue-500 transition-all duration-300 ${
          isScrolled ? 'text-slate-600' : 'text-slate-500'
        }`} />
        <input
          type="text"
          placeholder={isScrolled ? searchPlaceholder.split(' ')[0] + "..." : searchPlaceholder}
          className={`w-full pl-10 pr-4 transition-all duration-700 ease-out focus:outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/50 placeholder-slate-500 font-medium ${
            isScrolled 
              ? 'py-2.5 bg-white/40 backdrop-blur-xl border border-white/50 rounded-full text-sm focus:bg-white/60 shadow-md' 
              : 'py-3 bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl focus:bg-white/70 text-sm shadow-sm'
          }`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
        />
      </div>
      
      {/* Location Input */}
      <div className={`relative group transition-all duration-700 ease-out ${
        isScrolled ? 'w-44' : 'w-56'
      }`}>
        <FaMapMarkerAlt className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 group-focus-within:text-blue-500 transition-all duration-300 ${
          isScrolled ? 'text-slate-600' : 'text-slate-500'
        }`} />
        <input
          type="text"
          placeholder={locationPlaceholder}
          className={`w-full pl-10 pr-4 transition-all duration-700 ease-out focus:outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/50 placeholder-slate-500 font-medium ${
            isScrolled 
              ? 'py-2.5 bg-white/40 backdrop-blur-xl border border-white/50 rounded-full text-sm focus:bg-white/60 shadow-md' 
              : 'py-3 bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl focus:bg-white/70 text-sm shadow-sm'
          }`}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyPress={handleKeyPress}
        />
      </div>
    </div>
  );
};

export default SearchBar; 