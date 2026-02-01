import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import type { TargetPipelineData, PartnerPipelineData, Metrics } from '../types';
import { Scorecard } from '../components/metrics/Scorecard';
import { KanbanBoard } from '../components/pipeline/KanbanBoard';
import { SkeletonScorecard, SkeletonKanbanColumn, Skeleton } from '../components/shared/Skeleton';
import { ReminderListItem, type Reminder } from '../components/shared/ReminderBadge';
import { ActivityTimeline, type Activity } from '../components/shared/ActivityTimeline';
import { TargetModal } from '../components/pipeline/TargetModal';
import { PartnerModal } from '../components/partners/PartnerModal';
import { WeeklyDigestModal } from '../components/shared/WeeklyDigestModal';
import {
  Target as TargetIcon,
  Sparkles,
  Users,
  AlertTriangle,
  AlertCircle,
  Bell,
  Clock,
  MessageSquare,
  CircleAlert,
  Plus,
  ArrowUpRight,
  FileText,
} from 'lucide-react';
import { isPast, isToday } from 'date-fns';

export function Dashboard() {
  const [targets, setTargets] = useState<TargetPipelineData | null>(null);
  const [partners, setPartners] = useState<PartnerPipelineData | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [digestOpen, setDigestOpen] = useState(false);
  const [digestMarkdown, setDigestMarkdown] = useState('');
  const [digestLoading, setDigestLoading] = useState(false);
  const [digestError, setDigestError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [targetsData, partnersData, metricsData, remindersData] = await Promise.all([
          api.getTargets(),
          api.getPartners(),
          api.getMetrics(),
          api.getReminders({ today: true }),
        ]);
        setTargets(targetsData);
        setPartners(partnersData);
        setMetrics(metricsData);
        setReminders(remindersData);

        // Fetch recent activities for first few targets
        const targetIds = targetsData.targets.map(t => t.id);
        const targetMap = new Map(targetsData.targets.map(t => [t.id, t.company]));
        const activitiesPromises = targetIds.map(id =>
          api.getActivities('target', id)
            .then(items => items.map(item => ({
              ...item,
              entityName: targetMap.get(item.entityId) || item.entityId,
            })))
            .catch(() => [] as Activity[])
        );
        const allActivities = await Promise.all(activitiesPromises);
        const merged = allActivities
          .flat()
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 12);
        setRecentActivities(merged);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleCompleteReminder = async (id: number) => {
    try {
      await api.updateReminder(id, { isComplete: true });
      setReminders(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error completing reminder:', error);
    }
  };

  // Get targets with overdue next actions
  const overdueTargets = targets?.targets.filter(t => {
    if (!t.nextActionDueDate) return false;
    const date = new Date(t.nextActionDueDate);
    return isPast(date) && !isToday(date);
  }) || [];

  // Get entity name for reminder
  const getEntityName = (reminder: Reminder): string => {
    if (reminder.entityType === 'target') {
      const target = targets?.targets.find(t => t.id === reminder.entityId);
      return target?.company || reminder.entityId;
    }
    const partner = partners?.partners.find(p => p.id === reminder.entityId);
    return partner?.name || reminder.entityId;
  };

  const attentionItems = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const items: Array<{
      id: string;
      entityType: 'target' | 'partner';
      entityId: string;
      entityName: string;
      reason: 'Overdue' | 'Today' | 'Stale' | 'No Next Action';
      priority: number;
      dueDate?: string;
    }> = [];

    // Overdue reminders
    reminders.forEach((reminder) => {
      if (reminder.isComplete) return;
      if (reminder.dueDate < todayStr) {
        items.push({
          id: `reminder-overdue-${reminder.id}`,
          entityType: reminder.entityType as 'target' | 'partner',
          entityId: reminder.entityId,
          entityName: getEntityName(reminder),
          reason: 'Overdue',
          priority: 1,
          dueDate: reminder.dueDate,
        });
      }
    });

    // Reminders due today
    reminders.forEach((reminder) => {
      if (reminder.isComplete) return;
      if (reminder.dueDate === todayStr) {
        items.push({
          id: `reminder-today-${reminder.id}`,
          entityType: reminder.entityType as 'target' | 'partner',
          entityId: reminder.entityId,
          entityName: getEntityName(reminder),
          reason: 'Today',
          priority: 2,
          dueDate: reminder.dueDate,
        });
      }
    });

    // Stale targets
    targets?.targets.filter(t => t.isStale).forEach((target) => {
      items.push({
        id: `stale-${target.id}`,
        entityType: 'target',
        entityId: target.id,
        entityName: target.company,
        reason: 'Stale',
        priority: 3,
      });
    });

    // Contacted/Replied with no next action
    targets?.targets
      .filter(t => (t.state === 'Contacted' || t.state === 'Replied') && !t.nextAction?.trim())
      .forEach((target) => {
        items.push({
          id: `no-action-${target.id}`,
          entityType: 'target',
          entityId: target.id,
          entityName: target.company,
          reason: 'No Next Action',
          priority: 4,
        });
      });

    return items
      .sort((a, b) => a.priority - b.priority || (a.dueDate || '').localeCompare(b.dueDate || '') || a.entityName.localeCompare(b.entityName))
      .slice(0, 8);
  }, [reminders, targets]);

  const handleOpenAttention = (entityType: 'target' | 'partner', entityId: string) => {
    if (entityType === 'target') {
      setSelectedTargetId(entityId);
    } else {
      setSelectedPartnerId(entityId);
    }
  };

  const handleAddReminderQuick = async (entityType: 'target' | 'partner', entityId: string, entityName: string) => {
    const note = window.prompt('Reminder note', `Follow up on ${entityName}`);
    if (!note) return;
    const dueDate = new Date().toISOString().split('T')[0];
    try {
      const reminder = await api.createReminder({ entityType, entityId, dueDate, note });
      setReminders(prev => [reminder, ...prev]);
    } catch (error) {
      console.error('Error creating reminder:', error);
    }
  };

  const selectedTarget = selectedTargetId
    ? targets?.targets.find(t => t.id === selectedTargetId) || null
    : null;
  const selectedPartner = selectedPartnerId
    ? partners?.partners.find(p => p.id === selectedPartnerId) || null
    : null;

  const handleGenerateDigest = async () => {
    setDigestOpen(true);
    setDigestLoading(true);
    setDigestError(null);
    try {
      const result = await api.getDigest();
      setDigestMarkdown(result.markdown);
    } catch (err) {
      setDigestError(err instanceof Error ? err.message : 'Failed to generate digest');
    } finally {
      setDigestLoading(false);
    }
  };


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
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Active Targets"
          value={targets?.summary.totalActive || 0}
          icon={<TargetIcon className="w-5 h-5" />}
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

      {/* Digest Button */}
      <div className="flex justify-end">
        <button
          onClick={handleGenerateDigest}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800"
        >
          <FileText className="w-4 h-4" />
          Generate Weekly Digest
        </button>
      </div>

      {/* Operator Row: Scorecard + Follow-ups + Activity + Needs Attention */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weekly Scorecard */}
        <div className="h-[240px]">
          {metrics && (
            <Scorecard
              metrics={metrics}
              compact
              className="h-full flex flex-col"
              bodyClassName="flex-1 overflow-y-auto"
            />
          )}
        </div>

        {/* Today's Follow-ups */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden h-[240px] flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-semibold text-gray-900 tracking-tight">
              Today's Follow-ups
            </h2>
            {reminders.length > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                {reminders.length}
              </span>
            )}
          </div>
          <div className="p-3 flex-1 overflow-y-auto">
            {reminders.length > 0 ? (
              <div className="space-y-3">
                {reminders.slice(0, 5).map((reminder) => (
                  <ReminderListItem
                    key={reminder.id}
                    reminder={reminder}
                    entityName={getEntityName(reminder)}
                    onComplete={handleCompleteReminder}
                  />
                ))}
              </div>
            ) : overdueTargets.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-red-600 font-medium">
                  <Clock className="w-4 h-4" />
                  <span>{overdueTargets.length} overdue next actions</span>
                </div>
                {overdueTargets.slice(0, 3).map((target) => (
                  <div key={target.id} className="p-3 bg-red-50 rounded-lg border border-red-100">
                    <p className="text-sm font-medium text-gray-900">{target.company}</p>
                    <p className="text-xs text-gray-600 mt-1">{target.nextAction}</p>
                    <p className="text-xs text-red-600 mt-1">Due: {target.nextActionDueDate}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-3 text-gray-500">
                <Bell className="w-6 h-6 mx-auto mb-1 opacity-50" />
                <p className="text-xs font-medium">No follow-ups for today</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden h-[240px] flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-500" />
            <h2 className="text-sm font-semibold text-gray-900 tracking-tight">
              Recent Activity
            </h2>
          </div>
          <div className="p-3 flex-1 overflow-y-auto">
            {recentActivities.length > 0 ? (
              <ActivityTimeline activities={recentActivities} />
            ) : (
              <div className="text-center py-3 text-gray-500">
                <MessageSquare className="w-6 h-6 mx-auto mb-1 opacity-50" />
                <p className="text-xs font-medium">No recent activity</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Add notes to see activity here</p>
              </div>
            )}
          </div>
        </div>

        {/* Needs Attention */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden h-[240px] flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <CircleAlert className="w-4 h-4 text-red-500" />
            <h2 className="text-sm font-semibold text-gray-900 tracking-tight">
              Needs Attention
            </h2>
          </div>
          <div className="p-3 flex-1 overflow-y-auto">
            {attentionItems.length > 0 ? (
              <div className="space-y-2">
                {attentionItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {item.entityName}
                      </p>
                      <span
                        className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          item.reason === 'Overdue'
                            ? 'bg-red-100 text-red-700'
                            : item.reason === 'Today'
                              ? 'bg-amber-100 text-amber-700'
                              : item.reason === 'Stale'
                                ? 'bg-violet-100 text-violet-700'
                                : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {item.reason}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenAttention(item.entityType, item.entityId)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-900 text-white text-[10px] font-medium hover:bg-gray-800"
                      >
                        Open
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleAddReminderQuick(item.entityType, item.entityId, item.entityName)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-[10px] font-medium hover:bg-gray-200"
                      >
                        <Plus className="w-3 h-3" />
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-3 text-gray-500">
                <CircleAlert className="w-6 h-6 mx-auto mb-1 opacity-40" />
                <p className="text-xs font-medium">All clear for now</p>
                <p className="text-[11px] text-gray-400 mt-0.5">No urgent actions found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Target Pipeline (Constrained Height) */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 tracking-tight">Target Pipeline</h2>
          <p className="text-xs text-gray-500 mt-0.5">Drag cards to change state</p>
        </div>
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {targets && <KanbanBoard targets={targets.targets} />}
        </div>
      </div>

      {selectedTarget && (
        <TargetModal
          target={selectedTarget}
          onClose={() => setSelectedTargetId(null)}
        />
      )}

      {selectedPartner && (
        <PartnerModal
          partner={selectedPartner}
          onClose={() => setSelectedPartnerId(null)}
        />
      )}

      {digestOpen && (
        <WeeklyDigestModal
          markdown={digestMarkdown}
          loading={digestLoading}
          error={digestError}
          onClose={() => setDigestOpen(false)}
        />
      )}
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
    <div className="space-y-4 animate-pulse">
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

      {/* Operator Row Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 h-[240px]">
          <SkeletonScorecard />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 h-[240px]">
          <Skeleton variant="text" width={140} height={16} className="mb-3" />
          <div className="space-y-2">
            <Skeleton variant="rectangular" width="100%" height={36} className="rounded-lg" />
            <Skeleton variant="rectangular" width="100%" height={36} className="rounded-lg" />
            <Skeleton variant="rectangular" width="100%" height={36} className="rounded-lg" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 h-[240px]">
          <Skeleton variant="text" width={140} height={16} className="mb-3" />
          <div className="space-y-2">
            <Skeleton variant="text" width="90%" height={10} />
            <Skeleton variant="text" width="80%" height={10} />
            <Skeleton variant="text" width="70%" height={10} />
          </div>
        </div>
      </div>

      {/* Pipeline Skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <Skeleton variant="text" width={160} height={24} className="mb-6" />
        <div className="flex gap-4 overflow-hidden">
          <SkeletonKanbanColumn />
          <SkeletonKanbanColumn />
          <SkeletonKanbanColumn />
          <SkeletonKanbanColumn />
        </div>
      </div>

      {/* Scorecard Skeleton */}
      <div className="max-w-xl">
        <SkeletonScorecard />
      </div>
    </div>
  );
}
