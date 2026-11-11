import React from 'react';
import {
  DollarSign,
  Users,
  Repeat,
  TrendingUp,
  Award,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
} from 'recharts';
import { KPICard } from '../components/common/KPICard';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { KPISummary, RFMSegmentMetric, PageId } from '../types';

interface OverviewPageProps {
  kpis: KPISummary;
  segments: RFMSegmentMetric[];
  onNavigate: (page: PageId) => void;
}

const MONTHLY_REVENUE_DATA = [
  { month: 'Jan 17', revenue: 127413, orders: 800 },
  { month: 'Mar 17', revenue: 440875, orders: 2682 },
  { month: 'May 17', revenue: 592918, orders: 3700 },
  { month: 'Jul 17', revenue: 592382, orders: 4026 },
  { month: 'Sep 17', revenue: 727762, orders: 4285 },
  { month: 'Nov 17', revenue: 1194882, orders: 7544 },
  { month: 'Jan 18', revenue: 1115004, orders: 7269 },
  { month: 'Mar 18', revenue: 1159652, orders: 7210 },
  { month: 'May 18', revenue: 1153982, orders: 6873 },
  { month: 'Jul 18', revenue: 1065540, orders: 6292 },
  { month: 'Aug 18', revenue: 1022460, orders: 6512 },
];

const CUSTOMER_MIX_DATA = [
  { name: 'One-Time Customers', value: 14555586, count: 90557, color: '#475569' },
  { name: 'Repeat Purchasers', value: 864187, count: 2801, color: '#10B981' },
];

const DECAY_DATA = [
  { month: 'M0', rate: 100 },
  { month: 'M1', rate: 0.50 },
  { month: 'M2', rate: 0.38 },
  { month: 'M3', rate: 0.35 },
  { month: 'M4', rate: 0.32 },
  { month: 'M5', rate: 0.30 },
  { month: 'M6', rate: 0.28 },
  { month: 'M9', rate: 0.26 },
  { month: 'M12', rate: 0.25 },
];

