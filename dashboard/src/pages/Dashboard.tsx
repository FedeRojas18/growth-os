import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { TargetPipelineData, PartnerPipelineData, Metrics } from '../types';
import { Scorecard } from '../components/metrics/Scorecard';
import { KanbanBoard } from '../components/pipeline/KanbanBoard';

export function Dashboard() {
  const [targets, setTargets] = useState<TargetPipelineData | null>(null);
  const [partners, setPartners] = useState<PartnerPipelineData | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [targetsData, partnersData, metricsData] = await Promise.all([
          api.getTargets(),
          api.getPartners(),
          api.getMetrics(),
        ]);
        setTargets(targetsData);
        setPartners(partnersData);
        setMetrics(metricsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          label="Active Targets"
          value={targets?.summary.totalActive || 0}
          icon="🎯"
        />
        <SummaryCard
          label="New This Week"
          value={targets?.summary.byState['New'] || 0}
          icon="✨"
        />
        <SummaryCard
          label="Partners in Pipeline"
          value={partners?.summary.totalActive || 0}
          icon="🤝"
        />
        <SummaryCard
          label="Stale Targets"
          value={targets?.summary.staleCount || 0}
          icon="⚠️"
          highlight={targets?.summary.staleCount ? targets.summary.staleCount > 0 : false}
        />
      </div>

      {/* Scorecard and Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          {metrics && <Scorecard metrics={metrics} />}
        </div>
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Target Pipeline</h2>
            {targets && <KanbanBoard targets={targets.targets} />}
          </div>
        </div>
      </div>
    </div>
  );
}

interface SummaryCardProps {
  label: string;
  value: number;
  icon: string;
  highlight?: boolean;
}

function SummaryCard({ label, value, icon, highlight }: SummaryCardProps) {
  return (
    <div className={`bg-white rounded-xl border p-4 ${highlight ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className={`text-2xl font-bold ${highlight ? 'text-red-600' : 'text-gray-900'}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}
