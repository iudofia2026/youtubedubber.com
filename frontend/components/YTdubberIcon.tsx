import React from 'react';
import Image from 'next/image';

interface YTdubberIconProps {
  className?: string;
  size?: number;
}

export const YTdubberIcon: React.FC<YTdubberIconProps> = ({ 
  className = "", 
  size = 24 
}) => {
  return (
    <Image
      src="/ytdubber-logo.png"
      alt="YTdubber Logo"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
};

export default YTdubberIcon;