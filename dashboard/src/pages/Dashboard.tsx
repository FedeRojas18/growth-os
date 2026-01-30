import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { TargetPipelineData, PartnerPipelineData, Metrics } from '../types';
import { Scorecard } from '../components/metrics/Scorecard';
import { KanbanBoard } from '../components/pipeline/KanbanBoard';
import { SkeletonScorecard, SkeletonKanbanColumn, Skeleton } from '../components/shared/Skeleton';
import { Target, Sparkles, Users, AlertTriangle, AlertCircle } from 'lucide-react';

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
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
        <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <p className="font-medium text-red-700">Failed to load dashboard</p>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Active Targets"
          value={targets?.summary.totalActive || 0}
          icon={<Target className="w-5 h-5" />}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
        />
        <SummaryCard
          label="New This Week"
          value={targets?.summary.byState['New'] || 0}
          icon={<Sparkles className="w-5 h-5" />}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
        <SummaryCard
          label="Partners in Pipeline"
          value={partners?.summary.totalActive || 0}
          icon={<Users className="w-5 h-5" />}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <SummaryCard
          label="Stale Targets"
          value={targets?.summary.staleCount || 0}
          icon={<AlertTriangle className="w-5 h-5" />}
          iconBg="bg-red-50"
          iconColor="text-red-600"
          highlight={targets?.summary.staleCount ? targets.summary.staleCount > 0 : false}
        />
      </div>

      {/* Scorecard and Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          {metrics && <Scorecard metrics={metrics} />}
        </div>
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900 tracking-tight">Target Pipeline</h2>
              <p className="text-xs text-gray-500 mt-0.5">Active targets by stage</p>
            </div>
            <div className="p-6">
              {targets && <KanbanBoard targets={targets.targets} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SummaryCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  highlight?: boolean;
}

function SummaryCard({ label, value, icon, iconBg, iconColor, highlight }: SummaryCardProps) {
  return (
    <div className={`
      bg-white rounded-xl border p-4 transition-all duration-200 hover:shadow-sm
      ${highlight ? 'border-red-200 bg-red-50/30' : 'border-gray-200'}
    `}>
      <div className="flex items-center gap-4">
        <div className={`
          w-11 h-11 rounded-xl flex items-center justify-center
          ${highlight ? 'bg-red-100' : iconBg}
        `}>
          <span className={highlight ? 'text-red-600' : iconColor}>{icon}</span>
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className={`text-2xl font-bold tracking-tight ${highlight ? 'text-red-600' : 'text-gray-900'}`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-4">
              <Skeleton variant="rectangular" width={44} height={44} className="rounded-xl" />
              <div className="space-y-2">
                <Skeleton variant="text" width={80} height={16} />
                <Skeleton variant="text" width={48} height={28} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <SkeletonScorecard />
        </div>
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <Skeleton variant="text" width={140} height={24} className="mb-6" />
            <div className="flex gap-4 overflow-hidden">
              <SkeletonKanbanColumn />
              <SkeletonKanbanColumn />
              <SkeletonKanbanColumn />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
