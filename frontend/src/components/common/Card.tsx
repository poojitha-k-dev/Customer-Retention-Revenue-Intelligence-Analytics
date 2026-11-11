import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  glow?: 'blue' | 'cyan' | 'purple' | 'none';
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  action,
  children,
  className,
  glow = 'none',
}) => {
  const glowClass = {
    blue: 'glow-blue',
    cyan: 'glow-cyan',
    purple: 'glow-purple',
    none: '',
  }[glow];

  return (
    <div
      className={clsx(
        'bg-[#111827] border border-[#1F293D] rounded-xl p-5 transition-all duration-200 hover:border-[#2D3B55]',
        glowClass,
        className
      )}
    >
      {(title || subtitle || action) && (
        <div className="flex items-start justify-between mb-4 pb-3 border-b border-[#1F293D]/60">
          <div>
            {title && <h3 className="text-base font-semibold text-slate-100 tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

