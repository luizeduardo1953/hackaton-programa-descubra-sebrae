import React from 'react';
import { Card } from './Card';
import { LucideIcon } from 'lucide-react';

interface MetricProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  iconColor?: string;
  delay?: number;
  dark?: boolean;
}

export function Metric({ title, value, icon: Icon, trend, trendUp, iconColor = 'text-violet-600', delay = 0, dark }: MetricProps) {
  return (
    <Card 
      dark={dark}
      className="flex flex-col gap-3 relative overflow-hidden group animate-fadeIn" 
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Decorative background glow */}
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-violet-500/8 rounded-full blur-2xl group-hover:bg-violet-500/12 transition-all" />
      
      <div className="flex justify-between items-start relative z-10">
        <div className={`p-2.5 rounded-2xl border shadow-sm ${dark ? 'bg-violet-950/50 border-violet-800/40' : 'bg-violet-50 border-violet-100'} ${iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${
            trendUp 
              ? (dark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700') 
              : (dark ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-50 text-rose-700')
          }`}>
            {trend}
          </span>
        )}
      </div>
      
      <div className="relative z-10">
        <h4 className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${dark ? 'text-violet-400' : 'text-slate-500'}`}>{title}</h4>
        <p className={`text-3xl font-black tracking-tight leading-none ${dark ? 'text-white' : 'text-[#1e1b4b]'}`}>{value}</p>
      </div>
    </Card>
  );
}
