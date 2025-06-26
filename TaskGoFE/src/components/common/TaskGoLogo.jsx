import React from 'react';

const TaskGoLogo = ({ size = 40, className = "" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Modern Blue Gradient */}
        <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:'#3B82F6', stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:'#6366F1', stopOpacity:1}} />
        </linearGradient>
        
        {/* White Gradient for Text */}
        <linearGradient id="whiteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:'#FFFFFF', stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:'#F8FAFC', stopOpacity:1}} />
        </linearGradient>
        
        {/* Accent Gradient */}
        <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:'#10B981', stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:'#059669', stopOpacity:1}} />
        </linearGradient>
        
        {/* Drop Shadow */}
        <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#3B82F6" floodOpacity="0.25"/>
        </filter>
      </defs>
      
      {/* Main Background - Rounded Square */}
      <rect x="5" y="5" width="90" height="90" rx="20" ry="20" 
            fill="url(#primaryGradient)" 
            filter="url(#dropShadow)"/>
      
      {/* Subtle Inner Border */}
      <rect x="7" y="7" width="86" height="86" rx="18" ry="18" 
            fill="none" 
            stroke="rgba(255,255,255,0.2)" 
            strokeWidth="1"/>
      
      {/* Letter T - Clean and Modern */}
      <g transform="translate(15, 25)">
        {/* T Horizontal Bar */}
        <rect x="0" y="0" width="20" height="5" rx="2.5" fill="url(#whiteGradient)"/>
        {/* T Vertical Bar */}
        <rect x="7.5" y="0" width="5" height="25" rx="2.5" fill="url(#whiteGradient)"/>
      </g>
      
      {/* Task/Checkmark Icon - Simplified */}
      <g transform="translate(40, 30)">
        {/* Circular Background */}
        <circle cx="10" cy="10" r="12" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
        
        {/* Modern Checkmark */}
        <path d="M 6 10 L 9 13 L 14 7" 
              stroke="url(#whiteGradient)" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              fill="none"/>
      </g>
      
      {/* Letter G - Clean and Modern */}
      <g transform="translate(65, 25)">
        {/* G Shape - Simplified */}
        <path d="M 10 0 Q 20 0 20 10 Q 20 20 10 20 Q 0 20 0 10 Q 0 0 10 0 Z" 
              fill="url(#whiteGradient)"/>
        {/* G Inner Cut */}
        <path d="M 10 5 Q 15 5 15 10 Q 15 15 10 15 Q 5 15 5 10 Q 5 5 10 5 Z" 
              fill="url(#primaryGradient)"/>
        {/* G Horizontal Bar */}
        <rect x="10" y="8" width="8" height="4" fill="url(#whiteGradient)"/>
      </g>
      
      {/* Subtle Accent Dot */}
      <circle cx="50" cy="75" r="3" fill="url(#accentGradient)" opacity="0.8"/>
      
      {/* Modern Highlight */}
      <rect x="7" y="7" width="86" height="25" rx="18" ry="12" 
            fill="rgba(255,255,255,0.1)" 
            opacity="0.6"/>
    </svg>
  );
};

export default TaskGoLogo; 