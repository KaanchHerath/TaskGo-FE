import React, { useState, useEffect } from 'react';
import { 
  FaUsers, 
  FaTasks, 
  FaDollarSign, 
  FaChartLine, 
  FaUserCheck, 
  FaUserClock,
  FaExclamationTriangle,
  FaCheckCircle,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';

// Animated Counter Component
const AnimatedCounter = ({ value, duration = 1000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    const startValue = 0;
    const endValue = value;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      const currentCount = Math.floor(progress * (endValue - startValue) + startValue);
      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return count.toLocaleString();
};

// Individual Stat Card Component
const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  trend, 
  trendValue, 
  loading = false,
  formatValue = (val) => val,
  subtitle
}) => {
  const getTrendColor = (trend) => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <FaArrowUp className="w-3 h-3" />;
    if (trend === 'down') return <FaArrowDown className="w-3 h-3" />;
    return null;
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color.border}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          {/* Replace <p> with <div> to avoid invalid nesting */}
          <div className={`text-3xl font-bold ${color.text} mt-2`}>
            {loading ? (
              <div className="animate-pulse bg-gray-300 h-8 w-20 rounded"></div>
            ) : (
              formatValue(value)
            )}
          </div>
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${getTrendColor(trend)}`}>
              {getTrendIcon(trend)}
              <span className="ml-1">
                {trendValue}% from last month
              </span>
            </div>
          )}
          {subtitle && (
            <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color.bg}`}>
          <Icon className={`text-2xl ${color.icon}`} />
        </div>
      </div>
    </div>
  );
};

// Main Statistics Cards Component
export const StatisticsCards = ({ stats, loading = false }) => {
  // Ensure stats has default values to prevent crashes
  const safeStats = {
    users: { total: 0, active: 0, approved: 0, pendingApproval: 0, customers: 0, taskers: 0, admins: 0, ...stats?.users },
    tasks: { active: 0, completed: 0, inProgress: 0, scheduled: 0, cancelled: 0, total: 0, ...stats?.tasks },
    revenue: { total: 0, monthly: 0, weekly: 0, ...stats?.revenue },
    applications: { total: 0, pending: 0, approved: 0, rejected: 0, ...stats?.applications }
  };

  const cardConfigs = [
    {
      title: 'Total Users',
      value: safeStats.users.total || 0,
      icon: FaUsers,
      color: {
        text: 'text-blue-600',
        bg: 'bg-blue-100',
        icon: 'text-blue-600',
        border: 'border-blue-500'
      },
      trend: 'up',
      trendValue: 12,
      formatValue: (val) => val.toLocaleString(),
      subtitle: `${safeStats.users.customers || 0} customers, ${safeStats.users.taskers || 0} taskers`
    },
    {
      title: 'Active Tasks',
      value: safeStats.tasks.active || 0,
      icon: FaTasks,
      color: {
        text: 'text-green-600',
        bg: 'bg-green-100',
        icon: 'text-green-600',
        border: 'border-green-500'
      },
      trend: 'up',
      trendValue: 8,
      formatValue: (val) => val.toLocaleString(),
      subtitle: `${safeStats.tasks.inProgress || 0} in progress, ${safeStats.tasks.scheduled || 0} scheduled`
    },
    {
      title: 'Platform Revenue',
      value: safeStats.revenue.platformRevenue?.total || 0,
      icon: FaDollarSign,
      color: {
        text: 'text-purple-600',
        bg: 'bg-purple-100',
        icon: 'text-purple-600',
        border: 'border-purple-500'
      },
      trend: 'up',
      trendValue: 15,
      formatValue: (val) => `LKR ${val.toLocaleString()}`,
      subtitle: `Monthly: LKR ${(safeStats.revenue.platformRevenue?.thisMonth || 0).toLocaleString()}`
    },
    {
      title: 'Approved Taskers',
      value: safeStats.users.approved || 0,
      icon: FaUserCheck,
      color: {
        text: 'text-emerald-600',
        bg: 'bg-emerald-100',
        icon: 'text-emerald-600',
        border: 'border-emerald-500'
      },
      trend: 'up',
      trendValue: 20,
      formatValue: (val) => val.toLocaleString(),
      subtitle: `${safeStats.users.pendingApproval || 0} pending approval`
    },
    {
      title: 'Task Completion Rate',
      value: safeStats.tasks.total > 0 ? Math.round((safeStats.tasks.completed / safeStats.tasks.total) * 100) : 0,
      icon: FaChartLine,
      color: {
        text: 'text-indigo-600',
        bg: 'bg-indigo-100',
        icon: 'text-indigo-600',
        border: 'border-indigo-500'
      },
      trend: 'up',
      trendValue: 5,
      formatValue: (val) => `${val}%`,
      subtitle: `${safeStats.tasks.completed || 0} of ${safeStats.tasks.total || 0} completed`
    },
    {
      title: 'Total Applications',
      value: safeStats.applications.total || 0,
      icon: FaUserClock,
      color: {
        text: 'text-orange-600',
        bg: 'bg-orange-100',
        icon: 'text-orange-600',
        border: 'border-orange-500'
      },
      trend: 'up',
      trendValue: 18,
      formatValue: (val) => val.toLocaleString(),
      subtitle: `${safeStats.applications.pending || 0} pending, ${safeStats.applications.approved || 0} approved`
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {cardConfigs.map((config, index) => (
        <StatCard
          key={index}
          title={config.title}
          value={config.value}
          icon={config.icon}
          color={config.color}
          trend={config.trend}
          trendValue={config.trendValue}
          loading={loading}
          formatValue={config.formatValue}
          subtitle={config.subtitle}
        />
      ))}
    </div>
  );
}; 