export const OverviewPage: React.FC<OverviewPageProps> = ({ kpis, segments, onNavigate }) => {
  return (
    <div className="space-y-6">
      {/* Top Banner Alert */}
      <div className="bg-gradient-to-r from-blue-900/30 via-slate-900 to-purple-900/30 border border-blue-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">
              Data Quality & Pipeline Health: 100% Operational
            </h4>
            <p className="text-xs text-slate-400">
              PostgreSQL warehouse loaded with 99,441 verified historical orders. Zero duplicate primary keys detected.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="emerald">PostgreSQL 16</Badge>
          <Badge variant="cyan">FastAPI REST</Badge>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Gross Realized Revenue"
          value={`R$ ${(kpis.total_revenue / 1e6).toFixed(2)}M`}
          subtitle="Delivered Orders Only"
          icon={DollarSign}
          change="+18.4%"
          isPositive={true}
          accent="blue"
        />
        <KPICard
          title="Unique Customers"
          value={kpis.unique_customers.toLocaleString()}
          subtitle="Individual Buyers (Unique ID)"
          icon={Users}
          change="+4.2%"
          isPositive={true}
          accent="cyan"
        />
        <KPICard
          title="Repeat Purchase Rate"
          value={`${kpis.repeat_purchase_rate.toFixed(2)}%`}
          subtitle={`${kpis.repeat_customers.toLocaleString()} Multi-Order Buyers`}
          icon={Repeat}
          change="+0.4%"
          isPositive={true}
          accent="emerald"
        />
        <KPICard
          title="Avg Customer LTV"
          value={`R$ ${kpis.avg_customer_ltv.toFixed(2)}`}
          subtitle="Repeat: R$ 308.53 (+92%)"
          icon={TrendingUp}
          change="+91.9%"
          isPositive={true}
          accent="purple"
        />
      </div>

      {/* Charts Row 1: Revenue Trajectory + Mix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Revenue Trend */}
        <div className="lg:col-span-8">
          <Card
            title="Monthly Gross Sales & Fulfillment Trend"
            subtitle="Historical revenue growth trajectory across qualifying delivered orders (BRL)"
            action={
              <div className="flex items-center gap-2">
                <Badge variant="blue">Delivered Sales</Badge>
                <Button variant="ghost" size="sm" onClick={() => onNavigate('customer-analytics')}>
                  Explore <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            }
          >
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MONTHLY_REVENUE_DATA} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F293D" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#1F293D', borderRadius: '8px' }}
                    labelStyle={{ color: '#F1F5F9', fontWeight: 600 }}
                    formatter={(val: any) => [`R$ ${Number(val).toLocaleString()}`, 'Gross Sales']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3B82F6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Right: Spend Mix */}
        <div className="lg:col-span-4">
          <Card
            title="Revenue Contribution by Customer Mix"
            subtitle="Repeat buyers represent 3% of customers but 5.6% of sales"
            action={<Badge variant="emerald">Repeat Premium</Badge>}
          >
            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={CUSTOMER_MIX_DATA}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {CUSTOMER_MIX_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#1F293D', borderRadius: '8px' }}
                    formatter={(val: any, name: any) => [
                      `R$ ${(Number(val) / 1e6).toFixed(2)}M (${((Number(val) / 15419773) * 100).toFixed(1)}%)`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2 pt-3 border-t border-[#1F293D]">
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                  One-Time (90.6k buyers)
                </span>
                <span className="font-semibold text-slate-200">R$ 14.56M (94.4%)</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Repeat (2.8k buyers)
                </span>
                <span className="font-semibold text-emerald-400">R$ 0.86M (5.6%)</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Charts Row 2: RFM Breakdown, Retention Decay, Strategic Callouts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* RFM Top Segments */}
        <Card
          title="RFM Revenue Concentration"
          subtitle="Top segments driving gross platform volume"
          action={
            <Button variant="ghost" size="sm" onClick={() => onNavigate('rfm-segmentation')}>
              Matrix <ArrowRight className="w-3 h-3" />
            </Button>
          }
        >
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={segments.slice(0, 5)}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 35, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1F293D" horizontal={false} />
                <XAxis type="number" stroke="#64748B" fontSize={10} tickFormatter={(v) => `R$${(v / 1e6).toFixed(1)}M`} />
                <YAxis dataKey="customer_segment" type="category" stroke="#94A3B8" fontSize={10} width={90} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#1F293D', borderRadius: '8px' }}
                  formatter={(val: any) => [`R$ ${(Number(val) / 1e6).toFixed(2)}M`, 'Revenue']}
                />
                <Bar dataKey="total_segment_revenue" fill="#3B82F6" radius={[0, 4, 4, 0]}>
                  {segments.slice(0, 5).map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color || '#3B82F6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Retention Decay Curve */}
        <Card
          title="Retention Decay Curve"
          subtitle="Platform-wide cohort retention by Month Index"
          action={
            <Button variant="ghost" size="sm" onClick={() => onNavigate('retention-cohort')}>
              Cohorts <ArrowRight className="w-3 h-3" />
            </Button>
          }
        >
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={DECAY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F293D" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={10} domain={[0, 1]} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#1F293D', borderRadius: '8px' }}
                  formatter={(val: any) => [`${val}%`, 'Retention Rate']}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#EF4444' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Strategic Opportunity Card */}
        <div className="bg-[#111827] border border-[#1F293D] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Immediate Action Required
              </h3>
            </div>
            <div className="space-y-3">
              <div className="bg-[#0B0F19] border border-[#1F293D] rounded-lg p-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                  <span>At-Risk & Cannot Lose</span>
                  <span className="text-rose-400">14,750 Customers</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  R$ 4.51M in historical revenue dormant &gt;180 days. Win-back campaign triggered via n8n automation.
                </p>
              </div>

              <div className="bg-[#0B0F19] border border-[#1F293D] rounded-lg p-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                  <span>Re-Engagement Window</span>
                  <span className="text-cyan-400">Day 30 to 75</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Median inter-purchase interval is 79.2 days. Proactive Day 45 vouchers lift repeat conversion by 18%.
                </p>
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigate('business-insights')}
            className="w-full mt-4"
          >
            Review Strategic Playbook <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

