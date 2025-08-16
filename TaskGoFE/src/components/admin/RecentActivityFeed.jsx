import React, { useState, useEffect } from 'react';
import { 
  FaUserPlus, 
  FaUserCheck, 
  FaUserTimes, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaDollarSign,
  FaComment,
  FaStar,
  FaClock,
  FaSync
} from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

// Activity Item Component
const ActivityItem = ({ activity }) => {
  const getActivityIcon = (type) => {
    const iconMap = {
      'user_registered': FaUserPlus,
      'tasker_approved': FaUserCheck,
      'tasker_rejected': FaUserTimes,
      'task_created': FaCheckCircle,
      'task_completed': FaCheckCircle,
      'task_cancelled': FaExclamationTriangle,
      'payment_received': FaDollarSign,
      'review_posted': FaStar,
      'chat_message': FaComment,
      'user_suspended': FaExclamationTriangle,
      'user_reactivated': FaUserCheck
    };
    return iconMap[type] || FaClock;
  };

  const getActivityColor = (type) => {
    const colorMap = {
      'user_registered': 'text-blue-600 bg-blue-100',
      'tasker_approved': 'text-green-600 bg-green-100',
      'tasker_rejected': 'text-red-600 bg-red-100',
      'task_created': 'text-purple-600 bg-purple-100',
      'task_completed': 'text-emerald-600 bg-emerald-100',
      'task_cancelled': 'text-red-600 bg-red-100',
      'payment_received': 'text-green-600 bg-green-100',
      'review_posted': 'text-yellow-600 bg-yellow-100',
      'chat_message': 'text-blue-600 bg-blue-100',
      'user_suspended': 'text-red-600 bg-red-100',
      'user_reactivated': 'text-green-600 bg-green-100'
    };
    return colorMap[type] || 'text-gray-600 bg-gray-100';
  };

  const getActivityMessage = (activity) => {
    const { type, user, task, amount } = activity;
    
    switch (type) {
      case 'user_registered':
        return `${user?.fullName || 'A user'} registered as ${user?.role || 'user'}`;
      case 'tasker_approved':
        return `Tasker ${user?.fullName || 'Unknown'} was approved`;
      case 'tasker_rejected':
        return `Tasker ${user?.fullName || 'Unknown'} was rejected`;
      case 'task_created':
        return `New task "${task?.title || 'Unknown'}" was created`;
      case 'task_completed':
        return `Task "${task?.title || 'Unknown'}" was completed`;
      case 'task_cancelled':
        return `Task "${task?.title || 'Unknown'}" was cancelled`;
      case 'payment_received':
        return `Payment of $${amount || 0} was received`;
      case 'review_posted':
        return `New review posted for task "${task?.title || 'Unknown'}"`;
      case 'chat_message':
        return `New message in task "${task?.title || 'Unknown'}"`;
      case 'user_suspended':
        return `User ${user?.fullName || 'Unknown'} was suspended`;
      case 'user_reactivated':
        return `User ${user?.fullName || 'Unknown'} was reactivated`;
      default:
        return activity.message || 'Activity occurred';
    }
  };

  const Icon = getActivityIcon(activity.type);
  const iconColor = getActivityColor(activity.type);

  return (
    <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className={`p-2 rounded-full ${iconColor}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 font-medium">
          {getActivityMessage(activity)}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
};

// Main Recent Activity Feed Component
export const RecentActivityFeed = ({ activities = [], loading = false, onRefresh }) => {
  const [localActivities, setLocalActivities] = useState(activities);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setLocalActivities(activities);
  }, [activities]);

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="flex items-start space-x-3 p-3">
          <div className="animate-pulse bg-gray-300 w-8 h-8 rounded-full"></div>
          <div className="flex-1">
            <div className="animate-pulse bg-gray-300 h-4 w-3/4 rounded mb-2"></div>
            <div className="animate-pulse bg-gray-300 h-3 w-1/2 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            <FaSync className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>
      
      <div className="p-4">
        {loading ? (
          <LoadingSkeleton />
        ) : localActivities.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {localActivities.map((activity, index) => (
              <ActivityItem key={activity.id || index} activity={activity} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FaClock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Activity Summary Component
export const ActivitySummary = ({ activities = [] }) => {
  const safeActivities = Array.isArray(activities) ? activities : [];
  const getActivityCount = (type) => {
    return safeActivities.filter(activity => activity.type === type).length;
  };

  const summaryItems = [
    { type: 'user_registered', label: 'New Users', icon: FaUserPlus, color: 'text-blue-600' },
    { type: 'task_created', label: 'New Tasks', icon: FaCheckCircle, color: 'text-purple-600' },
    { type: 'task_completed', label: 'Completed', icon: FaCheckCircle, color: 'text-green-600' },
    { type: 'payment_received', label: 'Payments', icon: FaDollarSign, color: 'text-emerald-600' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Activity Summary (Last 24h)</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryItems.map((item, index) => {
          const Icon = item.icon;
          const count = getActivityCount(item.type);
          
          return (
            <div key={index} className="text-center">
              <Icon className={`w-6 h-6 mx-auto mb-2 ${item.color}`} />
              <p className="text-gray-600 text-sm">{item.label}</p>
              <p className={`text-xl font-bold ${item.color}`}>{count}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Real-time Activity Indicator
export const RealTimeIndicator = ({ isConnected = true, lastUpdate }) => {
  return (
    <div className="flex items-center space-x-2 text-sm text-gray-500">
      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
      <span>{isConnected ? 'Live' : 'Disconnected'}</span>
      {lastUpdate && (
        <span>• Last update: {formatDistanceToNow(new Date(lastUpdate), { addSuffix: true })}</span>
      )}
    </div>
  );
}; 