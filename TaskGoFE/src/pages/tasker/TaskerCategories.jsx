import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaTools, FaWrench, FaBroom, FaCog, FaPlug, FaHammer, FaLeaf, FaTree, FaLock, FaTasks } from 'react-icons/fa';
import { getCategoryStats } from '../../services/api/taskService';

const TaskerCategories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define task categories with icons and colors
  const categoryMetadata = {
    'Cleaning': { icon: <FaBroom className="w-8 h-8" />, color: "from-purple-500 to-purple-600" },
    'Repairing': { icon: <FaWrench className="w-8 h-8" />, color: "from-green-500 to-green-600" },
    'Handyman': { icon: <FaHammer className="w-8 h-8" />, color: "from-indigo-500 to-indigo-600" },
    'Maintenance': { icon: <FaTools className="w-8 h-8" />, color: "from-blue-500 to-blue-600" },
    'Gardening': { icon: <FaLeaf className="w-8 h-8" />, color: "from-emerald-500 to-emerald-600" },
    'Landscaping': { icon: <FaTree className="w-8 h-8" />, color: "from-teal-500 to-teal-600" },
    'Installations': { icon: <FaPlug className="w-8 h-8" />, color: "from-red-500 to-red-600" },
    'Security': { icon: <FaLock className="w-8 h-8" />, color: "from-orange-500 to-orange-600" }
  };

  useEffect(() => {
    const fetchCategoryStats = async () => {
      try {
        setLoading(true);
        const response = await getCategoryStats();
        
        // Filter and map the categories we want to display
        const displayCategories = ['Cleaning', 'Repairing', 'Handyman', 'Maintenance', 
                                   'Gardening', 'Landscaping', 'Installations', 'Security'];
        
        const categoriesWithMetadata = displayCategories.map(categoryName => {
          const categoryData = response.data.find(cat => cat.category === categoryName);
          const count = categoryData ? categoryData.count : 0;
          const metadata = categoryMetadata[categoryName];
          
          return {
            title: categoryName,
            tasks: `${count} Open Tasks`,
            count: count,
            icon: metadata.icon,
            color: metadata.color
          };
        });
        
        setCategories(categoriesWithMetadata);
      } catch (err) {
        console.error('Error fetching category stats:', err);
        setError('Failed to load category statistics');
        
        // Fallback to static data if API fails
        const fallbackCategories = Object.keys(categoryMetadata).map(categoryName => {
          const metadata = categoryMetadata[categoryName];
          return {
            title: categoryName,
            tasks: "0 Open Tasks",
            count: 0,
            icon: metadata.icon,
            color: metadata.color
          };
        });
        setCategories(fallbackCategories);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryStats();
  }, []);

  const handleCategoryClick = (categoryTitle) => {
    navigate(`/tasks?category=${encodeURIComponent(categoryTitle)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50/40 to-teal-50/30 relative">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-5 left-5 w-16 h-16 bg-green-300 rounded-full blur-xl"></div>
        <div className="absolute bottom-5 right-5 w-20 h-20 bg-emerald-300 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/3 w-12 h-12 bg-teal-300 rounded-full blur-lg"></div>
        <div className="absolute top-1/4 right-1/4 w-14 h-14 bg-lime-300 rounded-full blur-xl"></div>
        <div className="absolute bottom-1/3 left-1/4 w-18 h-18 bg-green-400 rounded-full blur-2xl"></div>
      </div>
      
      {/* Header Section */}
      <div className="relative z-10 pt-8 pb-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Find Available Tasks
              </span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Browse tasks by category. Find work that matches your skills and expertise.
            </p>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="relative z-10 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Task Categories
              </span>
            </h2>
            <Link 
              to="/tasks" 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold flex items-center shadow-lg transform hover:scale-105"
            >
              <FaTasks className="mr-2" />
              View All Tasks
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 animate-pulse">
                  <div className="w-16 h-16 bg-gray-300 rounded-xl mb-6"></div>
                  <div className="h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 max-w-md mx-auto">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-red-100/60 to-red-200/60 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">⚠️</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Error Loading Categories</h3>
                <p className="text-slate-600 mb-6">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 font-semibold shadow-lg"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category, index) => (
                <div 
                  key={index} 
                  onClick={() => handleCategoryClick(category.title)}
                  className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  <div className={`p-4 bg-gradient-to-r ${category.color} rounded-xl shadow-lg mb-6 w-fit`}>
                    <div className="text-white">
                      {category.icon}
                    </div>
                  </div>
                  <h3 className="font-bold text-xl text-slate-800 group-hover:text-blue-600 transition-colors mb-2">
                    {category.title}
                  </h3>
                  <p className="text-slate-600 font-medium">{category.tasks}</p>
                </div>
              ))}
            </div>
          )}

          {/* Additional Actions */}
          <div className="mt-16 text-center">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                Ready to start earning?
              </h3>
              <p className="text-slate-600 mb-8 text-lg">
                Browse all available tasks or update your profile to match with more customers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/tasks')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg transform hover:scale-105"
                >
                  <FaTasks className="inline mr-2" />
                  Browse All Tasks
                </button>
                <button
                  onClick={() => navigate('/tasker/profile?tab=personal')}
                  className="bg-white/80 backdrop-blur-sm border-2 border-blue-600/30 text-blue-600 px-8 py-4 rounded-xl hover:bg-white/90 hover:border-blue-600/50 transition-all duration-300 font-semibold shadow-lg"
                >
                  Update Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskerCategories; 