import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FaUser, FaMapMarkerAlt, FaClock, FaUsers, FaTools, FaWrench, FaBroom, FaCog, FaPlug, FaHammer, FaLeaf, FaTree, FaTruck, FaPaintBrush, FaLaptop } from 'react-icons/fa';

const AvailableTaskCard = ({ 
  task, 
  onTaskClick, 
  formatDate 
}) => {
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



  const categoryInfo = getCategoryIcon(task.category);
  const CategoryIcon = categoryInfo.icon;

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 bg-gradient-to-r ${categoryInfo.color} rounded-xl shadow-lg`}>
              <div className="text-white text-xl">
                <CategoryIcon />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-xl text-slate-800 line-clamp-2">
                {task.title}
              </h3>
              <div className="flex gap-2 mt-2">
                <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-3 py-1 rounded-xl text-xs font-semibold border border-blue-200">
                  {task.category}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-slate-600 text-sm mb-4 line-clamp-2">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            // Limit to inline-style formatting only in cards
            allowedElements={[
              'p', 'strong', 'em', 'del', 'code', 'span', 'a'
            ]}
            components={{
              p: ({node, ...props}) => <span {...props} />,
              a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" />
            }}
          >
            {task.description || ''}
          </ReactMarkdown>
        </div>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center text-slate-600 text-sm">
            <FaUser className="text-blue-500 mr-3" />
            <span className="font-medium">Client: {task.customer?.fullName || 'Anonymous'}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-slate-600">
              <FaMapMarkerAlt className="text-blue-500 mr-2" />
              <span>{task.area}</span>
            </div>
            <div className="flex items-center text-slate-600">
              <FaClock className="text-blue-500 mr-2" />
              <span>{formatDate ? formatDate(task.createdAt) : new Date(task.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center text-slate-600 text-sm">
            <FaUsers className="text-blue-500 mr-3" />
            <span>{task.applicationCount || 0} applications</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
            LKR {task.minPayment} - {task.maxPayment}
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => onTaskClick(task._id)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg"
            >
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailableTaskCard; 