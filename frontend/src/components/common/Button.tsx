import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className,
  disabled,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B0F19] disabled:opacity-50 disabled:pointer-events-none gap-2';

  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm focus:ring-blue-500',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 focus:ring-slate-500',
    outline: 'border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white focus:ring-slate-500',
    ghost: 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white focus:ring-rose-500',
  }[variant];

  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-5 py-2.5',
  }[size];

  return (
    <button className={clsx(base, variants, sizes, className)} disabled={disabled} {...props}>
      {icon && <span className="w-4 h-4 flex items-center justify-center">{icon}</span>}
      {children}
    </button>
  );
};
