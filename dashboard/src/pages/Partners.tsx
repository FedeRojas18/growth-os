import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { PartnerPipelineData, PartnerState } from '../types';
import { PartnerKanban } from '../components/partners/PartnerKanban';
import { SkeletonKanbanColumn, Skeleton } from '../components/shared/Skeleton';
import { AlertCircle, Target, CheckCircle } from 'lucide-react';

const stateColors: Record<string, { bg: string; text: string; dot: string }> = {
  'Identified': { bg: 'bg-slate-50', text: 'text-slate-700', dot: 'bg-slate-500' },
  'Researching': { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  'Outreach': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  'Conversation': { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  'Active': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
};

export function Partners() {
  const [data, setData] = useState<PartnerPipelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await api.getPartners();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load partners');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <PartnersSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
        <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <p className="font-medium text-red-700">Failed to load partners</p>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const activeStates: PartnerState[] = ['Identified', 'Researching', 'Outreach', 'Conversation', 'Active'];

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {data && activeStates.map((state) => {
          const count = data.summary.byState[state] || 0;
          const colors = stateColors[state];
          return (
            <div
              key={state}
              className={`${colors.bg} rounded-xl p-4 border border-transparent transition-all hover:shadow-sm`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                <span className={`text-xs font-medium ${colors.text} uppercase tracking-wide`}>{state}</span>
              </div>
              <p className={`text-2xl font-bold ${colors.text}`}>{count}</p>
            </div>
          );
        })}
      </div>

      {/* 90-Day Goal Progress */}
      <div className="bg-gradient-to-br from-indigo-50 via-indigo-50 to-blue-50 rounded-xl border border-indigo-100 overflow-hidden">
        <div className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Target className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-indigo-900">90-Day Goal</h2>
              <p className="text-xs text-indigo-600">10 Organic Referrals</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-2xl font-bold text-indigo-700">0</span>
              <span className="text-sm text-indigo-400">/10</span>
            </div>
          </div>
          <div className="h-2 bg-indigo-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: '0%' }}
            />
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 tracking-tight">Partner Pipeline</h2>
          <p className="text-xs text-gray-500 mt-0.5">Track partner prospects through each stage</p>
        </div>
        <div className="p-6">
          {data && <PartnerKanban partners={data.partners} />}
        </div>
      </div>

      {/* Active Partnerships */}
      {data && data.activePartnerships.length > 0 && (
        <div className="bg-emerald-50 rounded-xl border border-emerald-200 overflow-hidden">
          <div className="px-5 py-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-emerald-700">
                Active Partnerships
                <span className="ml-2 text-xs font-normal text-emerald-500">({data.activePartnerships.length})</span>
              </h2>
              <p className="text-xs text-emerald-600">Partners that are live and producing value</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PartnersSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-gray-100 rounded-xl p-4">
            <Skeleton variant="text" width={70} height={14} className="mb-2" />
            <Skeleton variant="text" width={40} height={28} />
          </div>
        ))}
      </div>

      {/* Goal Skeleton */}
      <div className="bg-indigo-50 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <Skeleton variant="rectangular" width={40} height={40} className="rounded-xl" />
          <div>
            <Skeleton variant="text" width={100} height={16} className="mb-1" />
            <Skeleton variant="text" width={120} height={14} />
          </div>
        </div>
        <Skeleton variant="rectangular" width="100%" height={8} className="rounded-full" />
      </div>

      {/* Kanban Skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <Skeleton variant="text" width={140} height={24} className="mb-6" />
        <div className="flex gap-4 overflow-hidden">
          <SkeletonKanbanColumn />
          <SkeletonKanbanColumn />
          <SkeletonKanbanColumn />
          <SkeletonKanbanColumn />
          <SkeletonKanbanColumn />
        </div>
      </div>
    </div>
  );
}
