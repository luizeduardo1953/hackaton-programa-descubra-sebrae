import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  gradient?: boolean;
  glass?: boolean;
  dark?: boolean;
}

export function Card({ children, className = '', gradient, glass, dark, ...props }: CardProps) {
  const baseClasses = 'rounded-3xl p-6 transition-all duration-300';
  
  let bgClasses = '';
  
  if (dark) {
    bgClasses = glass 
      ? 'bg-[#1B365D]/80 backdrop-blur-2xl border border-violet-800/40 shadow-2xl'
      : 'bg-[#1B365D] border border-violet-900/50 shadow-xl';
  } else {
    bgClasses = glass 
      ? 'bg-white/80 backdrop-blur-xl border border-violet-100/60 shadow-[0_8px_30px_rgba(124,58,237,0.06)]'
      : gradient 
        ? 'bg-gradient-to-br from-white to-violet-50/40 border border-violet-100 shadow-sm'
        : 'bg-white border border-violet-100 shadow-sm hover:border-violet-200 hover:shadow-[0_4px_20px_rgba(124,58,237,0.08)]';
  }

  return (
    <div className={`${baseClasses} ${bgClasses} ${className}`} {...props}>
      {children}
    </div>
  );
}
