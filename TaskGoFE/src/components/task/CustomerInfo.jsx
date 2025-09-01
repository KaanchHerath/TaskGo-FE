import React from 'react';
import { FaUser, FaMapMarkerAlt, FaTasks, FaStar, FaPhone, FaEnvelope } from 'react-icons/fa';

const CustomerInfo = ({ task }) => {
  const customerStats = [
    {
      label: 'Location:',
      value: task.area,
      icon: FaMapMarkerAlt
    },
    {
      label: 'Posted Tasks:',
      value: `${task.customer?.statistics?.tasksPosted || 0} Tasks`,
      icon: FaTasks
    },
    {
      label: 'Completed Tasks:',
      value: `${task.customer?.statistics?.tasksCompleted || 0} Tasks`,
      icon: FaTasks
    },
    {
      label: 'Customer Rating',
      value: (
        <div className="flex items-center">
          <FaStar className="text-yellow-400 mr-1 text-sm" />
          <span className="font-medium">
            {task.customer?.rating?.average ? task.customer.rating.average.toFixed(1) : 'New'}/5
          </span>
          {task.customer?.rating?.count > 0 && (
            <span className="text-xs text-slate-500 ml-1">({task.customer.rating.count})</span>
          )}
        </div>
      ),
      icon: FaStar
    },
    {
      label: 'Phone:',
      value: task.customer?.phone || 'Not provided',
      icon: FaPhone
    },
    {
      label: 'Email:',
      value: task.customer?.email || 'Not provided',
      icon: FaEnvelope,
      className: 'text-xs'
    }
  ];

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
      <h3 className="text-xl font-bold mb-6">
        <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
          Posted By
        </span>
      </h3>
      
      {/* Customer Avatar and Name */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-xl">
            {task.customer?.fullName ? 
              task.customer.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 
              'CU'
            }
          </span>
        </div>
        <div>
          <h4 className="text-lg font-bold text-slate-800">
            {task.customer?.fullName || 'Customer'}
          </h4>
          <p className="text-sm text-slate-500">Task Creator</p>
        </div>
      </div>

      {/* Customer Statistics */}
      <div className="space-y-4">
        {customerStats.map((stat, index) => (
          <div key={index} className="flex justify-between items-center p-3 bg-white/50 rounded-xl border border-white/30 backdrop-blur-sm hover:bg-white/70 transition-all duration-300">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-slate-500 to-slate-600 rounded-lg flex items-center justify-center">
                <stat.icon className="text-white text-sm" />
              </div>
              <span className="text-sm text-slate-600 font-medium">{stat.label}</span>
            </div>
            <div className={`text-slate-800 font-semibold ${stat.className || 'text-sm'}`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerInfo; 