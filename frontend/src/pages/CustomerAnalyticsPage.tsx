import React from 'react';
import {
  Users,
  Repeat,
  MapPin,
  TrendingUp,
  ShoppingBag,
  Clock,
  Sparkles,
  Layers,
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
import { KPISummary } from '../types';

interface CustomerAnalyticsProps {
  kpis: KPISummary;
}

const STATE_DISTRIBUTION = [
  { state: 'SP (Sao Paulo)', customers: 39591, revenue: 5768700, repeatRate: 3.4 },
  { state: 'RJ (Rio de Janeiro)', customers: 12349, revenue: 2095300, repeatRate: 2.8 },
  { state: 'MG (Minas Gerais)', customers: 11189, revenue: 1845200, repeatRate: 2.9 },
  { state: 'RS (Rio Grande do Sul)', customers: 5240, revenue: 864500, repeatRate: 2.6 },
  { state: 'PR (Parana)', customers: 4860, revenue: 791400, repeatRate: 2.7 },
  { state: 'SC (Santa Catarina)', customers: 3519, revenue: 598200, repeatRate: 2.5 },
  { state: 'BA (Bahia)', customers: 3256, revenue: 597100, repeatRate: 2.4 },
  { state: 'DF (Distrito Federal)', customers: 2064, revenue: 349200, repeatRate: 3.1 },
  { state: 'ES (Espirito Santo)', customers: 1968, revenue: 317800, repeatRate: 2.3 },
  { state: 'GO (Goias)', customers: 1951, revenue: 341500, repeatRate: 2.5 },
];

const ORDER_FREQUENCY_DIST = [
  { orders: '1 Order', count: 90557, pct: 97.0, color: '#475569' },
  { orders: '2 Orders', count: 2573, pct: 2.76, color: '#3B82F6' },
  { orders: '3 Orders', count: 188, pct: 0.20, color: '#06B6D4' },
  { orders: '4+ Orders', count: 40, pct: 0.04, color: '#10B981' },
];

const SPEND_TIERS = [
  { tier: '< R$ 100', customers: 43210, revenue: 2592000, avgOrders: 1.01 },
  { tier: 'R$ 100 - R$ 250', customers: 31840, revenue: 5094000, avgOrders: 1.03 },
  { tier: 'R$ 250 - R$ 500', customers: 12450, revenue: 4233000, avgOrders: 1.06 },
  { tier: 'R$ 500 - R$ 1,000', customers: 4120, revenue: 2719000, avgOrders: 1.12 },
  { tier: '> R$ 1,000', customers: 1738, revenue: 2581000, avgOrders: 1.25 },
];

export const CustomerAnalyticsPage: React.FC<CustomerAnalyticsProps> = ({ kpis }) => {
  return (
    <div className="space-y-6">
      {/* Header Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Unique Buyers"
          value={kpis.unique_customers.toLocaleString()}
          subtitle="96,478 Qualifying Orders"
          icon={Users}
          accent="blue"
        />
        <KPICard
          title="Multi-Order Repeat Buyers"
          value={kpis.repeat_customers.toLocaleString()}
          subtitle="3.00% Repeat Conversion"
          icon={Repeat}
          accent="emerald"
        />
        <KPICard
          title="Repeat Spend Premium"
          value="+91.95%"
          subtitle="R$ 308.53 vs R$ 160.73"
          icon={TrendingUp}
          accent="purple"
        />
        <KPICard
          title="Avg Days Inactive"
          value="242.0 Days"
          subtitle="Historical Data Snapshot"
          icon={Clock}
          accent="amber"
        />
      </div>

      {/* Row 1: Frequency Breakdown + Spend Tier Economics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Order Frequency Breakdown */}
        <div className="lg:col-span-5">
          <Card
            title="Customer Order Frequency Distribution"
            subtitle="97% of customer base makes a single purchase during the observation window"
            action={<Badge variant="blue">Olist Distribution</Badge>}
          >
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ORDER_FREQUENCY_DIST} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F293D" vertical={false} />
                  <XAxis dataKey="orders" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#1F293D', borderRadius: '8px' }}
                    formatter={(val: any, name: any, item: any) => [
                      `${Number(val).toLocaleString()} customers (${item.payload.pct}%)`,
                      'Volume',
                    ]}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {ORDER_FREQUENCY_DIST.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 p-3 bg-[#0B0F19] border border-[#1F293D] rounded-lg text-xs text-slate-300">
              💡 <b>Strategic Observation:</b> While 97% of buyers only bought once, the 3% repeat cohort generates <b>R$ 308.53</b> in LTV (+92%), highlighting that acquisition is the main platform cost and retention yields outsized marginal profit.
            </div>
          </Card>
        </div>

        {/* Spend Tiers Economics */}
        <div className="lg:col-span-7">
          <Card
            title="Customer Spend Tiers & Purchase Elasticity"
            subtitle="Distribution of lifetime spend and average order counts per tier"
            action={<Badge variant="purple">Lifetime Spend</Badge>}
          >
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SPEND_TIERS} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F293D" />
                  <XAxis dataKey="tier" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `R$${(v / 1e6).toFixed(1)}M`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#1F293D', borderRadius: '8px' }}
                    formatter={(val: any, name: any, item: any) => [
                      `R$ ${(Number(val) / 1e6).toFixed(2)}M (${item.payload.customers.toLocaleString()} cust)`,
                      'Total Spend',
                    ]}
                  />
                  <Bar dataKey="revenue" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-[#1F293D] text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Mass Market (&lt;R$250)</span>
                <span className="font-semibold text-slate-200">75,050 Buyers (80.4%)</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Mid-Tier (R$250-1k)</span>
                <span className="font-semibold text-slate-200">16,570 Buyers (17.7%)</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">High Net Worth (&gt;R$1k)</span>
                <span className="font-semibold text-emerald-400">1,738 Buyers (1.9%)</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Row 2: Geographic Demand & Top States */}
      <Card
        title="Top 10 Brazilian States: Geographic Customer Density & Repeat Rates"
        subtitle="Regional revenue contribution and repeat purchase conversion rates"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0B0F19] text-slate-400 uppercase font-semibold border-b border-[#1F293D]">
              <tr>
                <th className="py-3 px-4">State</th>
                <th className="py-3 px-4">Unique Customers</th>
                <th className="py-3 px-4">Customer Share</th>
                <th className="py-3 px-4">Gross Revenue</th>
                <th className="py-3 px-4">Repeat Rate</th>
                <th className="py-3 px-4">Market Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F293D]">
              {STATE_DISTRIBUTION.map((st) => (
                <tr key={st.state} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    {st.state}
                  </td>
                  <td className="py-3 px-4">{st.customers.toLocaleString()}</td>
                  <td className="py-3 px-4">{((st.customers / 93358) * 100).toFixed(1)}%</td>
                  <td className="py-3 px-4 font-semibold text-slate-100">
                    R$ {(st.revenue / 1e6).toFixed(2)}M
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
                      {st.repeatRate}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {st.customers > 10000 ? (
                      <Badge variant="blue">Primary Hub</Badge>
                    ) : st.customers > 4000 ? (
                      <Badge variant="cyan">Growth Tier</Badge>
                    ) : (
                      <Badge variant="slate">Regional</Badge>
                    )}
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
