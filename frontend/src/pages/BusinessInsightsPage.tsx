import React, { useState } from 'react';
import {
  Lightbulb,
  DollarSign,
  TrendingUp,
  Target,
  ShieldAlert,
  Award,
  Sparkles,
  ArrowRight,
  Calculator,
  CheckCircle2,
  Workflow,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { KPICard } from '../components/common/KPICard';

export const BusinessInsightsPage: React.FC = () => {
  // Interactive ROI Calculator State
  const [repeatLift, setRepeatLift] = useState(1.0); // +1% repeat rate
  const [avgBasket, setAvgBasket] = useState(160); // R$ 160 AOV

  // Sizing formula: 93,358 total customers * (repeatLift / 100) * avgBasket
  const incrementalRepeatBuyers = Math.round(93358 * (repeatLift / 100));
  const incrementalRevenue = incrementalRepeatBuyers * avgBasket;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-900/30 via-slate-900 to-blue-900/30 border border-purple-500/20 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
            Strategic Decision Support
          </span>
          <h2 className="text-lg font-bold text-white mt-1">
            Data-Backed Retention & Revenue Growth Recommendations
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Prioritized strategic initiatives derived from PostgreSQL SQL analytical marts and machine learning models.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="emerald">Total Opportunity: +R$ 909K</Badge>
        </div>
      </div>

      {/* 4 Prioritized Strategy Playbooks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Playbook 1 */}
        <Card
          title="1. Automated Day 45 Win-Back Trigger"
          subtitle="Target: Potential Loyalists & First-Time Buyers"
          glow="cyan"
          action={<Badge variant="cyan">High ROI (+R$ 288k)</Badge>}
        >
          <div className="space-y-3 text-xs">
            <p className="text-slate-300">
              <b>Core Finding:</b> The median inter-purchase interval is <b>79.2 days</b>. Waiting beyond 90 days causes the return probability to drop by over 60%.
            </p>
            <div className="p-3 bg-[#0B0F19] rounded-lg border border-[#1F293D] space-y-1.5">
              <div className="flex justify-between text-slate-200 font-semibold">
                <span>Target Customer Pool:</span>
                <span className="text-cyan-400">21,816 Customers</span>
              </div>
              <div className="flex justify-between text-slate-200 font-semibold">
                <span>Intervention Mechanism:</span>
                <span className="text-slate-300">n8n automated email + 10% voucher at Day 45</span>
              </div>
              <div className="flex justify-between text-slate-200 font-semibold">
                <span>Estimated Revenue Lift:</span>
                <span className="text-emerald-400 font-bold">+R$ 288,000 / year</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <Workflow className="w-3.5 h-3.5 text-cyan-400" />
              Configured in <code>n8n/02_customer_retention_monitoring.json</code>
            </div>
          </div>
        </Card>

        {/* Playbook 2 */}
        <Card
          title="2. Logistics SLA Guarantee & Delay Mitigation"
          subtitle="Target: High-Risk Shipping Zones (ES, RJ, BA)"
          glow="purple"
          action={<Badge variant="purple">+R$ 380k Protected</Badge>}
        >
          <div className="space-y-3 text-xs">
            <p className="text-slate-300">
              <b>Core Finding:</b> Delayed deliveries suffer a <b>-1.72 ★ CSAT drop</b> (4.29 ★ to 2.57 ★) and incur a <b>13.8% reduction</b> in repeat purchase propensity.
            </p>
            <div className="p-3 bg-[#0B0F19] rounded-lg border border-[#1F293D] space-y-1.5">
              <div className="flex justify-between text-slate-200 font-semibold">
                <span>Orders Affected by Delay:</span>
                <span className="text-rose-400">7,826 Orders (8.11%)</span>
              </div>
              <div className="flex justify-between text-slate-200 font-semibold">
                <span>Recommended Action:</span>
                <span className="text-slate-300">Seller penalty SLAs & proactive delayed delivery vouchers</span>
              </div>
              <div className="flex justify-between text-slate-200 font-semibold">
                <span>Retention Churn Prevented:</span>
                <span className="text-emerald-400 font-bold">~1,080 Repeat Buyers Protected</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Automated delay alert triggers in real time via PostgreSQL log mart
            </div>
          </div>
        </Card>

        {/* Playbook 3 */}
        <Card
          title="3. High-Value Inactive Spender Recovery"
          subtitle="Target: Cannot Lose Them (13,754 buyers)"
          glow="blue"
          action={<Badge variant="blue">+R$ 212k Recoverable</Badge>}
        >
          <div className="space-y-3 text-xs">
            <p className="text-slate-300">
              <b>Core Finding:</b> The "Cannot Lose Them" segment contributed <b>R$ 4.24M</b> historically (avg spend R$ 308.06) but has been dormant for over 180 days.
            </p>
            <div className="p-3 bg-[#0B0F19] rounded-lg border border-[#1F293D] space-y-1.5">
              <div className="flex justify-between text-slate-200 font-semibold">
                <span>Dormant Capital at Stake:</span>
                <span className="text-amber-400">R$ 4,237,057.24</span>
              </div>
              <div className="flex justify-between text-slate-200 font-semibold">
                <span>Recommended Tactic:</span>
                <span className="text-slate-300">Tiered 15% discount + free freight re-activation push</span>
              </div>
              <div className="flex justify-between text-slate-200 font-semibold">
                <span>Targeted Recovery Conversion:</span>
                <span className="text-emerald-400 font-bold">5% Re-activation = +R$ 212,000</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <Target className="w-3.5 h-3.5 text-blue-400" />
              Workflow ready in <code>n8n/03_customer_segment_reporting.json</code>
            </div>
          </div>
        </Card>

        {/* Playbook 4 */}
        <Card
          title="4. VIP Loyalty Program for Champions"
          subtitle="Target: 1,805 Champions & Loyal Customers"
          glow="none"
          action={<Badge variant="emerald">+R$ 145k Expansion</Badge>}
        >
          <div className="space-y-3 text-xs">
            <p className="text-slate-300">
              <b>Core Finding:</b> Champions order an average of <b>3.24 times</b> and spend <b>R$ 498.24</b> (3.2x platform average), while generating virtually zero customer support tickets.
            </p>
            <div className="p-3 bg-[#0B0F19] rounded-lg border border-[#1F293D] space-y-1.5">
              <div className="flex justify-between text-slate-200 font-semibold">
                <span>VIP Customer Base:</span>
                <span className="text-purple-400">1,805 High-Value Advocates</span>
              </div>
              <div className="flex justify-between text-slate-200 font-semibold">
                <span>Loyalty Perks:</span>
                <span className="text-slate-300">VIP concierge support, early access to sales, zero freight</span>
              </div>
              <div className="flex justify-between text-slate-200 font-semibold">
                <span>Incremental LTV Gain:</span>
                <span className="text-emerald-400 font-bold">+15% Order Frequency = +R$ 145,000</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              RetainIQ VIP Tier tagging automated via RFM scoring
            </div>
          </div>
        </Card>
      </div>

      {/* Interactive Retention Lift & ROI Sizing Simulator */}
      <Card
        title="Interactive Retention ROI & Revenue Growth Simulator"
        subtitle="Estimate the gross financial impact of shifting platform repeat purchase rates"
        action={<Badge variant="emerald">Live Calculator</Badge>}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-slate-300">Target Repeat Rate Lift:</span>
                <span className="text-blue-400 font-mono font-bold">+{repeatLift.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="5.0"
                step="0.1"
                value={repeatLift}
                onChange={(e) => setRepeatLift(parseFloat(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>+0.2% (Conservative)</span>
                <span>+2.5% (Moderate)</span>
                <span>+5.0% (Aggressive)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-slate-300">Average Basket Size (AOV):</span>
                <span className="text-purple-400 font-mono font-bold">R$ {avgBasket}</span>
              </div>
              <input
                type="range"
                min="100"
                max="400"
                step="10"
                value={avgBasket}
                onChange={(e) => setAvgBasket(parseInt(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>R$ 100</span>
                <span>R$ 250</span>
                <span>R$ 400</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-[#0B0F19] border border-[#1F293D] rounded-xl p-6">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Projected Annualized Return
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[#111827] border border-[#1F293D] rounded-lg">
                <span className="text-[11px] text-slate-400 block">Incremental Repeat Buyers</span>
                <span className="text-2xl font-extrabold text-cyan-400">
                  +{incrementalRepeatBuyers.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">New multi-order customers</span>
              </div>
              <div className="p-4 bg-[#111827] border border-[#1F293D] rounded-lg">
                <span className="text-[11px] text-slate-400 block">Gross Realized Sales</span>
                <span className="text-2xl font-extrabold text-emerald-400">
                  +R$ {(incrementalRevenue / 1000).toFixed(0)}k
                </span>
                <span className="text-[10px] text-emerald-400/80 mt-1 block">Incremental gross profit</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[#1F293D] text-[11px] text-slate-400">
              💡 Raising Olist's repeat rate from <b>3.00%</b> to <b>{(3.0 + repeatLift).toFixed(1)}%</b> unlocks <b>+R$ {(incrementalRevenue / 1e6).toFixed(2)}M</b> in high-margin revenue with near-zero additional customer acquisition cost (CAC).
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
