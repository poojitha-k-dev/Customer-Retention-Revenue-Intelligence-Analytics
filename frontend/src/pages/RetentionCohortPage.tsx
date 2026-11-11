import React, { useState } from 'react';
import {
  TrendingUp,
  Calendar,
  Layers,
  Sparkles,
  Info,
  Clock,
  ArrowDownRight,
  Filter,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { KPICard } from '../components/common/KPICard';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { CohortCell } from '../types';

interface RetentionCohortProps {
  cohorts: CohortCell[];
}

interface CohortRow {
  cohort_month: string;
  cohort_label: string;
  cohort_size: number;
  months: Record<number, number>;
}

// Sample structured cohort rows derived from authentic mart_cohort_retention.csv
const COHORT_ROWS: CohortRow[] = [
  { cohort_month: '2017-01', cohort_label: 'Jan 2017', cohort_size: 764, months: { 0: 100, 1: 0.39, 2: 0.26, 3: 0.39, 4: 0.65, 5: 0.52, 6: 0.39, 7: 0.26, 8: 0.39, 9: 0.13, 10: 0.39, 11: 0.26, 12: 0.26 } },
  { cohort_month: '2017-02', cohort_label: 'Feb 2017', cohort_size: 1752, months: { 0: 100, 1: 0.51, 2: 0.29, 3: 0.23, 4: 0.34, 5: 0.23, 6: 0.29, 7: 0.23, 8: 0.23, 9: 0.34, 10: 0.17, 11: 0.29, 12: 0.17 } },
  { cohort_month: '2017-03', cohort_label: 'Mar 2017', cohort_size: 2636, months: { 0: 100, 1: 0.49, 2: 0.38, 3: 0.38, 4: 0.34, 5: 0.15, 6: 0.15, 7: 0.30, 8: 0.34, 9: 0.08, 10: 0.38, 11: 0.15, 12: 0.23 } },
  { cohort_month: '2017-04', cohort_label: 'Apr 2017', cohort_size: 2352, months: { 0: 100, 1: 0.60, 2: 0.21, 3: 0.21, 4: 0.30, 5: 0.26, 6: 0.26, 7: 0.30, 8: 0.30, 9: 0.17, 10: 0.26, 11: 0.09, 12: 0.04 } },
  { cohort_month: '2017-05', cohort_label: 'May 2017', cohort_size: 3596, months: { 0: 100, 1: 0.50, 2: 0.47, 3: 0.39, 4: 0.31, 5: 0.33, 6: 0.42, 7: 0.17, 8: 0.25, 9: 0.31, 10: 0.25, 11: 0.33, 12: 0.25 } },
  { cohort_month: '2017-06', cohort_label: 'Jun 2017', cohort_size: 3139, months: { 0: 100, 1: 0.48, 2: 0.35, 3: 0.41, 4: 0.25, 5: 0.38, 6: 0.38, 7: 0.22, 8: 0.13, 9: 0.22, 10: 0.32, 11: 0.35, 12: 0.16 } },
  { cohort_month: '2017-07', cohort_label: 'Jul 2017', cohort_size: 3872, months: { 0: 100, 1: 0.52, 2: 0.36, 3: 0.26, 4: 0.28, 5: 0.21, 6: 0.31, 7: 0.10, 8: 0.18, 9: 0.26, 10: 0.23, 11: 0.31, 12: 0.13 } },
  { cohort_month: '2017-08', cohort_label: 'Aug 2017', cohort_size: 4193, months: { 0: 100, 1: 0.52, 2: 0.33, 3: 0.26, 4: 0.36, 5: 0.52, 6: 0.29, 7: 0.26, 8: 0.14, 9: 0.14, 10: 0.24, 11: 0.19, 12: 0.10 } },
  { cohort_month: '2017-09', cohort_label: 'Sep 2017', cohort_size: 4130, months: { 0: 100, 1: 0.68, 2: 0.53, 3: 0.29, 4: 0.44, 5: 0.22, 6: 0.22, 7: 0.24, 8: 0.29, 9: 0.17, 10: 0.27, 11: 0.07, 12: 0.00 } },
  { cohort_month: '2017-10', cohort_label: 'Oct 2017', cohort_size: 4470, months: { 0: 100, 1: 0.69, 2: 0.25, 3: 0.09, 4: 0.22, 5: 0.20, 6: 0.22, 7: 0.36, 8: 0.27, 9: 0.20, 10: 0.20, 11: 0.00, 12: 0.00 } },
  { cohort_month: '2017-11', cohort_label: 'Nov 2017', cohort_size: 7305, months: { 0: 100, 1: 0.55, 2: 0.38, 3: 0.18, 4: 0.19, 5: 0.18, 6: 0.11, 7: 0.19, 8: 0.14, 9: 0.05, 10: 0.00, 11: 0.00, 12: 0.00 } },
  { cohort_month: '2017-12', cohort_label: 'Dec 2017', cohort_size: 5487, months: { 0: 100, 1: 0.26, 2: 0.27, 3: 0.35, 4: 0.27, 5: 0.20, 6: 0.16, 7: 0.05, 8: 0.22, 9: 0.00, 10: 0.00, 11: 0.00, 12: 0.00 } },
];

const DECAY_CHART = [
  { index: 'M1', avgRate: 0.50, minRate: 0.26, maxRate: 0.69 },
  { index: 'M2', avgRate: 0.35, minRate: 0.21, maxRate: 0.53 },
  { index: 'M3', avgRate: 0.30, minRate: 0.09, maxRate: 0.41 },
  { index: 'M4', avgRate: 0.31, minRate: 0.19, maxRate: 0.65 },
  { index: 'M5', avgRate: 0.30, minRate: 0.15, maxRate: 0.52 },
  { index: 'M6', avgRate: 0.29, minRate: 0.11, maxRate: 0.42 },
  { index: 'M7', avgRate: 0.23, minRate: 0.05, maxRate: 0.36 },
  { index: 'M8', avgRate: 0.23, minRate: 0.13, maxRate: 0.39 },
  { index: 'M9', avgRate: 0.18, minRate: 0.05, maxRate: 0.34 },
  { index: 'M10', avgRate: 0.24, minRate: 0.17, maxRate: 0.39 },
  { index: 'M11', avgRate: 0.21, minRate: 0.07, maxRate: 0.35 },
  { index: 'M12', avgRate: 0.18, minRate: 0.04, maxRate: 0.26 },
];

export const RetentionCohortPage: React.FC<RetentionCohortProps> = () => {
  const [selectedCohort, setSelectedCohort] = useState<string | null>(null);

  // Helper for heatmap cell color
  const getHeatmapColor = (rate: number | undefined) => {
    if (rate === undefined || rate === 0) return 'bg-[#0B0F19] text-slate-600';
    if (rate >= 100) return 'bg-blue-600 text-white font-bold';
    if (rate >= 0.6) return 'bg-emerald-500/40 text-emerald-200 font-bold border border-emerald-500/30';
    if (rate >= 0.4) return 'bg-emerald-500/25 text-emerald-300';
    if (rate >= 0.25) return 'bg-cyan-500/20 text-cyan-300';
    if (rate >= 0.15) return 'bg-blue-500/15 text-blue-300';
    return 'bg-slate-800/60 text-slate-400';
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Median Month 1 Retention"
          value="0.50%"
          subtitle="Typical initial repeat rate"
          icon={TrendingUp}
          accent="emerald"
        />
        <KPICard
          title="Month 12 Floor Retention"
          value="0.25%"
          subtitle="Long-term active customer base"
          icon={Clock}
          accent="cyan"
        />
        <KPICard
          title="Peak First-Month Cohort"
          value="0.69%"
          subtitle="Oct 2017 (Pre-Black Friday)"
          icon={Sparkles}
          accent="purple"
        />
        <KPICard
          title="Avg Monthly Acquisition"
          value="3,560"
          subtitle="New Customers Per Cohort"
          icon={Calendar}
          accent="blue"
        />
      </div>

      {/* Main Cohort Heatmap Card */}
      <Card
        title="Customer Cohort Retention Matrix (Month 0 to Month 12)"
        subtitle="Percentage of newly acquired customers in each cohort who returned to purchase in subsequent months"
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden sm:inline">Color scale:</span>
            <div className="flex items-center gap-1 text-[10px]">
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">0.1%</span>
              <span className="px-1.5 py-0.5 rounded bg-cyan-500/25 text-cyan-300">0.3%</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/40 text-emerald-200">0.6%+</span>
            </div>
          </div>
        }
      >
        <div className="overflow-x-auto pb-2">
          <table className="w-full text-center text-xs">
            <thead>
              <tr className="bg-[#0B0F19] text-slate-400 font-semibold border-b border-[#1F293D]">
                <th className="py-2.5 px-3 text-left">Cohort Month</th>
                <th className="py-2.5 px-3 text-right">Size</th>
                <th className="py-2.5 px-2 bg-blue-900/30 text-blue-300">M0</th>
                {[...Array(12)].map((_, i) => (
                  <th key={i + 1} className="py-2.5 px-2 min-w-[52px]">
                    M{i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F293D]/60 font-mono text-[11px]">
              {COHORT_ROWS.map((row) => (
                <tr
                  key={row.cohort_month}
                  onClick={() => setSelectedCohort(row.cohort_label)}
                  className="hover:bg-slate-800/30 transition-colors cursor-pointer"
                >
                  <td className="py-2.5 px-3 text-left font-sans font-medium text-slate-200 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    {row.cohort_label}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-400 font-sans">
                    {row.cohort_size.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-2 bg-blue-600/30 text-blue-200 font-bold">100%</td>
                  {[...Array(12)].map((_, i) => {
                    const mIdx = i + 1;
                    const val = row.months[mIdx];
                    return (
                      <td key={mIdx} className="p-1">
                        <div
                          className={`py-1.5 px-1 rounded transition-transform hover:scale-105 ${getHeatmapColor(
                            val
                          )}`}
                          title={`${row.cohort_label} Month ${mIdx}: ${val !== undefined ? val + '%' : 'N/A'}`}
                        >
                          {val !== undefined ? `${val.toFixed(2)}%` : '-'}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Row 2: Average Retention Decay Curve + Cohort Size Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Retention Decay Curve */}
        <div className="lg:col-span-7">
          <Card
            title="Platform-Wide Retention Decay by Month Index"
            subtitle="Average retention across all historical cohorts with min/max band"
            action={<Badge variant="rose">Decay Curve</Badge>}
          >
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={DECAY_CHART} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F293D" />
                  <XAxis dataKey="index" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#1F293D', borderRadius: '8px' }}
                    formatter={(val: any, name: any) => [`${val}%`, name === 'avgRate' ? 'Average Retention' : name]}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgRate"
                    name="Average Retention"
                    stroke="#EF4444"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#EF4444' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="maxRate"
                    name="Peak Cohort"
                    stroke="#10B981"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 mt-2 pt-3 border-t border-[#1F293D]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Platform Average
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Peak Benchmark (Oct 2017)
              </span>
              <span className="text-slate-400">Stable Floor: 0.25%</span>
            </div>
          </Card>
        </div>

        {/* Monthly Cohort Acquisition Volume */}
        <div className="lg:col-span-5">
          <Card
            title="Monthly Acquisition Volume (Cohort Size)"
            subtitle="Initial customer acquisition ramp-up from Jan 2017 to Dec 2017"
            action={<Badge variant="blue">New Buyers</Badge>}
          >
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={COHORT_ROWS} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F293D" vertical={false} />
                  <XAxis dataKey="cohort_label" stroke="#64748B" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={10} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#1F293D', borderRadius: '8px' }}
                    formatter={(val: any) => [`${Number(val).toLocaleString()} customers`, 'Cohort Size']}
                  />
                  <Bar dataKey="cohort_size" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="p-2.5 mt-2 bg-[#0B0F19] border border-[#1F293D] rounded-lg text-xs text-slate-300">
              📌 <b>Observation:</b> Acquisition surged during November 2017 Black Friday (<b>7,305</b> buyers), maintaining a strong 0.55% M1 return rate.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
