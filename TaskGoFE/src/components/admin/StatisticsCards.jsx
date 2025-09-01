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
    if (trend === 'up') return 'text-emerald-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-slate-600';
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <FaArrowUp className="w-4 h-4" />;
    if (trend === 'down') return <FaArrowDown className="w-4 h-4" />;
    return null;
  };

  return (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-slate-100 hover:border-slate-200">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-4">
          <p className="text-slate-600 text-base font-medium leading-relaxed">{title}</p>
          
          <div className={`text-4xl font-bold ${color.text} leading-tight`}>
            {loading ? (
              <div className="animate-pulse bg-slate-200 h-12 w-24 rounded-lg"></div>
            ) : (
              formatValue(value)
            )}
          </div>
          
          {trend && trendValue && (
            <div className={`flex items-center text-base font-medium ${getTrendColor(trend)}`}>
              {getTrendIcon(trend)}
              <span className="ml-2">
                {trendValue > 0 ? '+' : ''}{trendValue}% from last month
              </span>
            </div>
          )}
          
          {subtitle && (
            <p className="text-sm text-slate-500 leading-relaxed">{subtitle}</p>
          )}
        </div>
        
        <div className={`p-4 rounded-2xl ${color.bg} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`text-3xl ${color.icon}`} />
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

  // Calculate actual trends from data instead of hardcoding
  const calculateTrend = (current, previous) => {
    if (!previous || previous === 0) return null;
    const change = ((current - previous) / previous) * 100;
    return Math.round(change);
  };

  const cardConfigs = [
    {
      title: 'Total Users',
      value: safeStats.users.total || 0,
      icon: FaUsers,
      color: {
        text: 'text-blue-600',
        bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
        icon: 'text-blue-600',
        border: 'border-blue-500'
      },
      trend: safeStats.users.previousTotal ? (safeStats.users.total > safeStats.users.previousTotal ? 'up' : 'down') : null,
      trendValue: safeStats.users.previousTotal ? calculateTrend(safeStats.users.total, safeStats.users.previousTotal) : null,
      formatValue: (val) => val.toLocaleString(),
      subtitle: `${safeStats.users.customers || 0} customers, ${safeStats.users.taskers || 0} taskers`
    },
    {
      title: 'Active Tasks',
      value: safeStats.tasks.active || 0,
      icon: FaTasks,
      color: {
        text: 'text-emerald-600',
        bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
        icon: 'text-emerald-600',
        border: 'border-emerald-500'
      },
      trend: safeStats.tasks.previousActive ? (safeStats.tasks.active > safeStats.tasks.previousActive ? 'up' : 'down') : null,
      trendValue: safeStats.tasks.previousActive ? calculateTrend(safeStats.tasks.active, safeStats.tasks.previousActive) : null,
      formatValue: (val) => val.toLocaleString(),
      subtitle: `${safeStats.tasks.inProgress || 0} in progress, ${safeStats.tasks.scheduled || 0} scheduled`
    },
    {
      title: 'Platform Revenue',
      value: safeStats.revenue.platformRevenue?.total || 0,
      icon: FaDollarSign,
      color: {
        text: 'text-purple-600',
        bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
        icon: 'text-purple-600',
        border: 'border-purple-500'
      },
      trend: safeStats.revenue.platformRevenue?.previousTotal ? (safeStats.revenue.platformRevenue.total > safeStats.revenue.platformRevenue.previousTotal ? 'up' : 'down') : null,
      trendValue: safeStats.revenue.platformRevenue?.previousTotal ? calculateTrend(safeStats.revenue.platformRevenue.total, safeStats.revenue.platformRevenue.previousTotal) : null,
      formatValue: (val) => `LKR ${val.toLocaleString()}`,
      subtitle: `Monthly: LKR ${(safeStats.revenue.platformRevenue?.thisMonth || 0).toLocaleString()}`
    },
    {
      title: 'Approved Taskers',
      value: safeStats.users.approved || 0,
      icon: FaUserCheck,
      color: {
        text: 'text-emerald-600',
        bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
        icon: 'text-emerald-600',
        border: 'border-emerald-500'
      },
      trend: safeStats.users.previousApproved ? (safeStats.users.approved > safeStats.users.previousApproved ? 'up' : 'down') : null,
      trendValue: safeStats.users.previousApproved ? calculateTrend(safeStats.users.approved, safeStats.users.previousApproved) : null,
      formatValue: (val) => val.toLocaleString(),
      subtitle: `${safeStats.users.pendingApproval || 0} pending approval`
    },
    {
      title: 'Task Completion Rate',
      value: safeStats.tasks.total > 0 ? Math.round((safeStats.tasks.completed / safeStats.tasks.total) * 100) : 0,
      icon: FaChartLine,
      color: {
        text: 'text-indigo-600',
        bg: 'bg-gradient-to-br from-indigo-50 to-indigo-100',
        icon: 'text-indigo-600',
        border: 'border-indigo-500'
      },
      trend: safeStats.tasks.previousCompletionRate ? (safeStats.tasks.total > 0 ? Math.round((safeStats.tasks.completed / safeStats.tasks.total) * 100) : 0) > safeStats.tasks.previousCompletionRate ? 'up' : 'down' : null,
      trendValue: safeStats.tasks.previousCompletionRate ? calculateTrend(safeStats.tasks.total > 0 ? Math.round((safeStats.tasks.completed / safeStats.tasks.total) * 100) : 0, safeStats.tasks.previousCompletionRate) : null,
      formatValue: (val) => `${val}%`,
      subtitle: `${safeStats.tasks.completed || 0} of ${safeStats.tasks.total || 0} completed`
    },
    {
      title: 'Total Applications',
      value: safeStats.applications.total || 0,
      icon: FaUserClock,
      color: {
        text: 'text-orange-600',
        bg: 'bg-gradient-to-br from-orange-50 to-orange-100',
        icon: 'text-orange-600',
        border: 'border-orange-500'
      },
      trend: safeStats.applications.previousTotal ? (safeStats.applications.total > safeStats.applications.previousTotal ? 'up' : 'down') : null,
      trendValue: safeStats.applications.previousTotal ? calculateTrend(safeStats.applications.total, safeStats.applications.previousTotal) : null,
      formatValue: (val) => val.toLocaleString(),
      subtitle: `${safeStats.applications.pending || 0} pending, ${safeStats.applications.approved || 0} approved`
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
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