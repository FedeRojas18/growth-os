import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { TargetPipelineData } from '../types';
import { KanbanBoard } from '../components/pipeline/KanbanBoard';

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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading targets...</div>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Target Pipeline</h1>
          <p className="text-gray-500">Track targets from first contact through handoff</p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : '—'}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {data && Object.entries(data.summary.byState)
          .filter(([state]) => !['Closed-Lost', 'Nurture'].includes(state))
          .map(([state, count]) => (
            <div key={state} className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className="text-sm text-gray-500">{state}</p>
            </div>
          ))}
      </div>

      {/* Kanban Board */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {data && <KanbanBoard targets={data.targets} />}
      </div>

      {/* Archived Sections */}
      {data && data.closedLost.length > 0 && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Closed-Lost Archive ({data.closedLost.length})</h2>
          <p className="text-sm text-gray-500">Targets that were not a fit or did not respond.</p>
        </div>
      )}

      {data && data.nurture.length > 0 && (
        <div className="bg-purple-50 rounded-xl border border-purple-200 p-6">
          <h2 className="text-lg font-semibold text-purple-700 mb-4">Nurture List ({data.nurture.length})</h2>
          <p className="text-sm text-purple-600">Interested targets with timing not right.</p>
        </div>
      )}
    </div>
  );
}
