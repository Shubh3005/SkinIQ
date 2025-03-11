
import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Logo = ({ size = 'md', className }: LogoProps) => {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div className={cn("font-bold flex items-center gap-1", sizeClasses[size], className)}>
      <span className="text-primary">Skin</span>
      <span className="text-foreground">IQ</span>
    </div>
  );
};

export default Logo;
