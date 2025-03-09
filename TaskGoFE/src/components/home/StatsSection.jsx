import React from "react";
import { FaBriefcase, FaUsers, FaRegCalendarAlt, FaRegFileAlt } from "react-icons/fa";

const StatsSection = () => {
  const stats = [
    { 
      title: "Live Job", 
      count: "175,324", 
      icon: <FaRegCalendarAlt className="w-8 h-8 text-blue-600" />
    },
    { 
      title: "Taskers", 
      count: "97,354", 
      icon: <FaUsers className="w-8 h-8 text-blue-600" />
    },
    { 
      title: "Customers", 
      count: "38,47,154", 
      icon: <FaUsers className="w-8 h-8 text-blue-600" />
    },
    { 
      title: "New Jobs", 
      count: "7,532", 
      icon: <FaRegFileAlt className="w-8 h-8 text-blue-600" />
    },
  ];

  return (
    <div className="bg-[#f1f2f4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl shadow-sm p-8 flex items-center space-x-6"
            >
              <div className="bg-blue-50 p-4 rounded-lg">
                {stat.icon}
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{stat.count}</p>
                <p className="text-gray-500 text-lg">{stat.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsSection;