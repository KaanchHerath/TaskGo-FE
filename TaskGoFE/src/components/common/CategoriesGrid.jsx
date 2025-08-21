import { useState, useEffect, useRef, useCallback } from 'react';

const CategoriesGrid = ({
  title = "Popular Categories",
  description = "Discover the most in-demand services on our platform",
  categories = [],
  apiEndpoint = null,
  fallbackCategories = [],
  showViewAll = true,
  viewAllLink = "/categories",
  colorScheme = "blue",
  className = "",
  density = "comfortable",
  transparent = false,
  pill = false,
  pillSize = 'md',
  maxCategories = null
}) => {
  const [categoriesData, setCategoriesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fallbackCategoriesRef = useRef(fallbackCategories);
  const apiCallMadeRef = useRef(false);
  
  // Update ref when fallbackCategories changes
  useEffect(() => {
    fallbackCategoriesRef.current = fallbackCategories;
  }, [fallbackCategories]);

  // Memoize the fetch function to prevent unnecessary re-renders
  const fetchCategories = useCallback(async () => {
    if (categories.length > 0) {
      setCategoriesData(categories);
      setLoading(false);
      return;
    }

    if (!apiEndpoint) {
      setCategoriesData(fallbackCategoriesRef.current);
      setLoading(false);
      return;
    }

    if (apiCallMadeRef.current) {
      return;
    }

    try {
      apiCallMadeRef.current = true;
      const response = await apiEndpoint();
      console.log('Category stats response:', response); // Debug log
      
      // Handle different response formats
      let categoriesData;
      if (response?.data?.data) {
        // Backend returns { success: true, data: [...] }
        categoriesData = response.data.data;
      } else if (response?.data) {
        // Direct data array
        categoriesData = response.data;
      } else if (Array.isArray(response)) {
        // Direct array response
        categoriesData = response;
      } else {
        categoriesData = fallbackCategoriesRef.current;
      }
      
      // Transform the data to match the expected format
      const transformedData = categoriesData.map(cat => {
        const metadata = fallbackCategoriesRef.current.find(fallback => 
          fallback.title.toLowerCase().includes(cat.category?.toLowerCase()) ||
          cat.category?.toLowerCase().includes(fallback.title.toLowerCase())
        );
        
        return {
          title: metadata?.title || cat.category || 'Unknown Category',
          tasks: `${cat.count || 0} Open Tasks`,
          count: cat.count || 0,
          icon: metadata?.icon || fallbackCategoriesRef.current[0]?.icon,
          color: metadata?.color || fallbackCategoriesRef.current[0]?.color
        };
      });
      
      setCategoriesData(transformedData);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategoriesData(fallbackCategoriesRef.current);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [categories, apiEndpoint]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const getColorClasses = (scheme) => {
    const colors = {
      blue: {
        decorative1: "bg-blue-300",
        decorative2: "bg-indigo-300",
        viewAllGradient: "from-blue-600 to-indigo-600",
        viewAllHover: "hover:from-blue-700 hover:to-indigo-700",
        hoverText: "group-hover:text-blue-600"
      },
      green: {
        decorative1: "bg-green-300",
        decorative2: "bg-emerald-300",
        viewAllGradient: "from-green-600 to-emerald-600",
        viewAllHover: "hover:from-green-700 hover:to-emerald-700",
        hoverText: "group-hover:text-green-600"
      },
      purple: {
        decorative1: "bg-purple-300",
        decorative2: "bg-indigo-300",
        viewAllGradient: "from-purple-600 to-indigo-600",
        viewAllHover: "hover:from-purple-700 hover:to-indigo-700",
        hoverText: "group-hover:text-purple-600"
      }
    };
    return colors[scheme] || colors.blue;
  };

  const colors = getColorClasses(colorScheme);
  const isCompact = density === 'compact';
  const getPillClasses = (size) => {
    switch (size) {
      case 'sm':
        return `${isCompact ? 'p-4' : 'p-6'} bg-white/40 backdrop-blur-md border border-white/30 rounded-2xl shadow-lg`;
      case 'lg':
        return `${isCompact ? 'p-8' : 'p-10'} bg-white/50 backdrop-blur-lg border border-white/40 rounded-[2.5rem] shadow-2xl`;
      case 'md':
      default:
        return `${isCompact ? 'p-6' : 'p-8'} bg-white/45 backdrop-blur-md border border-white/30 rounded-[2rem] shadow-xl`;
    }
  };

  return (
    <section className={`${isCompact ? 'py-10' : 'py-16'} ${transparent ? 'bg-transparent' : 'bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20'} relative ${className}`}>
      {!transparent && (
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className={`absolute top-5 left-5 w-16 h-16 ${colors.decorative1} rounded-full blur-xl`}></div>
          <div className={`absolute bottom-5 right-5 w-20 h-20 ${colors.decorative2} rounded-full blur-2xl`}></div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className={`${pill ? getPillClasses(pillSize) : ''}`}>
        <div className={`flex justify-between items-center ${isCompact ? 'mb-8' : 'mb-12'}`}>
          <div className="text-center flex-1">
            <h2 className={`${isCompact ? 'text-3xl' : 'text-4xl'} font-bold mb-3`}>
              <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {title}
              </span>
            </h2>
            <p className={`text-slate-600 ${isCompact ? 'text-base' : 'text-lg'} max-w-2xl mx-auto`}>
              {description}
            </p>
          </div>
          {showViewAll && (
            <a 
              href={viewAllLink}
              className={`bg-gradient-to-r ${colors.viewAllGradient} text-white ${isCompact ? 'px-5 py-2.5' : 'px-6 py-3'} rounded-xl ${colors.viewAllHover} transition-all duration-300 font-semibold flex items-center shadow-lg transform hover:scale-105`}
            >
              View All Categories
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          )}
        </div>
        
        {loading ? (
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 ${isCompact ? 'gap-4' : 'gap-6'}`}>
            {[...Array(maxCategories || 8)].map((_, index) => (
              <div key={index} className={`bg-white/70 backdrop-blur-sm rounded-2xl ${isCompact ? 'p-5' : 'p-6'} shadow-lg border border-white/20 animate-pulse`}>
                <div className="w-16 h-16 bg-gray-300 rounded-xl mb-6"></div>
                <div className="h-6 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 ${isCompact ? 'gap-4' : 'gap-6'}`}>
            {(maxCategories ? categoriesData.slice(0, maxCategories) : categoriesData).map((category, index) => (
              <div key={index} className={`group ${transparent ? 'bg-transparent border border-white/30 shadow-none' : 'bg-white/70 backdrop-blur-sm border border-white/20 shadow-lg'} rounded-2xl ${isCompact ? 'p-5' : 'p-6'} hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer`}>
                <div className={`p-4 bg-gradient-to-r ${category.color} rounded-xl shadow-lg ${isCompact ? 'mb-5' : 'mb-6'} w-fit`}>
                  <div className="text-white">
                    {category.icon && typeof category.icon === 'function' ? (
                      <category.icon className="w-8 h-8" />
                    ) : (
                      category.icon
                    )}
                  </div>
                </div>
                <h3 className={`font-bold ${isCompact ? 'text-lg' : 'text-xl'} text-slate-800 ${colors.hoverText} transition-colors mb-2`}>
                  {category.title}
                </h3>
                <p className="text-slate-600 font-medium">{category.tasks || category.description}</p>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </section>
  );
};

export default CategoriesGrid; 