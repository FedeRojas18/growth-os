import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import type { Partner, Target, TodoItem } from '../types';
import { EmptyState } from '../components/shared/EmptyState';
import { Badge, getBuVariant } from '../components/shared/Badge';
import { TargetModal } from '../components/pipeline/TargetModal';
import { PartnerModal } from '../components/partners/PartnerModal';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ListChecks,
} from 'lucide-react';
import { addDays, format, isBefore, isToday, isWithinInterval, parseISO, startOfDay } from 'date-fns';

interface TodoSectionProps {
  title: string;
  icon: React.ReactNode;
  items: TodoItem[];
  emptyTitle: string;
  emptyDescription?: string;
  onComplete: (item: TodoItem) => void;
  onOpen: (item: TodoItem) => void;
}

export function Todos() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<Target | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [todoData, targetsData, partnersData] = await Promise.all([
          api.getTodos(),
          api.getTargets(),
          api.getPartners(),
        ]);

        setTodos(todoData.items);
        setTargets([
          ...targetsData.targets,
          ...targetsData.closedLost,
          ...targetsData.nurture,
        ]);
        setPartners([
          ...partnersData.partners,
          ...partnersData.activePartnerships,
          ...partnersData.paused,
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load todos');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const targetMap = useMemo(() => new Map(targets.map(t => [t.id, t])), [targets]);
  const partnerMap = useMemo(() => new Map(partners.map(p => [p.id, p])), [partners]);

  const categorized = useMemo(() => {
    const today = startOfDay(new Date());
    const upcomingWindow = { start: addDays(today, 1), end: addDays(today, 7) };

    const overdue: TodoItem[] = [];
    const dueToday: TodoItem[] = [];
    const upcoming: TodoItem[] = [];
    const later: TodoItem[] = [];
    const completed: TodoItem[] = [];

    const sorted = [...todos].sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    for (const item of sorted) {
      if (item.itemType === 'reminder' && item.isComplete) {
        completed.push(item);
        continue;
      }

      const dueDate = parseISO(item.dueDate);
      if (isBefore(dueDate, today)) {
        overdue.push(item);
      } else if (isToday(dueDate)) {
        dueToday.push(item);
      } else if (isWithinInterval(dueDate, upcomingWindow)) {
        upcoming.push(item);
      } else {
        later.push(item);
      }
    }

    return { overdue, dueToday, upcoming, later, completed };
  }, [todos]);

  const handleComplete = async (item: TodoItem) => {
    if (item.itemType !== 'reminder') return;
    setTodos(prev => prev.map(t =>
      t.id === item.id ? { ...t, isComplete: true } : t
    ));
    try {
      await api.updateReminder(item.sourceId, { isComplete: true });
    } catch (error) {
      console.error('Error completing reminder:', error);
      setTodos(prev => prev.map(t =>
        t.id === item.id ? { ...t, isComplete: false } : t
      ));
    }
  };

  const handleOpen = (item: TodoItem) => {
    if (item.entityType === 'target') {
      const target = targetMap.get(item.entityId);
      if (target) setSelectedTarget(target);
    } else {
      const partner = partnerMap.get(item.entityId);
      if (partner) setSelectedPartner(partner);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
          <div className="h-5 w-40 bg-gray-200 rounded mb-2" />
          <div className="h-3 w-64 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
        <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <p className="font-medium text-red-700">Failed to load todos</p>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Todos</h2>
            <p className="text-sm text-gray-500">What needs attention today</p>
          </div>
        </div>
      </div>

      {/* Overdue */}
      <TodoSection
        title="Overdue"
        icon={<AlertCircle className="w-4 h-4 text-red-500" />}
        items={categorized.overdue}
        emptyTitle="You're clear for today"
        emptyDescription="No overdue follow-ups or actions"
        onComplete={handleComplete}
        onOpen={handleOpen}
      />

      {/* Due Today */}
      <TodoSection
        title="Due Today"
        icon={<Clock className="w-4 h-4 text-amber-500" />}
        items={categorized.dueToday}
        emptyTitle="You're clear for today"
        emptyDescription="No actions due today"
        onComplete={handleComplete}
        onOpen={handleOpen}
      />

      {/* Upcoming */}
      <TodoSection
        title="Upcoming (Next 7 Days)"
        icon={<Calendar className="w-4 h-4 text-blue-500" />}
        items={categorized.upcoming}
        emptyTitle="No upcoming actions"
        emptyDescription="Nothing scheduled for the next week"
        onComplete={handleComplete}
        onOpen={handleOpen}
      />

      {/* Later */}
      <TodoSection
        title="Later"
        icon={<ArrowUpRight className="w-4 h-4 text-indigo-500" />}
        items={categorized.later}
        emptyTitle="Nothing scheduled later"
        emptyDescription="No actions beyond next week"
        onComplete={handleComplete}
        onOpen={handleOpen}
      />

      {/* Completed (optional) */}
      {categorized.completed.length > 0 && (
        <TodoSection
          title="Completed"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          items={categorized.completed}
          emptyTitle="No completed reminders yet"
          onComplete={handleComplete}
          onOpen={handleOpen}
        />
      )}

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

function TodoSection({
  title,
  icon,
  items,
  emptyTitle,
  emptyDescription,
  onComplete,
  onOpen,
}: TodoSectionProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
        {icon}
        <h3 className="text-base font-semibold text-gray-900 tracking-tight">{title}</h3>
        {items.length > 0 && (
          <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
            {items.length}
          </span>
        )}
      </div>

      <div className="p-4">
        {items.length === 0 ? (
          <EmptyState
            icon="inbox"
            title={emptyTitle}
            description={emptyDescription}
            compact
          />
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <TodoRow
                key={item.id}
                item={item}
                onComplete={onComplete}
                onOpen={onOpen}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TodoRow({
  item,
  onComplete,
  onOpen,
}: {
  item: TodoItem;
  onComplete: (item: TodoItem) => void;
  onOpen: (item: TodoItem) => void;
}) {
  const dueDate = parseISO(item.dueDate);
  const today = startOfDay(new Date());
  const isOverdue = isBefore(dueDate, today);
  const isDueToday = isToday(dueDate);

  const statusLabel = isOverdue ? 'Overdue' : isDueToday ? 'Today' : 'Upcoming';
  const statusClass = isOverdue
    ? 'bg-red-100 text-red-700'
    : isDueToday
      ? 'bg-amber-100 text-amber-700'
      : 'bg-blue-100 text-blue-700';
  const dueLabel = format(dueDate, 'MMM d');

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-sm font-semibold text-gray-900">{item.entityName}</span>
          <Badge variant={item.entityType === 'target' ? getBuVariant(item.entityTag || '') : 'default'} size="sm">
            {item.entityType === 'target' ? item.entityTag || 'Target' : 'Partner'}
          </Badge>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
            {item.itemType === 'reminder' ? 'Reminder' : 'Next Action'}
          </span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusClass}`}>
            {statusLabel}
          </span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
            Due {dueLabel}
          </span>
        </div>
        <p className="text-sm text-gray-700 line-clamp-2">{item.text}</p>
      </div>

      <div className="flex items-center gap-2">
        {item.itemType === 'reminder' && !item.isComplete && (
          <button
            onClick={() => onComplete(item)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          >
            Mark complete
          </button>
        )}
        <button
          onClick={() => onOpen(item)}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-900 text-white hover:bg-gray-800 inline-flex items-center gap-1"
        >
          Open
          <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
