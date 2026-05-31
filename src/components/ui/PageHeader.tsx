import React from 'react';

interface PageHeaderProps {
  title: React.ReactNode;
  description: React.ReactNode;
  actions?: React.ReactNode;
  dark?: boolean;
}

export function PageHeader({ title, description, actions, dark }: PageHeaderProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl border mb-6 animate-fadeIn ${
      dark 
        ? 'bg-[#1B365D]/80 backdrop-blur-2xl border-violet-800/40 shadow-2xl' 
        : 'bg-white border-violet-100 shadow-[0_2px_16px_rgba(124,58,237,0.06)]'
    }`}>
      <div className="flex flex-col gap-1">
        <h1 className={`text-2xl font-black tracking-tight ${dark ? 'text-white' : 'text-[#1e1b4b]'}`}>{title}</h1>
        <p className={`text-xs font-medium leading-relaxed ${dark ? 'text-violet-300' : 'text-slate-500'}`}>{description}</p>
      </div>
      {actions && (
        <div className="flex items-center gap-3 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
