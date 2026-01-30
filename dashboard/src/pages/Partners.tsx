import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { PartnerPipelineData } from '../types';
import { PartnerKanban } from '../components/partners/PartnerKanban';

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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading partners...</div>
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
          <h1 className="text-2xl font-bold text-gray-900">Partnership Pipeline</h1>
          <p className="text-gray-500">Track partner prospects and active partnerships</p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : '—'}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {data && Object.entries(data.summary.byState)
          .filter(([state]) => !['Paused', 'Closed'].includes(state))
          .map(([state, count]) => (
            <div key={state} className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className="text-sm text-gray-500">{state}</p>
            </div>
          ))}
      </div>

      {/* 90-Day Goal Progress */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">90-Day Goal: 10 Organic Referrals</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-4 bg-blue-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: '0%' }} />
          </div>
          <span className="text-blue-700 font-medium">0/10</span>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Partner Pipeline</h2>
        {data && <PartnerKanban partners={data.partners} />}
      </div>

      {/* Active Partnerships */}
      {data && data.activePartnerships.length > 0 && (
        <div className="bg-green-50 rounded-xl border border-green-200 p-6">
          <h2 className="text-lg font-semibold text-green-700 mb-4">
            Active Partnerships ({data.activePartnerships.length})
          </h2>
          <p className="text-sm text-green-600">Partners that are live and producing value.</p>
        </div>
      )}
    </div>
  );
}
