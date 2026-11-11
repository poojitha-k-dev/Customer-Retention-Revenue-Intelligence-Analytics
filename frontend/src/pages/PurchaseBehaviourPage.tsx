import React from 'react';
import {
  ShoppingBag,
  Clock,
  CreditCard,
  Truck,
  Star,
  AlertOctagon,
  CheckCircle2,
  TrendingDown,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { KPICard } from '../components/common/KPICard';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { CategoryMetric } from '../types';

interface PurchaseBehaviourProps {
  categories: CategoryMetric[];
}

const PAYMENT_METHODS = [
  { name: 'Credit Card', value: 12542000, share: 76.5, color: '#3B82F6' },
  { name: 'Boleto (Bancario)', value: 2869000, share: 19.4, color: '#06B6D4' },
  { name: 'Voucher', value: 379000, share: 2.6, color: '#8B5CF6' },
  { name: 'Debit Card', value: 217000, share: 1.5, color: '#10B981' },
];

const INSTALLMENT_DIST = [
  { installments: '1x (Full)', orders: 52556, pct: 50.8 },
  { installments: '2x - 3x', orders: 22894, pct: 22.1 },
  { installments: '4x - 6x', orders: 15480, pct: 15.0 },
  { installments: '7x - 10x', orders: 11840, pct: 11.4 },
  { installments: '10x+', orders: 716, pct: 0.7 },
];

const LOGISTICS_IMPACT = [
  { status: 'On-Time / Early Delivery', avgReview: 4.29, repeatRate: 3.12, orders: 88652, color: '#10B981' },
  { status: 'Delayed Delivery (>Estimated)', avgReview: 2.57, repeatRate: 2.69, orders: 7826, color: '#EF4444' },
];

const REPURCHASE_INTERVALS = [
  { range: '0 - 30 Days', count: 680, pct: 24.3 },
  { range: '31 - 60 Days', count: 590, pct: 21.1 },
  { range: '61 - 90 Days', count: 460, pct: 16.4 },
  { range: '91 - 180 Days', count: 620, pct: 22.1 },
  { range: '180+ Days', count: 451, pct: 16.1 },
];

export const PurchaseBehaviourPage: React.FC<PurchaseBehaviourProps> = ({ categories }) => {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Median Repurchase Cadence"
          value="79.2 Days"
          subtitle="Time between 1st & 2nd order"
          icon={Clock}
          accent="blue"
        />
        <KPICard
          title="Delivery Delay CSAT Drop"
          value="-1.72 ★"
          subtitle="4.29 ★ on-time vs 2.57 ★ delayed"
          icon={TrendingDown}
          accent="rose"
        />
        <KPICard
          title="Delayed Repeat Reduction"
          value="-13.8%"
          subtitle="Late 1st order lowers 2nd purchase"
          icon={AlertOctagon}
          accent="amber"
        />
        <KPICard
          title="Credit Card Dominance"
          value="76.5%"
          subtitle="Average 3.2 installments"
          icon={CreditCard}
          accent="purple"
        />
      </div>

      {/* Row 1: Inter-Purchase Gap + Logistics CSAT Collapse */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Inter-Purchase Window */}
        <div className="lg:col-span-6">
          <Card
            title="Days Between 1st and 2nd Order (Repurchase Interval)"
            subtitle="Distribution of re-purchase timing for 2,801 repeat customers"
            action={<Badge variant="cyan">Day 30-75 Peak</Badge>}
          >
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={REPURCHASE_INTERVALS} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F293D" vertical={false} />
                  <XAxis dataKey="range" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#1F293D', borderRadius: '8px' }}
                    formatter={(val: any, name: any, item: any) => [
                      `${val} customers (${item.payload.pct}%)`,
                      'Frequency',
                    ]}
                  />
                  <Bar dataKey="count" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 p-3 bg-[#0B0F19] border border-[#1F293D] rounded-lg text-xs text-slate-300">
              🎯 <b>Automated Retention Window:</b> 45.4% of all repeat orders occur within the first 60 days. Initiating automated re-engagement workflows at Day 45 captures customers right before the inflection point.
            </div>
          </Card>
        </div>

        {/* Logistics Delay Impact on CSAT & Retention */}
        <div className="lg:col-span-6">
          <Card
            title="Logistics Punctuality vs CSAT Rating & Retention Rate"
            subtitle="Comparing on-time deliveries against delayed orders (7,826 delayed orders)"
            action={<Badge variant="rose">Critical Bottleneck</Badge>}
          >
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={LOGISTICS_IMPACT} margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F293D" vertical={false} />
                  <XAxis dataKey="status" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} domain={[0, 5]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#1F293D', borderRadius: '8px' }}
                    formatter={(val: any) => [`${Number(val).toFixed(2)} ★`, 'Average Review Rating']}
                  />
                  <Bar dataKey="avgReview" radius={[4, 4, 0, 0]}>
                    {LOGISTICS_IMPACT.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-[#1F293D] text-xs">
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <span className="text-emerald-400 font-bold block">On-Time Orders (91.9%)</span>
                <span className="text-slate-200">4.29 ★ CSAT | 3.12% Repeat Rate</span>
              </div>
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                <span className="text-rose-400 font-bold block">Delayed Deliveries (8.1%)</span>
                <span className="text-slate-200">2.57 ★ CSAT | 2.69% Repeat Rate (-13.8%)</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Row 2: Payment Methods & Installment Habits */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <Card
            title="Payment Method Breakdown & Revenue Share"
            subtitle="Customer preferred settlement options"
          >
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={PAYMENT_METHODS}
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {PAYMENT_METHODS.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#1F293D', borderRadius: '8px' }}
                    formatter={(val: any, name: any, item: any) => [
                      `R$ ${(Number(val) / 1e6).toFixed(2)}M (${item.payload.share}%)`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-[#1F293D] text-xs">
              {PAYMENT_METHODS.map((p) => (
                <div key={p.name} className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                    {p.name}
                  </span>
                  <span className="font-semibold text-slate-100">{p.share}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-6">
          <Card
            title="Credit Card Installments Usage"
            subtitle="Brazilian consumer financing adoption: 50.8% pay in 1x, 49.2% split installments"
          >
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={INSTALLMENT_DIST} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F293D" vertical={false} />
                  <XAxis dataKey="installments" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#1F293D', borderRadius: '8px' }}
                    formatter={(val: any, name: any, item: any) => [
                      `${Number(val).toLocaleString()} orders (${item.payload.pct}%)`,
                      'Orders',
                    ]}
                  />
                  <Bar dataKey="orders" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 pt-2 border-t border-[#1F293D] text-xs text-slate-400">
              Orders financed across 5+ installments average <b>R$ 284.10</b> in basket size (+78% higher than 1x cash orders).
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
