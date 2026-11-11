import React from 'react';
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  Layers,
  ShoppingBag,
  Lightbulb,
  Workflow,
  Database,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Radio,
} from 'lucide-react';
import { clsx } from 'clsx';
import { PageId } from '../../types';

interface SidebarProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isBackendLive: boolean;
}

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ElementType;
  badge?: string;
  accent?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard },
  { id: 'customer-analytics', label: 'Customer Analytics', icon: Users, badge: '93.3K' },
  { id: 'retention-cohort', label: 'Retention & Cohorts', icon: TrendingUp },
  { id: 'rfm-segmentation', label: 'RFM Segmentation', icon: Layers, badge: '8 Segments' },
  { id: 'purchase-behaviour', label: 'Purchase Behaviour', icon: ShoppingBag },
  { id: 'business-insights', label: 'Business Insights', icon: Lightbulb, accent: 'text-amber-400' },
  { id: 'data-pipeline', label: 'Pipeline & Automation', icon: Workflow, badge: 'n8n' },
  { id: 'data-explorer', label: 'Data Explorer', icon: Database },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  isCollapsed,
  onToggleCollapse,
  isBackendLive,
}) => {
  return (
    <aside
      className={clsx(
        'fixed top-0 left-0 bottom-0 z-30 bg-[#0D1322] border-r border-[#1F293D] flex flex-col transition-all duration-300',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-[#1F293D]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-purple-600 p-[1.5px] flex-shrink-0 shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-[#0D1322] rounded-[10px] flex items-center justify-center">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 font-extrabold text-lg">
                RQ
              </span>
            </div>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
                RetainIQ
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  PRO
                </span>
              </span>
              <span className="text-[10.5px] text-slate-400 truncate max-w-[140px]">
                Retention Intelligence
              </span>
            </div>
          )}
        </div>
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        <div className={clsx('px-3 mb-2', isCollapsed && 'hidden')}>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Analytics & Models
          </span>
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectPage(item.id)}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative',
                isActive
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                className={clsx(
                  'w-5 h-5 flex-shrink-0 transition-colors',
                  isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200',
                  item.accent
                )}
              />
              {!isCollapsed && (
                <div className="flex items-center justify-between w-full">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={clsx(
                        'text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                        isActive
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
              {/* Active left indicator pill */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-500 rounded-r-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Backend & Environment Footer */}
      <div className="p-3 border-t border-[#1F293D]">
        <div
          className={clsx(
            'rounded-lg p-2.5 bg-slate-900/90 border border-[#1F293D] flex items-center',
            isCollapsed ? 'justify-center' : 'justify-between'
          )}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
              <span
                className={clsx(
                  'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                  isBackendLive ? 'bg-emerald-400' : 'bg-cyan-400'
                )}
              />
              <span
                className={clsx(
                  'relative inline-flex rounded-full h-2.5 w-2.5',
                  isBackendLive ? 'bg-emerald-500' : 'bg-cyan-500'
                )}
              />
            </span>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="text-xs font-semibold text-slate-200 truncate">
                  {isBackendLive ? 'FastAPI Connected' : 'Authentic Olist Marts'}
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  PostgreSQL 16 Verified
                </span>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <Radio className="w-3.5 h-3.5 text-slate-400 animate-pulse flex-shrink-0" />
          )}
        </div>
      </div>
    </aside>
  );
};

