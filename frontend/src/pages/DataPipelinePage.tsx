import React, { useState } from 'react';
import {
  Workflow,
  Database,
  Cpu,
  Server,
  Play,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  ExternalLink,
  Code2,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { KPICard } from '../components/common/KPICard';
import { PipelineStatus } from '../types';
import { api } from '../services/api';

interface DataPipelineProps {
  status: PipelineStatus;
  onRefresh: () => void;
}

const N8N_WORKFLOWS = [
  {
    id: '01',
    name: '01_automated_data_pipeline.json',
    trigger: 'Daily Cron (02:00 UTC)',
    action: 'Executes Python data cleaning, PostgreSQL COPY bulk reload, and SQL analytical mart generation.',
    status: 'Active',
    nodes: 8,
  },
  {
    id: '02',
    name: '02_customer_retention_monitoring.json',
    trigger: 'Every 6 Hours',
    action: 'Monitors repeat purchase rate. Triggers email/Slack alert if 30-day rolling repeat rate drops below 2.8%.',
    status: 'Active',
    nodes: 6,
  },
  {
    id: '03',
    name: '03_customer_segment_reporting.json',
    trigger: 'Weekly (Monday 08:00 UTC)',
    action: 'Pulls RFM segmentation summary, aggregates dormant "Cannot Lose Them" buyers, and delivers executive email.',
    status: 'Active',
    nodes: 7,
  },
];

const VALIDATION_CHECKS = [
  { table: 'customers', check: 'Unique Primary Key (customer_id)', result: '0 duplicates found', status: 'PASS' },
  { table: 'customers', check: 'Non-Empty Unique Identifier (customer_unique_id)', result: '0 nulls found (0.00%)', status: 'PASS' },
  { table: 'orders', check: 'Unique Primary Key (order_id)', result: '0 duplicates found', status: 'PASS' },
  { table: 'orders', check: 'Valid Purchase Timestamp Format', result: '99,441 valid ISO dates', status: 'PASS' },
  { table: 'order_items', check: 'Composite PK (order_id, order_item_id)', result: '0 duplicates found (112,650 rows)', status: 'PASS' },
  { table: 'order_items', check: 'Foreign Key (order_id -> orders)', result: '0 orphaned items found', status: 'PASS' },
  { table: 'order_items', check: 'Foreign Key (product_id -> products)', result: '0 orphaned products found', status: 'PASS' },
  { table: 'payments', check: 'Positive Value Constraint (payment_value >= 0)', result: '0 negative violations', status: 'PASS' },
  { table: 'reviews', check: 'Score Range (1 <= review_score <= 5)', result: '0 score out-of-range violations', status: 'PASS' },
  { table: 'reviews', check: 'Deduplication (1 review per order)', result: '98,673 unique reviews retained', status: 'PASS' },
];

export const DataPipelinePage: React.FC<DataPipelineProps> = ({ status, onRefresh }) => {
  const [apiKey, setApiKey] = useState('olist_secret_key_2026');
  const [isRunning, setIsRunning] = useState(false);
  const [runMessage, setRunMessage] = useState<string | null>(null);

  const handleRunPipeline = async () => {
    setIsRunning(true);
    setRunMessage(null);
    const result = await api.triggerPipeline(apiKey);
    setIsRunning(false);
    setRunMessage(result.message);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Top Architecture Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Warehouse State"
          value="PostgreSQL 16"
          subtitle="localhost:5432 / olist_db"
          icon={Database}
          accent="blue"
        />
        <KPICard
          title="Analytical Records"
          value="99,441 Rows"
          subtitle="7 relational tables bulk loaded"
          icon={Server}
          accent="cyan"
        />
        <KPICard
          title="ML Churn Model"
          value="Random Forest"
          subtitle="10-fold CV, PR-AUC evaluated"
          icon={Cpu}
          accent="purple"
        />
        <KPICard
          title="Automation Engine"
          value="n8n Workflows"
          subtitle="3 production workflows active"
          icon={Workflow}
          accent="emerald"
        />
      </div>

      {/* Row 1: Pipeline Execution Control & Architecture Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pipeline Control */}
        <div className="lg:col-span-5">
          <Card
            title="FastAPI Pipeline Control"
            subtitle="Trigger asynchronous data validation and warehouse refresh"
            action={<Badge variant="cyan">REST API</Badge>}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  API Key Authorization (X-API-Key)
                </label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B0F19] border border-[#1F293D] rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="p-3 bg-[#0B0F19] border border-[#1F293D] rounded-lg text-xs space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span>FastAPI Endpoint:</span>
                  <code className="text-cyan-400">POST /pipeline/run</code>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Last Executed:</span>
                  <span className="font-mono text-slate-400">{status.last_execution_timestamp}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>ML Model Target:</span>
                  <span className="text-purple-400 font-semibold">180-Day Repeat Propensity</span>
                </div>
              </div>

              <Button
                variant="primary"
                onClick={handleRunPipeline}
                disabled={isRunning}
                className="w-full"
              >
                <Play className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
                {isRunning ? 'Executing Pipeline...' : 'Trigger Pipeline Refresh'}
              </Button>

              {runMessage && (
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                  {runMessage}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Architecture Diagram */}
        <div className="lg:col-span-7">
          <Card
            title="End-to-End Enterprise Architecture"
            subtitle="Modular flow from raw CSV ingestion to executive SaaS intelligence"
            action={<Badge variant="emerald">Clean Architecture</Badge>}
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2 text-center text-xs">
              <div className="p-3 bg-[#0B0F19] border border-[#1F293D] rounded-xl flex flex-col items-center justify-center space-y-2">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                  9 CSVs
                </div>
                <span className="font-semibold text-slate-200">Raw Layer</span>
                <span className="text-[10px] text-slate-400">Olist Dataset</span>
              </div>

              <div className="p-3 bg-[#0B0F19] border border-[#1F293D] rounded-xl flex flex-col items-center justify-center space-y-2">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">
                  Python
                </div>
                <span className="font-semibold text-slate-200">ETL Engine</span>
                <span className="text-[10px] text-slate-400">Validation & Clean</span>
              </div>

              <div className="p-3 bg-[#0B0F19] border border-[#1F293D] rounded-xl flex flex-col items-center justify-center space-y-2">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                  Postgres
                </div>
                <span className="font-semibold text-slate-200">Relational DW</span>
                <span className="text-[10px] text-slate-400">SQL Data Marts</span>
              </div>

              <div className="p-3 bg-[#0B0F19] border border-[#1F293D] rounded-xl flex flex-col items-center justify-center space-y-2">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                  n8n + UI
                </div>
                <span className="font-semibold text-slate-200">Automation</span>
                <span className="text-[10px] text-slate-400">RetainIQ Platform</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-slate-900/60 border border-[#1F293D] rounded-lg text-xs text-slate-300">
              ⚡ <b>Automated Integration:</b> Workflows communicate with PostgreSQL through standardized SQL analytical marts and expose metrics through FastAPI REST routes secured with API keys.
            </div>
          </Card>
        </div>
      </div>

      {/* Row 2: n8n Workflow Definitions */}
      <Card
        title="Production n8n Workflow Automation Engine"
        subtitle="3 ready-to-run automation workflows located in the n8n/ project directory"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {N8N_WORKFLOWS.map((wf) => (
            <div key={wf.id} className="p-4 bg-[#0B0F19] border border-[#1F293D] rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <Badge variant="emerald">{wf.status}</Badge>
                <span className="text-[11px] text-slate-400">{wf.nodes} Nodes</span>
              </div>
              <h4 className="text-sm font-semibold text-white font-mono">{wf.name}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{wf.action}</p>
              <div className="pt-2 border-t border-[#1F293D] text-[11px] text-cyan-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Trigger: {wf.trigger}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Row 3: Data Quality Validation Report */}
      <Card
        title="PostgreSQL Warehouse Data Validation & Integrity Audit"
        subtitle="100% compliance across primary keys, foreign key constraints, and numeric bounds"
        action={<Badge variant="emerald">10 / 10 Tests Passed</Badge>}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0B0F19] text-slate-400 uppercase font-semibold border-b border-[#1F293D]">
              <tr>
                <th className="py-2.5 px-4">Entity</th>
                <th className="py-2.5 px-4">Integrity Rule</th>
                <th className="py-2.5 px-4">Audit Result</th>
                <th className="py-2.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F293D]">
              {VALIDATION_CHECKS.map((c, i) => (
                <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-4 font-mono font-semibold text-blue-400">{c.table}</td>
                  <td className="py-2.5 px-4 font-medium text-slate-200">{c.check}</td>
                  <td className="py-2.5 px-4 font-mono text-slate-400">{c.result}</td>
                  <td className="py-2.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {c.status}
                    </span>
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
