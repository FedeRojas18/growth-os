import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import type { InsightsResponse, TargetPipelineData, PartnerPipelineData, DigestResponse, Target, Partner } from '../types';
import { TargetModal } from '../components/pipeline/TargetModal';
import { PartnerModal } from '../components/partners/PartnerModal';
import { EmptyState } from '../components/shared/EmptyState';
import { Copy, CheckCircle2, Lightbulb, ArrowUpRight, AlertTriangle, Flame, Snowflake, ClipboardList } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

const stageColors: Record<string, string> = {
  New: '#94a3b8',
  Contacted: '#3b82f6',
  Replied: '#f59e0b',
  Meeting: '#f97316',
  Passed: '#10b981',
};

export function Insights() {
  const [targets, setTargets] = useState<TargetPipelineData | null>(null);
  const [partners, setPartners] = useState<PartnerPipelineData | null>(null);
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [digest, setDigest] = useState<DigestResponse | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<Target | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [reminders, setReminders] = useState<Array<{ id: number; entityType: string; entityId: string; dueDate: string; note: string; isComplete: boolean }>>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [targetsData, partnersData, insightsData, digestData, remindersData] = await Promise.all([
          api.getTargets(),
          api.getPartners(),
          api.getInsights(),
          api.getDigest(),
          api.getReminders(),
        ]);
        setTargets(targetsData);
        setPartners(partnersData);
        setInsights(insightsData);
        setDigest(digestData);
        setReminders(remindersData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load insights');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const stageData = useMemo(() => {
    if (!targets) return [];
    const states = ['New', 'Contacted', 'Replied', 'Meeting', 'Passed'];
    return states.map((state) => ({
      state,
      count: targets.summary.byState[state as keyof typeof targets.summary.byState] || 0,
    }));
  }, [targets]);

  const touchesData = useMemo(() => {
    if (!insights) return [];
    return insights.touchesByDay.map((item) => ({
      date: item.date.slice(5),
      count: item.count,
    }));
  }, [insights]);

  const growthSignals = useMemo(() => {
    if (!targets || !partners || !insights) return [];

    const todayStr = new Date().toISOString().split('T')[0];
    const targetMap = new Map(targets.targets.map(t => [t.id, t]));
    const partnerMap = new Map(
      [...partners.partners, ...partners.activePartnerships, ...partners.paused].map(p => [p.id, p])
    );

    const signals: Array<{
      id: string;
      tone: 'urgent' | 'stale' | 'missing' | 'momentum' | 'progress';
      title: string;
      description: string;
      items: Array<{ entityType: 'target' | 'partner'; entityId: string; name: string; dueDate?: string }>;
    }> = [];

    const overdueReminders = reminders.filter(r => !r.isComplete && r.dueDate < todayStr);
    if (overdueReminders.length > 0) {
      const items = overdueReminders.slice(0, 3).map(r => ({
        entityType: (r.entityType === 'partner' ? 'partner' : 'target') as 'target' | 'partner',
        entityId: r.entityId,
        name: (r.entityType === 'partner' ? partnerMap.get(r.entityId)?.name : targetMap.get(r.entityId)?.company) || r.entityId,
        dueDate: r.dueDate,
      }));
      signals.push({
        id: 'overdue',
        tone: 'urgent',
        title: `${overdueReminders.length} targets need follow-up (overdue)`,
        description: 'These reminders are past due and need attention.',
        items,
      });
    }

    const dueTodayReminders = reminders.filter(r => !r.isComplete && r.dueDate === todayStr);
    if (dueTodayReminders.length > 0) {
      const items = dueTodayReminders.slice(0, 3).map(r => ({
        entityType: (r.entityType === 'partner' ? 'partner' : 'target') as 'target' | 'partner',
        entityId: r.entityId,
        name: (r.entityType === 'partner' ? partnerMap.get(r.entityId)?.name : targetMap.get(r.entityId)?.company) || r.entityId,
        dueDate: r.dueDate,
      }));
      signals.push({
        id: 'today',
        tone: 'urgent',
        title: `${dueTodayReminders.length} reminders due today`,
        description: 'Knock these out to keep momentum.',
        items,
      });
    }

    const staleTargets = targets.targets.filter(t => t.isStale);
    if (staleTargets.length > 0) {
      signals.push({
        id: 'stale',
        tone: 'stale',
        title: `${staleTargets.length} targets are cooling off`,
        description: 'No activity in >14 days.',
        items: staleTargets.slice(0, 3).map(t => ({
          entityType: 'target',
          entityId: t.id,
          name: t.company,
          dueDate: todayStr,
        })),
      });
    }

    const missingNext = targets.targets.filter(t =>
      (t.state === 'Contacted' || t.state === 'Replied' || t.state === 'Meeting') &&
      !t.nextAction?.trim()
    );
    if (missingNext.length > 0) {
      signals.push({
        id: 'missing-next',
        tone: 'missing',
        title: `${missingNext.length} targets missing next step`,
        description: 'Add a clear follow-up to keep deals moving.',
        items: missingNext.slice(0, 3).map(t => ({
          entityType: 'target',
          entityId: t.id,
          name: t.company,
          dueDate: todayStr,
        })),
      });
    }

    const activityMap = new Map(insights.activityByTarget.map(a => [a.entityId, a.count]));
    const hotTargets = targets.targets
      .filter(t => activityMap.has(t.id))
      .sort((a, b) => (activityMap.get(b.id) || 0) - (activityMap.get(a.id) || 0))
      .slice(0, 3);
    if (hotTargets.length > 0) {
      signals.push({
        id: 'hot',
        tone: 'momentum',
        title: `${hotTargets.length} targets heating up`,
        description: 'Highest touches this week.',
        items: hotTargets.map(t => ({
          entityType: 'target',
          entityId: t.id,
          name: t.company,
          dueDate: todayStr,
        })),
      });
    }

    const stateOrder = ['New', 'Contacted', 'Replied', 'Meeting', 'Passed'];
    const stateIndex = new Map(stateOrder.map((state, index) => [state, index]));
    const grouped = new Map<string, Array<{ createdAt: Date; from?: string; to?: string }>>();
    insights.stateChanges.forEach((change) => {
      const createdAt = new Date(change.createdAt);
      if (Number.isNaN(createdAt.getTime())) return;
      const list = grouped.get(change.entityId) || [];
      list.push({ createdAt, from: change.from, to: change.to });
      grouped.set(change.entityId, list);
    });
    const progressed = Array.from(grouped.entries())
      .map(([entityId, moves]) => {
        const sorted = moves.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        const startIdx = stateIndex.get(first.from || '');
        const endIdx = stateIndex.get(last.to || '');
        if (startIdx === undefined || endIdx === undefined || endIdx <= startIdx) return null;
        const target = targetMap.get(entityId);
        if (!target) return null;
        return target;
      })
      .filter((t): t is Target => Boolean(t));

    if (progressed.length > 0) {
      signals.push({
        id: 'progress',
        tone: 'progress',
        title: `${progressed.length} targets moved forward`,
        description: 'Stage progression logged this week.',
        items: progressed.slice(0, 3).map(t => ({
          entityType: 'target',
          entityId: t.id,
          name: t.company,
          dueDate: todayStr,
        })),
      });
    }

    const toneOrder = ['urgent', 'stale', 'missing', 'momentum', 'progress'];
    return signals
      .sort((a, b) => toneOrder.indexOf(a.tone) - toneOrder.indexOf(b.tone))
      .slice(0, 8);
  }, [targets, partners, insights, reminders]);

  const urgentSignals = growthSignals.filter(signal => signal.tone === 'urgent');

  const handleOpenEntity = (entityType: 'target' | 'partner', entityId: string) => {
    if (entityType === 'partner') {
      const partner = partners
        ? [...partners.partners, ...partners.activePartnerships, ...partners.paused].find(p => p.id === entityId)
        : undefined;
      if (partner) setSelectedPartner(partner);
      return;
    }
    const target = targets?.targets.find(t => t.id === entityId);
    if (target) setSelectedTarget(target);
  };

  const handleAddReminder = async (entityType: 'target' | 'partner', entityId: string, name: string, dueDate?: string) => {
    const note = `Follow up on ${name}`;
    const finalDueDate = dueDate || new Date().toISOString().split('T')[0];
    try {
      await api.createReminder({
        entityType,
        entityId,
        dueDate: finalDueDate,
        note,
      });
    } catch (error) {
      console.error('Error creating reminder:', error);
    }
  };

  const handleCopy = async () => {
    if (!digest?.markdown) return;
    await navigator.clipboard.writeText(digest.markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
          <div className="h-4 w-40 bg-gray-200 rounded mb-2" />
          <div className="h-3 w-64 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
        <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
          <Lightbulb className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <p className="font-medium text-red-700">Failed to load insights</p>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pipeline Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-gray-900">Targets by Stage</h2>
            <p className="text-xs text-gray-500">Active pipeline distribution</p>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="state" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip cursor={{ fill: 'rgba(15,23,42,0.06)' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {stageData.map((entry) => (
                    <Cell
                      key={entry.state}
                      fill={stageColors[entry.state] || '#94a3b8'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-gray-900">Touches Over Time</h2>
            <p className="text-xs text-gray-500">Notes + stage changes (last 14 days)</p>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={touchesData} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip cursor={{ stroke: '#94a3b8' }} />
                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Growth Signals */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <h2 className="text-base font-semibold text-gray-900">Growth Signals</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            What needs attention, what’s trending, what to do next
          </p>
        </div>

        {urgentSignals.length === 0 && (
          <div className="mb-4 text-sm text-emerald-600 font-medium">
            All clear — no urgent actions right now 🎉
          </div>
        )}

        {growthSignals.length === 0 ? (
          <EmptyState
            icon="inbox"
            title="All clear"
            description="No high-signal items right now."
            compact
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {growthSignals.map((signal) => (
              <div key={signal.id} className="rounded-xl border border-gray-200 p-4 bg-gray-50/60">
                <div className="flex items-center gap-2">
                  {signal.tone === 'urgent' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                  {signal.tone === 'stale' && <Snowflake className="w-4 h-4 text-slate-500" />}
                  {signal.tone === 'missing' && <ClipboardList className="w-4 h-4 text-amber-500" />}
                  {signal.tone === 'momentum' && <Flame className="w-4 h-4 text-orange-500" />}
                  {signal.tone === 'progress' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {signal.tone === 'urgent' && 'Needs Follow-up'}
                    {signal.tone === 'stale' && 'Cooling Off'}
                    {signal.tone === 'missing' && 'Missing Next Step'}
                    {signal.tone === 'momentum' && 'Heating Up'}
                    {signal.tone === 'progress' && 'Progress This Week'}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mt-2">{signal.title}</h3>
                <p className="text-xs text-gray-600 mt-1">{signal.description}</p>
                <ul className="mt-3 space-y-2">
                  {signal.items.map((item) => (
                    <li key={`${signal.id}-${item.entityId}`} className="flex items-center justify-between gap-2 text-xs">
                      <span className="text-gray-800 font-medium truncate">{item.name}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEntity(item.entityType, item.entityId)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-900 text-white text-[10px] font-medium hover:bg-gray-800"
                        >
                          Open
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleAddReminder(item.entityType, item.entityId, item.name, item.dueDate)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-[10px] font-medium hover:bg-gray-200"
                        >
                          Add reminder
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly Strategy Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">This Week at a Glance</h2>
            <p className="text-xs text-gray-500">Weekly Growth Digest</p>
          </div>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-medium hover:bg-gray-800"
          >
            {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono bg-gray-50 border border-gray-200 rounded-lg p-4">
          {digest?.markdown || 'No digest available.'}
        </pre>
      </div>

      {selectedTarget && (
        <TargetModal
          target={selectedTarget}
          onClose={() => setSelectedTarget(null)}
        />
      )}

      {selectedPartner && (
        <PartnerModal
          partner={selectedPartner}
          onClose={() => setSelectedPartner(null)}
        />
      )}
    </div>
  );
}
