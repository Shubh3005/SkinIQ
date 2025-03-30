
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Logo = ({ size = 'md', className }: LogoProps) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  return (
    <Link to="/" className={cn("block", className)}>
      <img
        src="/lovable-uploads/f566f7be-209c-4029-9f3d-257aad2e8ca6.png"
        alt="SkinIQ Logo"
        className={cn(sizeClasses[size], "transition-transform hover:scale-105")}
      />
    </Link>
  );
};

export default Logo;
