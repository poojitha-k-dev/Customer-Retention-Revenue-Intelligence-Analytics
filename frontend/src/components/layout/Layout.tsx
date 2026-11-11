import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { PageId } from '../../types';

interface LayoutProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
  isBackendLive: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
  dateRange: string;
  onChangeDateRange: (range: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  children: React.ReactNode;
}

const PAGE_META: Record<PageId, { title: string; subtitle: string }> = {
  overview: {
    title: 'Overview Dashboard',
    subtitle: 'Executive intelligence on customer retention, realized revenue, and repeat cadence.',
  },
  'customer-analytics': {
    title: 'Customer Analytics',
    subtitle: 'Deep exploration of unique buyers, repeat economics, and geographic distribution.',
  },
  'retention-cohort': {
    title: 'Retention & Cohort Analysis',
    subtitle: 'Monthly cohort retention matrix and platform-wide customer decay curve.',
  },
  'rfm-segmentation': {
    title: 'RFM Customer Segmentation',
    subtitle: '5x5 Recency vs Frequency matrix, revenue concentration, and tier migration.',
  },
  'purchase-behaviour': {
    title: 'Purchase Behaviour & CSAT',
    subtitle: 'Basket sizes, inter-purchase intervals, payment habits, and delivery punctuality.',
  },
  'business-insights': {
    title: 'Business Insights & Strategy',
    subtitle: 'Data-driven revenue sizing, churn mitigation playbook, and executive actions.',
  },
  'data-pipeline': {
    title: 'Data Pipeline & Automation',
    subtitle: 'PostgreSQL warehouse health, FastAPI service status, and n8n workflow triggers.',
  },
  'data-explorer': {
    title: 'Customer Data Explorer',
    subtitle: 'Interactive customer directory with RFM scores, spending tiers, and CSV export.',
  },
};

export const Layout: React.FC<LayoutProps> = ({
  currentPage,
  onSelectPage,
  isBackendLive,
  onRefresh,
  isRefreshing,
  dateRange,
  onChangeDateRange,
  searchQuery,
  onSearchChange,
  children,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const meta = PAGE_META[currentPage] || { title: 'RetainIQ', subtitle: 'Customer Intelligence' };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onSelectPage={onSelectPage}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isBackendLive={isBackendLive}
      />

      {/* Top Navbar */}
      <TopNav
        isCollapsed={isCollapsed}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
        dateRange={dateRange}
        onChangeDateRange={onChangeDateRange}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        title={meta.title}
        subtitle={meta.subtitle}
      />

      {/* Main Content Area */}
      <main
        className={clsx(
          'flex-1 pt-20 pb-12 px-6 lg:px-8 transition-all duration-300',
          isCollapsed ? 'ml-20' : 'ml-64'
        )}
      >
        <div className="max-w-[1600px] mx-auto">{children}</div>
      </main>
    </div>
  );
};

