
import React from 'react';
import { cn } from '@/lib/utils';

interface AnimatedBackgroundProps {
  className?: string;
}

const AnimatedBackground = ({ className }: AnimatedBackgroundProps) => {
  return (
    <div className={cn("fixed inset-0 z-[-1] overflow-hidden", className)}>
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-skin-50 via-background to-skin-100"></div>
      
      {/* Animated shapes */}
      <div className="absolute top-[10%] right-[10%] w-64 h-64 rounded-full bg-skin-100 opacity-50 animate-float" style={{ animationDelay: '0s' }}></div>
      <div className="absolute top-[30%] left-[5%] w-48 h-48 rounded-full bg-skin-100 opacity-30 animate-float" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute bottom-[15%] right-[15%] w-56 h-56 rounded-full bg-skin-100 opacity-40 animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-[25%] left-[15%] w-72 h-72 rounded-full bg-skin-100 opacity-30 animate-float" style={{ animationDelay: '1.5s' }}></div>
      
      {/* Mesh gradient overlay */}
      <div className="absolute inset-0 bg-[url('/mesh-gradient.svg')] bg-cover opacity-20"></div>
    </div>
  );
};

export default AnimatedBackground;
