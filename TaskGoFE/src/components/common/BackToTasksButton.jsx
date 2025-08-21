import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const BackToTasksButton = ({ to = '/tasks', isMyTasks = false, className = '' }) => {
  const navigate = useNavigate();
  const label = isMyTasks ? 'Back to My Tasks' : 'Back to Tasks';

  return (
    <button 
      onClick={() => navigate(to)}
      className={`bg-white/70 backdrop-blur-sm border border-white/30 text-slate-700 px-4 py-2 rounded-xl hover:bg-white/90 transition-all duration-300 flex items-center font-medium shadow-lg ${className}`}
    >
      <FaArrowLeft className="mr-2" />
      <span>{label}</span>
    </button>
  );
};

export default BackToTasksButton;


