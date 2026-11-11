import React, { useState, useMemo } from 'react';
import {
  Database,
  Search,
  Filter,
  Download,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Star,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { CustomerRecord } from '../types';
import { AUTHENTIC_SAMPLE_CUSTOMERS } from '../services/api';

interface DataExplorerProps {
  initialSearch?: string;
}

export const DataExplorerPage: React.FC<DataExplorerProps> = ({ initialSearch = '' }) => {
  const [search, setSearch] = useState(initialSearch);
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState<'spend-desc' | 'spend-asc' | 'recency-asc' | 'freq-desc'>('spend-desc');
  const [page, setPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const pageSize = 8;

  // Filter and sort customer directory
  const filteredCustomers = useMemo(() => {
    let result = [...AUTHENTIC_SAMPLE_CUSTOMERS];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.customer_unique_id.toLowerCase().includes(q) ||
          c.customer_city.toLowerCase().includes(q) ||
          c.customer_state.toLowerCase().includes(q)
      );
    }

    if (selectedSegment !== 'all') {
      result = result.filter((c) => c.customer_segment.toLowerCase() === selectedSegment.toLowerCase());
    }

    if (selectedType !== 'all') {
      result = result.filter((c) =>
        selectedType === 'repeat' ? c.frequency > 1 : c.frequency === 1
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'spend-desc') return b.monetary_value - a.monetary_value;
      if (sortBy === 'spend-asc') return a.monetary_value - b.monetary_value;
      if (sortBy === 'recency-asc') return a.recency_days - b.recency_days;
      if (sortBy === 'freq-desc') return b.frequency - a.frequency;
      return 0;
    });

    return result;
  }, [search, selectedSegment, selectedType, sortBy]);

  const totalPages = Math.ceil(filteredCustomers.length / pageSize) || 1;
  const paginatedData = filteredCustomers.slice((page - 1) * pageSize, page * pageSize);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCSV = () => {
    const headers = ['Customer ID', 'City', 'State', 'Segment', 'Recency (Days)', 'Orders', 'Spend (BRL)', 'Rating', 'RFM'];
    const rows = filteredCustomers.map((c) => [
      c.customer_unique_id,
      c.customer_city,
      c.customer_state,
      c.customer_segment,
      c.recency_days,
      c.frequency,
      c.monetary_value,
      c.avg_review_score,
      `${c.r_score}${c.f_score}${c.m_score}`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'retainiq_customer_marts.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSegmentVariant = (segment: string) => {
    switch (segment) {
      case 'Champions':
        return 'blue';
      case 'Loyal Customers':
        return 'cyan';
      case 'Potential Loyalists':
        return 'emerald';
      case 'At Risk':
        return 'amber';
      case 'Cannot Lose Them':
        return 'rose';
      case 'Hibernating':
        return 'purple';
      default:
        return 'slate';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <Card>
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by Customer Unique ID, City, or State..."
              className="w-full pl-9 pr-4 py-2 bg-[#0B0F19] border border-[#1F293D] rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Slicers */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedSegment}
              onChange={(e) => {
                setSelectedSegment(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-[#0B0F19] border border-[#1F293D] rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All RFM Segments</option>
              <option value="champions">Champions</option>
              <option value="loyal customers">Loyal Customers</option>
              <option value="potential loyalists">Potential Loyalists</option>
              <option value="cannot lose them">Cannot Lose Them</option>
              <option value="at risk">At Risk</option>
              <option value="hibernating">Hibernating</option>
              <option value="lost customers">Lost Customers</option>
              <option value="new customers">New Customers</option>
            </select>

            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-[#0B0F19] border border-[#1F293D] rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Buyer Types</option>
              <option value="repeat">Repeat Purchasers (2+ Orders)</option>
              <option value="single">One-Time Buyers (1 Order)</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-[#0B0F19] border border-[#1F293D] rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="spend-desc">Highest Spend First</option>
              <option value="spend-asc">Lowest Spend First</option>
              <option value="recency-asc">Most Recent Buyers</option>
              <option value="freq-desc">Highest Frequency</option>
            </select>

            <Button variant="secondary" size="sm" onClick={handleExportCSV} className="border-[#1F293D]">
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Directory Table */}
      <Card
        title={`Customer Intelligence Directory (${filteredCustomers.length} matching records)`}
        subtitle="Detailed RFM scores, lifetime transaction values, and fulfillment satisfaction"
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1 rounded bg-[#0B0F19] border border-[#1F293D] text-slate-300 disabled:opacity-40 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1 rounded bg-[#0B0F19] border border-[#1F293D] text-slate-300 disabled:opacity-40 hover:text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0B0F19] text-slate-400 uppercase font-semibold border-b border-[#1F293D]">
              <tr>
                <th className="py-3 px-4">Customer Unique ID</th>
                <th className="py-3 px-4">Geography</th>
                <th className="py-3 px-4">RFM Segment</th>
                <th className="py-3 px-4 text-right">Recency</th>
                <th className="py-3 px-4 text-right">Orders</th>
                <th className="py-3 px-4 text-right">Lifetime Spend</th>
                <th className="py-3 px-4 text-center">CSAT</th>
                <th className="py-3 px-4 text-center">Score Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F293D]">
              {paginatedData.map((c) => (
                <tr key={c.customer_unique_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-200">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate max-w-[140px] sm:max-w-[180px]">
                        {c.customer_unique_id}
                      </span>
                      <button
                        onClick={() => handleCopy(c.customer_unique_id)}
                        className="text-slate-500 hover:text-slate-300 transition-colors"
                        title="Copy Customer ID"
                      >
                        {copiedId === c.customer_unique_id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="flex items-center gap-1 text-slate-300">
                      <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
                      {c.customer_city}, <span className="font-semibold text-slate-200">{c.customer_state}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={getSegmentVariant(c.customer_segment) as any}>
                      {c.customer_segment}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    <span className={c.recency_days <= 60 ? 'text-emerald-400' : c.recency_days > 300 ? 'text-rose-400' : 'text-slate-300'}>
                      {c.recency_days}d
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    <span className={c.frequency > 1 ? 'font-bold text-emerald-400' : 'text-slate-400'}>
                      {c.frequency} {c.frequency > 1 ? 'orders' : 'order'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-100 font-mono">
                    R$ {c.monetary_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-0.5 font-semibold text-amber-400">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {c.avg_review_score.toFixed(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                      R{c.r_score}F{c.f_score}M{c.m_score}
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

