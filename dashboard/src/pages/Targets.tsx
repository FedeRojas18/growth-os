import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { TargetPipelineData, TargetState } from '../types';
import { KanbanBoard } from '../components/pipeline/KanbanBoard';
import { SkeletonKanbanColumn, Skeleton } from '../components/shared/Skeleton';
import { AlertCircle, Archive, Clock } from 'lucide-react';

const stateColors: Record<string, { bg: string; text: string; dot: string }> = {
  'New': { bg: 'bg-slate-50', text: 'text-slate-700', dot: 'bg-slate-500' },
  'Contacted': { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  'Replied': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  'Meeting': { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  'Passed': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
};

export function Targets() {
  const [data, setData] = useState<TargetPipelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await api.getTargets();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load targets');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <TargetsSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
        <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <p className="font-medium text-red-700">Failed to load targets</p>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const activeStates: TargetState[] = ['New', 'Contacted', 'Replied', 'Meeting', 'Passed'];

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

      {/* Kanban Board */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 tracking-tight">Pipeline Board</h2>
          <p className="text-xs text-gray-500 mt-0.5">Drag-free kanban view of all active targets</p>
        </div>
        <div className="p-6">
          {data && <KanbanBoard targets={data.targets} />}
        </div>
      </div>

      {/* Archived Sections */}
      {data && data.closedLost.length > 0 && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gray-200 flex items-center justify-center">
              <Archive className="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-700">
                Closed-Lost Archive
                <span className="ml-2 text-xs font-normal text-gray-500">({data.closedLost.length})</span>
              </h2>
              <p className="text-xs text-gray-500">Targets that were not a fit or did not respond</p>
            </div>
          </div>
        </div>
      )}

      {data && data.nurture.length > 0 && (
        <div className="bg-violet-50 rounded-xl border border-violet-200 overflow-hidden">
          <div className="px-5 py-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center">
              <Clock className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-violet-700">
                Nurture List
                <span className="ml-2 text-xs font-normal text-violet-500">({data.nurture.length})</span>
              </h2>
              <p className="text-xs text-violet-600">Interested targets with timing not right</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TargetsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-gray-100 rounded-xl p-4">
            <Skeleton variant="text" width={60} height={14} className="mb-2" />
            <Skeleton variant="text" width={40} height={28} />
          </div>
        ))}
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
