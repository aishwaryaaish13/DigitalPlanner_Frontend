import React from 'react';

export const Skeleton = ({ variant = 'text', className = '' }) => {
  const baseClass =
    'animate-pulse bg-muted rounded';
  const variants = {
    text: 'h-4 w-full',
    circular: 'h-12 w-12 rounded-full',
    rect: 'h-40 w-full',
    card: 'h-48 w-full rounded-xl',
  };

  return (
    <div className={`${baseClass} ${variants[variant]} ${className}`} />
  );
};
