import React, { useState } from 'react';
import {
  Layers,
  Award,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { KPICard } from '../components/common/KPICard';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { RFMSegmentMetric } from '../types';

interface RFMSegmentationProps {
  segments: RFMSegmentMetric[];
}

interface MatrixCell {
  r: number;
  f: number;
  label?: string;
  customers: number;
  revenue: number;
  color: string;
}

// 5x5 Score Grid (Recency 5 to 1 on Y, Frequency 1 to 5 on X)
const MATRIX_GRID: MatrixCell[][] = [
  // R = 5 (Most recent)
  [
    { r: 5, f: 1, label: '● New Customers', customers: 14324, revenue: 1096358, color: '#06B6D4' },
    { r: 5, f: 2, label: '● Potential Loyalists', customers: 7174, revenue: 1693060, color: '#10B981' },
    { r: 5, f: 3, label: '● Loyal Customers', customers: 562, revenue: 164890, color: '#3B82F6' },
    { r: 5, f: 4, label: '● Champions', customers: 41, revenue: 20427, color: '#1E3A8A' },
    { r: 5, f: 5, label: '● Champions (VIP)', customers: 19, revenue: 9466, color: '#1E3A8A' },
  ],
  // R = 4
  [
    { r: 4, f: 1, label: '● Promising', customers: 10863, revenue: 831015, color: '#06B6D4' },
    { r: 4, f: 2, label: '● Potential Loyalists', customers: 7228, revenue: 1705810, color: '#10B981' },
    { r: 4, f: 3, label: '● Loyal Customers', customers: 519, revenue: 152270, color: '#3B82F6' },
    { r: 4, f: 4, label: '● Champions', customers: 48, revenue: 23910, color: '#1E3A8A' },
    { r: 4, f: 5, label: '● Champions', customers: 13, revenue: 6470, color: '#1E3A8A' },
  ],
  // R = 3
  [
    { r: 3, f: 1, label: '● Need Attention', customers: 11121, revenue: 850756, color: '#F59E0B' },
    { r: 3, f: 2, label: '● Potential Loyalists', customers: 6948, revenue: 1639730, color: '#10B981' },
    { r: 3, f: 3, label: '● Loyal Customers', customers: 567, revenue: 166355, color: '#3B82F6' },
    { r: 3, f: 4, label: '● Loyal Customers', customers: 29, revenue: 8500, color: '#3B82F6' },
    { r: 3, f: 5, label: '● Loyal Customers', customers: 7, revenue: 2050, color: '#3B82F6' },
  ],
  // R = 2
  [
    { r: 2, f: 1, label: '● Hibernating', customers: 11158, revenue: 939280, color: '#8B5CF6' },
    { r: 2, f: 2, label: '● At Risk', customers: 6953, revenue: 1940980, color: '#F59E0B' },
    { r: 2, f: 3, label: '● At Risk', customers: 518, revenue: 144600, color: '#F59E0B' },
    { r: 2, f: 4, label: '● At Risk', customers: 39, revenue: 10880, color: '#F59E0B' },
    { r: 2, f: 5, label: '● At Risk', customers: 4, revenue: 1110, color: '#F59E0B' },
  ],
  // R = 1 (Least recent)
  [
    { r: 1, f: 1, label: '● Lost Customers', customers: 29505, revenue: 2280441, color: '#EF4444' },
    { r: 1, f: 2, label: '● Cannot Lose Them', customers: 6801, revenue: 2095116, color: '#EA580C' },
    { r: 1, f: 3, label: '● Cannot Lose Them', customers: 407, revenue: 125360, color: '#EA580C' },
    { r: 1, f: 4, label: '● Cannot Lose Them', customers: 24, revenue: 7390, color: '#EA580C' },
    { r: 1, f: 5, label: '● Cannot Lose Them', customers: 4, revenue: 1230, color: '#EA580C' },
  ],
];

export const RFMSegmentationPage: React.FC<RFMSegmentationProps> = ({ segments }) => {
  const [activeCell, setActiveCell] = useState<MatrixCell | null>(MATRIX_GRID[0][1]);

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Top Revenue Segment"
          value="Potential Loyalists"
          subtitle="R$ 5.15M (33.4% of total sales)"
          icon={Award}
          accent="emerald"
        />
        <KPICard
          title="At-Risk High Spenders"
          value="14,750 Buyers"
          subtitle="R$ 4.51M dormant >180 days"
          icon={AlertTriangle}
          accent="amber"
        />
        <KPICard
          title="Champions Tier (VIP)"
          value="121 Buyers"
          subtitle="R$ 498.24 AOV (3.2x average)"
          icon={Sparkles}
          accent="blue"
        />
        <KPICard
          title="Median Inactive Days"
          value="242.0 Days"
          subtitle="Recency across all segments"
          icon={Clock}
          accent="purple"
        />
      </div>

      {/* Row 1: 5x5 RFM Matrix & Selected Cell Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 5x5 Heatmap */}
        <div className="lg:col-span-8">
          <Card
            title="RFM Score Matrix (5x5 Grid)"
            subtitle="Recency Score (Y-axis: 5 to 1) vs Frequency Score (X-axis: 1 to 5). Click any cell to inspect."
            action={
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> High Health
                <span className="w-2.5 h-2.5 rounded bg-amber-500 ml-2" /> Moderate
                <span className="w-2.5 h-2.5 rounded bg-red-500 ml-2" /> At Risk
              </div>
            }
          >
            <div className="overflow-x-auto">
              <div className="min-w-[500px]">
                {/* Column Headers (Frequency 1 to 5) */}
                <div className="grid grid-cols-6 text-center text-xs font-semibold text-slate-400 mb-1">
                  <div className="text-left pl-2">Recency \ Freq</div>
                  <div>F1 (1 Order)</div>
                  <div>F2 (1-2 Orders)</div>
                  <div>F3 (2 Orders)</div>
                  <div>F4 (3 Orders)</div>
                  <div>F5 (4+ Orders)</div>
                </div>

                {/* Matrix Rows (Recency 5 down to 1) */}
                <div className="space-y-1.5 font-sans">
                  {MATRIX_GRID.map((row, rIdx) => {
                    const recencyScore = 5 - rIdx;
                    return (
                      <div key={recencyScore} className="grid grid-cols-6 gap-1.5 items-center">
                        <div className="text-xs font-bold text-slate-300 pl-2">
                          R{recencyScore} <span className="text-[10px] text-slate-400 font-normal">({recencyScore === 5 ? 'Recent' : recencyScore === 1 ? 'Dormant' : ''})</span>
                        </div>
                        {row.map((cell) => {
                          const isSelected = activeCell?.r === cell.r && activeCell?.f === cell.f;
                          return (
                            <button
                              key={`${cell.r}-${cell.f}`}
                              onClick={() => setActiveCell(cell)}
                              className={`p-2.5 rounded-lg border text-left transition-all relative ${
                                isSelected
                                  ? 'border-white ring-2 ring-blue-500 ring-offset-2 ring-offset-[#0B0F19] scale-[1.02] shadow-lg'
                                  : 'border-[#1F293D] hover:border-slate-500'
                              }`}
                              style={{
                                backgroundColor: isSelected ? '#1E293B' : '#111827',
                              }}
                            >
                              <div
                                className="text-[10.5px] font-bold truncate"
                                style={{ color: cell.color }}
                              >
                                {cell.label}
                              </div>
                              <div className="text-xs font-extrabold text-slate-100 mt-1">
                                {cell.customers.toLocaleString()}{' '}
                                <span className="text-[9px] text-slate-400 font-normal">cust</span>
                              </div>
                              <div className="text-[10px] text-slate-400">
                                R$ {(cell.revenue / 1e6).toFixed(2)}M
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Selected Cell Inspector / Action Card */}
        <div className="lg:col-span-4">
          <Card
            title="Cell Inspector & Retention Action"
            subtitle={`Recency Score R${activeCell?.r} × Frequency Score F${activeCell?.f}`}
          >
            {activeCell ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#0B0F19] border border-[#1F293D] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold" style={{ color: activeCell.color }}>
                      {activeCell.label}
                    </span>
                    <Badge variant="blue">R{activeCell.r}F{activeCell.f}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[#1F293D]">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Customers</span>
                      <span className="font-bold text-slate-100 text-sm">
                        {activeCell.customers.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Realized Revenue</span>
                      <span className="font-bold text-slate-100 text-sm">
                        R$ {(activeCell.revenue / 1e6).toFixed(2)}M
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
                    Recommended Automated Playbook:
                  </h4>
                  {activeCell.r >= 4 && activeCell.f >= 4 ? (
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-200">
                      ⭐ <b>VIP Concierge Strategy:</b> Enroll in exclusive VIP club. Offer zero freight thresholds and early product launch access.
                    </div>
                  ) : activeCell.r <= 2 && activeCell.customers > 1000 ? (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-200">
                      ⚠️ <b>Win-Back Re-Activation:</b> Trigger automated n8n webhook with 15% discount code before 180 days mark to recover dormant spenders.
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-200">
                      🚀 <b>Nurture Cross-Sell:</b> Send personalized product recommendation email series based on category history at Day 45.
                    </div>
                  )}
                </div>

                <div className="p-3 bg-[#0B0F19] rounded-lg border border-[#1F293D] text-[11px] text-slate-400">
                  Cadence: Automated trigger configured in <code>n8n/03_customer_segment_reporting.json</code>
                </div>
              </div>
            ) : null}
          </Card>
        </div>
      </div>

      {/* Row 2: Comprehensive RFM Economics Table */}
      <Card
        title="Complete Customer RFM Segment Economics"
        subtitle="Full statistical breakdown of 93,358 unique customers across all 8 segments"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0B0F19] text-slate-400 uppercase font-semibold border-b border-[#1F293D]">
              <tr>
                <th className="py-3 px-4">Segment</th>
                <th className="py-3 px-4 text-right">Customers</th>
                <th className="py-3 px-4 text-right">Customer %</th>
                <th className="py-3 px-4 text-right">Avg Recency</th>
                <th className="py-3 px-4 text-right">Avg Freq</th>
                <th className="py-3 px-4 text-right">Avg Spend</th>
                <th className="py-3 px-4 text-right">Total Revenue</th>
                <th className="py-3 px-4 text-right">Rev %</th>
                <th className="py-3 px-4">Strategic Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F293D]">
              {segments.map((s) => (
                <tr key={s.customer_segment} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    {s.customer_segment}
                  </td>
                  <td className="py-3 px-4 text-right">{s.total_customers.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-mono">{s.customer_share_pct.toFixed(2)}%</td>
                  <td className="py-3 px-4 text-right font-mono">{s.avg_recency_days.toFixed(1)}d</td>
                  <td className="py-3 px-4 text-right font-mono">{s.avg_frequency.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right font-semibold text-slate-100">
                    R$ {s.avg_monetary_value.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-100">
                    R$ {(s.total_segment_revenue / 1e6).toFixed(2)}M
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-0.5 rounded font-semibold bg-blue-500/10 text-blue-400">
                      {s.revenue_share_pct.toFixed(2)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {s.customer_segment === 'Potential Loyalists'
                      ? 'Cross-sell category bundles'
                      : s.customer_segment === 'Cannot Lose Them'
                      ? 'Aggressive discount win-back'
                      : s.customer_segment === 'Champions'
                      ? 'VIP concierge & early access'
                      : s.customer_segment === 'At Risk'
                      ? 'Day 45 re-engagement push'
                      : 'Automated email reactivation'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

