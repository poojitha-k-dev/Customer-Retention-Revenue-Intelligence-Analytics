import React from 'react';
import {
  Search,
  Calendar,
  RotateCw,
  Bell,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../common/Button';

interface TopNavProps {
  isCollapsed: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
  dateRange: string;
  onChangeDateRange: (range: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  title: string;
  subtitle: string;
}

export const TopNav: React.FC<TopNavProps> = ({
  isCollapsed,
  onRefresh,
  isRefreshing,
  dateRange,
  onChangeDateRange,
  searchQuery,
  onSearchChange,
  title,
  subtitle,
}) => {
  return (
    <header
      className={clsx(
        'fixed top-0 right-0 h-16 bg-[#0B0F19]/80 backdrop-blur-md border-b border-[#1F293D] z-20 transition-all duration-300 flex items-center justify-between px-6',
        isCollapsed ? 'left-20' : 'left-64'
      )}
    >
      {/* Page Title & Breadcrumb */}
      <div>
        <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          {title}
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3" /> Real Data
          </span>
        </h1>
        <p className="text-xs text-slate-400 hidden md:block">{subtitle}</p>
      </div>

      {/* Global Controls */}
      <div className="flex items-center gap-3">
        {/* Global Search */}
        <div className="relative hidden lg:block w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search customers, IDs..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#111827] border border-[#1F293D] rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Date Filter Dropdown */}
        <div className="relative flex items-center">
          <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
          <select
            value={dateRange}
            onChange={(e) => onChangeDateRange(e.target.value)}
            className="pl-8 pr-7 py-1.5 bg-[#111827] border border-[#1F293D] rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer appearance-none transition-colors"
          >
            <option value="all">All Historical (2016-2018)</option>
            <option value="12m">Last 12 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="2018">Year 2018 Only</option>
            <option value="2017">Year 2017 Only</option>
          </select>
        </div>

        {/* Refresh Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="border-[#1F293D] hover:border-slate-600"
          title="Refresh analytical marts from backend"
        >
          <RotateCw className={clsx('w-3.5 h-3.5', isRefreshing && 'animate-spin text-blue-400')} />
          <span className="hidden sm:inline">{isRefreshing ? 'Syncing...' : 'Sync'}</span>
        </Button>

        {/* Quick Docs Link */}
        <a
          href="/docs"
          target="_blank"
          rel="noreferrer"
          className="p-2 rounded-lg bg-[#111827] border border-[#1F293D] text-slate-400 hover:text-white hover:border-slate-600 transition-colors hidden sm:flex"
          title="API Documentation (Swagger UI)"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </header>
  );
};

