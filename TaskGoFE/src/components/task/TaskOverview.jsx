import React from 'react';
import { FaRegCalendarAlt, FaRegClock, FaRegBookmark, FaRegMoneyBillAlt, FaRegMap, FaRegHourglass } from 'react-icons/fa';

const TaskOverview = ({ task, formatDate }) => {
  const overviewItems = [
    {
      icon: FaRegCalendarAlt,
      label: 'TASK POSTED:',
      value: formatDate(task.createdAt)
    },
    {
      icon: FaRegClock,
      label: 'TASK EXPIRE IN:',
      value: formatDate(task.endDate)
    },
    {
      icon: FaRegBookmark,
      label: 'CATEGORY:',
      value: task.category
    },
    {
      icon: FaRegMoneyBillAlt,
      label: 'BUDGET RANGE:',
      value: `LKR ${task.minPayment || 0} - ${task.maxPayment || 0}`
    },
    {
      icon: FaRegMap,
      label: 'LOCATION:',
      value: task.area || 'Not specified'
    },
    {
      icon: FaRegHourglass,
      label: 'ESTIMATED DURATION:',
      value: task.estimatedDuration ? `${task.estimatedDuration} hour(s)` : 'Not specified'
    }
  ];

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl px-4 py-5 shadow-lg border border-white/20">
      <h3 className="text-xl font-bold mb-5">
        <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
          Task Overview
        </span>
      </h3>
      
      <div className="grid grid-cols-3 gap-4">
        {overviewItems.map((item, index) => (
          <div key={index} className="text-center group">
            <div className="w-12 h-12 bg-white/80 rounded-xl flex items-center justify-center mx-auto mb-2 border border-slate-200 group-hover:bg-white transition-all duration-300">
              <item.icon className="text-blue-500 text-xl" />
            </div>
            <p className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wider">
              {item.label.replace(':', '')}
            </p>
            <p className="text-sm font-bold text-slate-800 leading-tight">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskOverview; 