import React from 'react';
import { FaHeart, FaShare, FaFlag, FaUser, FaMapMarkerAlt, FaClock, FaCheckCircle, FaTimesCircle, FaTag, FaTools, FaWrench, FaBroom, FaCog, FaPlug, FaHammer, FaLeaf, FaTree, FaTruck, FaPaintBrush, FaLaptop } from 'react-icons/fa';

const TaskHeader = ({ task, formatDate, formatTimeAgo }) => {
  const getCategoryIcon = (category) => {
    const categoryLower = category?.toLowerCase() || '';
    
    if (categoryLower.includes('home maintenance') || categoryLower.includes('maintenance')) {
      return { icon: FaTools, color: 'from-blue-500 to-blue-600' };
    } else if (categoryLower.includes('repair') || categoryLower.includes('plumbing')) {
      return { icon: FaWrench, color: 'from-green-500 to-green-600' };
    } else if (categoryLower.includes('clean')) {
      return { icon: FaBroom, color: 'from-purple-500 to-purple-600' };
    } else if (categoryLower.includes('appliance') || categoryLower.includes('electrical')) {
      return { icon: FaPlug, color: 'from-yellow-500 to-yellow-600' };
    } else if (categoryLower.includes('installation') || categoryLower.includes('install')) {
      return { icon: FaCog, color: 'from-orange-500 to-orange-600' };
    } else if (categoryLower.includes('handyman') || categoryLower.includes('assembly') || categoryLower.includes('carpentry')) {
      return { icon: FaHammer, color: 'from-indigo-500 to-indigo-600' };
    } else if (categoryLower.includes('garden') || categoryLower.includes('landscaping')) {
      return { icon: FaLeaf, color: 'from-emerald-500 to-emerald-600' };
    } else if (categoryLower.includes('tree') || categoryLower.includes('landscape')) {
      return { icon: FaTree, color: 'from-teal-500 to-teal-600' };
    } else if (categoryLower.includes('moving') || categoryLower.includes('delivery')) {
      return { icon: FaTruck, color: 'from-red-500 to-red-600' };
    } else if (categoryLower.includes('paint')) {
      return { icon: FaPaintBrush, color: 'from-pink-500 to-pink-600' };
    } else if (categoryLower.includes('tech') || categoryLower.includes('computer') || categoryLower.includes('it')) {
      return { icon: FaLaptop, color: 'from-cyan-500 to-cyan-600' };
    } else {
      return { icon: FaTools, color: 'from-gray-500 to-gray-600' };
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300';
      case 'scheduled':
        return 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300';
      case 'completed':
        return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300';
      case 'cancelled':
        return 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300';
      default:
        return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <FaCheckCircle className="text-green-500" />;
      case 'scheduled':
        return <FaClock className="text-blue-500" />;
      case 'completed':
        return <FaCheckCircle className="text-gray-500" />;
      case 'cancelled':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const categoryInfo = getCategoryIcon(task.category);
  const CategoryIcon = categoryInfo.icon;

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-4 py-2 rounded-xl text-sm font-semibold ${getStatusColor(task.status)}`}>
              {getStatusIcon(task.status)}
              <span className="ml-2 capitalize">{task.status}</span>
            </span>
            <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-4 py-2 rounded-xl text-sm font-semibold border border-blue-200 flex items-center">
              <div className={`p-1 bg-gradient-to-r ${categoryInfo.color} rounded-lg mr-2`}>
                <CategoryIcon className="text-white text-sm" />
              </div>
              {task.category}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              {task.title}
            </span>
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-slate-600">
            <div className="flex items-center">
              <FaUser className="text-blue-500 mr-2" />
              <span className="font-medium">{task.customer?.fullName || 'Anonymous'}</span>
            </div>
            <div className="flex items-center">
              <FaMapMarkerAlt className="text-blue-500 mr-2" />
              <span>{task.area}</span>
            </div>
            <div className="flex items-center">
              <FaClock className="text-blue-500 mr-2" />
              <span>Posted {formatTimeAgo(task.createdAt)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 mt-6 md:mt-0">
          <button className="p-3 bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl hover:bg-white/90 transition-all duration-300 shadow-lg transform hover:scale-105">
            <FaHeart className="text-slate-600" />
          </button>
          <button className="p-3 bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl hover:bg-white/90 transition-all duration-300 shadow-lg transform hover:scale-105">
            <FaShare className="text-slate-600" />
          </button>
          <button className="p-3 bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl hover:bg-white/90 transition-all duration-300 shadow-lg transform hover:scale-105">
            <FaFlag className="text-slate-600" />
          </button>
        </div>
      </div>

      {/* Budget Display */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-green-700 font-medium mb-1">Budget Range</p>
            <div className="flex items-center text-3xl font-bold">
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                LKR {task.minPayment?.toLocaleString()} - {task.maxPayment?.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
            <FaTag className="text-2xl text-white" />
          </div>
        </div>
      </div>

      {/* Task Expiry Notice */}
      <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200/50">
        <p className="text-sm text-orange-700 font-medium">
          <FaClock className="inline mr-2" />
          Task expires on: {formatDate(task.endDate)}
        </p>
      </div>
    </div>
  );
};

export default TaskHeader; 