import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { clsx } from 'clsx';

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  change?: string;
  isPositive?: boolean;
  accent?: 'blue' | 'cyan' | 'purple' | 'emerald' | 'amber' | 'rose';
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  change,
  isPositive = true,
  accent = 'blue',
}) => {
  const accentStyles = {
    blue: {
      bg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
      watermark: 'text-blue-500/5',
    },
    cyan: {
      bg: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
      watermark: 'text-cyan-500/5',
    },
    purple: {
      bg: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
      watermark: 'text-purple-500/5',
    },
    emerald: {
      bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      watermark: 'text-emerald-500/5',
    },
    amber: {
      bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      watermark: 'text-amber-500/5',
    },
    rose: {
      bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
      watermark: 'text-rose-500/5',
    },
  }[accent];

  return (
    <div className="relative overflow-hidden bg-[#111827] border border-[#1F293D] rounded-xl p-5 hover:border-[#2D3B55] transition-all duration-200">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </span>
          <div className="text-2xl font-extrabold text-slate-100 tracking-tight mt-1">
            {value}
          </div>
        </div>
        <div className={clsx('w-11 h-11 rounded-lg border flex items-center justify-center', accentStyles.bg)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || change) && (
        <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-[#1F293D]/60 text-xs">
          {change && (
            <span
              className={clsx(
                'flex items-center gap-0.5 font-semibold px-1.5 py-0.5 rounded',
                isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
              )}
            >
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {change}
            </span>
          )}
          {subtitle && <span className="text-slate-400">{subtitle}</span>}
        </div>
      )}

      {/* Decorative watermark icon */}
      <Icon className={clsx('absolute -right-2 -bottom-2 w-20 h-20 pointer-events-none', accentStyles.watermark)} />
    </div>
  );
};

