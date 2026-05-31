import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'premium';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: BadgeVariant;
  pulse?: boolean;
}

const VARIANTS: Record<BadgeVariant, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  error:   'bg-rose-50 text-rose-700 border-rose-200',
  info:    'bg-violet-50 text-violet-700 border-violet-200',
  neutral: 'bg-slate-100 text-slate-600 border-slate-200',
  premium: 'bg-gradient-to-r from-violet-100 to-purple-100 text-violet-800 border-violet-200',
};

export function Badge({ children, variant = 'neutral', pulse = false, className = '', ...props }: BadgeProps) {
  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${VARIANTS[variant]} ${pulse ? 'animate-pulse' : ''} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
