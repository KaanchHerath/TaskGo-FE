import React from 'react';

const TaskGoLogo = ({ size = 40, className = "" }) => {
  return (
    <img 
      src="/Logo.png" 
      alt="TaskGo Logo" 
      width={size} 
      height={size} 
      className={`object-contain rounded-xl ${className}`}
      style={{ width: size, height: size }}
    />
  );
};

export default TaskGoLogo; 