import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TaskerCard from '../common/TaskerCard';
import { getTopRatedTaskers } from '../../services/api/taskerService';

const FeaturedTaskers = ({ 
  title = "Top Rated Taskers", 
  subtitle = "Connect with our highest-rated professionals who deliver exceptional service",
  limit = 3,
  showViewAllButton = true,
  className = ""
}) => {
  const [featuredTaskers, setFeaturedTaskers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedTaskers = async () => {
      try {
        setLoading(true);
        const response = await getTopRatedTaskers(limit);
        setFeaturedTaskers(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching featured taskers:', error);
        setError('Failed to load featured taskers');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedTaskers();
  }, [limit]);

  const handleTaskerClick = (tasker) => {
    // Navigate to tasker profile or open modal
  };

  if (loading) {
    return (
      <section className={`py-10 bg-white relative ${className}`}>
        {/* Geometric background pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Cpolygon points='50 0 60 40 100 50 60 60 50 100 40 60 0 50 40 40'/%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {title}
              </span>
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              {subtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 animate-pulse">
                <div className="flex items-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl"></div>
                  <div className="ml-4 flex-1">
                    <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg mb-2"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg mb-1"></div>
                    <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
                  </div>
                </div>
                <div className="h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl mb-6"></div>
                <div className="h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl mb-6"></div>
                <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={`py-10 bg-white relative ${className}`}>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className="text-2xl font-bold text-red-600 mb-4">Error Loading Taskers</h3>
              <p className="text-slate-600 mb-8">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 inline-flex items-center font-semibold shadow-lg transform hover:scale-105"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-10 bg-white relative ${className}`}>
      {/* Geometric background pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Cpolygon points='50 0 60 40 100 50 60 60 50 100 40 60 0 50 40 40'/%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      {/* Floating elements */}
      <div className="absolute top-10 right-10 w-4 h-4 bg-blue-200 rounded-full opacity-20"></div>
      <div className="absolute bottom-20 left-10 w-6 h-6 bg-indigo-200 rounded-full opacity-20"></div>
      <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-purple-200 rounded-full opacity-20"></div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">
            <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              {title}
            </span>
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {featuredTaskers.length === 0 ? (
          <div className="text-center py-10">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-white">👨‍💼</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">No Taskers Found</h3>
              <p className="text-slate-600 mb-8">We're working on getting more talented taskers on our platform!</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredTaskers.map(tasker => (
              <TaskerCard 
                key={tasker._id} 
                tasker={tasker} 
                onClick={handleTaskerClick}
              />
            ))}
          </div>
        )}
        
        {/* View All Button */}
        {showViewAllButton && (
          <div className="text-center mt-8">
            <Link 
              to="/taskers" 
              className="bg-gradient-to-r from-slate-600 to-slate-700 text-white px-8 py-4 rounded-xl hover:from-slate-700 hover:to-slate-800 transition-all duration-300 font-semibold inline-flex items-center shadow-lg transform hover:scale-105"
            >
              View All Taskers
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedTaskers; 