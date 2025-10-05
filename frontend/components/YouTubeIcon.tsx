import React from 'react';

interface YouTubeIconProps {
  className?: string;
  size?: number;
}

export const YouTubeIcon: React.FC<YouTubeIconProps> = ({ 
  className = "", 
  size = 24 
}) => {
  return (
    <div 
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <span className="text-[#ff0000] font-bold text-lg">▶</span>
    </div>
  );
};

export default YouTubeIcon;