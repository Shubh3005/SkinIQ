
import React from 'react';
import { Link } from 'react-router-dom';

type LogoProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const Logo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  return (
    <Link to="/home" className={`block ${className}`}>
      <img
        src="/lovable-uploads/ac6cdd7b-bc04-4a30-8389-f93939e3ebdb.png"
        alt="SkinIQ Logo"
        className={`${sizes[size]} transition-transform hover:scale-105`}
      />
    </Link>
  );
};

export default Logo;
