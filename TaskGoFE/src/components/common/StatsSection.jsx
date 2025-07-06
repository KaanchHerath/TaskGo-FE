import { useState, useEffect } from 'react';
import { getDashboardStats } from '../../services/api/statsService';

const StatsSection = ({
  title = "Trusted by Thousands",
  description = "Join our growing community of customers and taskers who are getting things done every day",
  stats = [],
  apiEndpoint = null,
  fallbackStats = {},
  colorScheme = "blue",
  className = ""
}) => {
  const [statsData, setStatsData] = useState({
    loading: true,
    ...fallbackStats
  });

  const getColorClasses = (scheme) => {
    const colors = {
      blue: {
        decorative1: "bg-blue-300",
        decorative2: "bg-indigo-300"
      },
      green: {
        decorative1: "bg-green-300",
        decorative2: "bg-emerald-300"
      },
      purple: {
        decorative1: "bg-purple-300",
        decorative2: "bg-indigo-300"
      }
    };
    return colors[scheme] || colors.blue;
  };

  const colors = getColorClasses(colorScheme);

  useEffect(() => {
    const fetchStats = async () => {
      if (!apiEndpoint) {
        setStatsData(prev => ({ ...prev, loading: false }));
        return;
      }
      try {
        let data;
        if (apiEndpoint.endsWith('/stats/dashboard')) {
          data = await getDashboardStats();
        } else {
          // For other endpoints, use the statsApi functions
          data = await getDashboardStats();
        }
        setStatsData({
          ...data,
          loading: false
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStatsData({
          ...fallbackStats,
          loading: false
        });
      }
    };
    fetchStats();
  }, [apiEndpoint, fallbackStats]);

  return (
    <section className={`py-16 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 relative ${className}`}>
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className={`absolute top-10 right-10 w-20 h-20 ${colors.decorative1} rounded-full blur-2xl`}></div>
        <div className={`absolute bottom-10 left-10 w-16 h-16 ${colors.decorative2} rounded-full blur-xl`}></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              {title}
            </span>
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            {description}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-xl shadow-lg`}>
                  {stat.icon}
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {statsData.loading ? '...' : (statsData[stat.key] || stat.fallbackValue || 0).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="text-slate-800 font-semibold text-lg">{stat.title}</div>
              <div className="text-sm text-slate-600 mt-1">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection; 