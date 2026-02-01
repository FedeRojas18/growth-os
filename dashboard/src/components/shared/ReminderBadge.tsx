import { Bell, AlertCircle, Clock, Check } from 'lucide-react';
import { format, isToday, isPast, isTomorrow, differenceInDays } from 'date-fns';

export interface Reminder {
  id: number;
  entityType: string;
  entityId: string;
  dueDate: string;
  note: string;
  isComplete: boolean;
  createdAt: Date | string;
}

interface ReminderBadgeProps {
  dueDate: string | null;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export function ReminderBadge({ dueDate, size = 'sm', showLabel = false }: ReminderBadgeProps) {
  if (!dueDate) return null;

  const date = new Date(dueDate);
  const isOverdue = isPast(date) && !isToday(date);
  const isDueToday = isToday(date);
  const isDueTomorrow = isTomorrow(date);

  let colorClass = 'bg-gray-100 text-gray-600';
  let Icon = Clock;
  let label = format(date, 'MMM d');

  if (isOverdue) {
    colorClass = 'bg-red-100 text-red-700';
    Icon = AlertCircle;
    const daysOverdue = differenceInDays(new Date(), date);
    label = `${daysOverdue}d overdue`;
  } else if (isDueToday) {
    colorClass = 'bg-amber-100 text-amber-700';
    Icon = Bell;
    label = 'Today';
  } else if (isDueTomorrow) {
    colorClass = 'bg-blue-100 text-blue-700';
    Icon = Clock;
    label = 'Tomorrow';
  }

  const sizeClasses = size === 'sm'
    ? 'px-1.5 py-0.5 text-[10px] gap-1'
    : 'px-2 py-1 text-xs gap-1.5';

  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${colorClass} ${sizeClasses}`}>
      <Icon className={iconSize} />
      {showLabel && <span>{label}</span>}
    </span>
  );
}

interface ReminderListItemProps {
  reminder: Reminder;
  entityName: string;
  onComplete?: (id: number) => void;
}

export function ReminderListItem({ reminder, entityName, onComplete }: ReminderListItemProps) {
  const date = new Date(reminder.dueDate);
  const isOverdue = isPast(date) && !isToday(date);
  const isDueToday = isToday(date);

  let statusClass = 'border-gray-200';
  if (reminder.isComplete) {
    statusClass = 'border-gray-200 bg-gray-50 opacity-60';
  } else if (isOverdue) {
    statusClass = 'border-red-200 bg-red-50';
  } else if (isDueToday) {
    statusClass = 'border-amber-200 bg-amber-50';
  }

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${statusClass}`}>
      {/* Complete checkbox */}
      <button
        onClick={() => onComplete?.(reminder.id)}
        className={`
          mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0
          transition-colors
          ${reminder.isComplete
            ? 'bg-emerald-500 border-emerald-500 text-white'
            : 'border-gray-300 hover:border-indigo-500'
          }
        `}
      >
        {reminder.isComplete && <Check className="w-3 h-3" />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900 truncate">
            {entityName}
          </span>
          <ReminderBadge dueDate={reminder.dueDate} showLabel />
        </div>
        <p className={`text-sm mt-0.5 ${reminder.isComplete ? 'text-gray-400 line-through' : 'text-gray-600'}`}>
          {reminder.note}
        </p>
      </div>
    </div>
  );
}

interface ReminderCountBadgeProps {
  count: number;
}

export function ReminderCountBadge({ count }: ReminderCountBadgeProps) {
  if (count === 0) return null;

  return (
    <span className="
      inline-flex items-center justify-center
      min-w-[18px] h-[18px] px-1
      text-[10px] font-bold
      bg-red-500 text-white rounded-full
    ">
      {count > 99 ? '99+' : count}
    </span>
  );
}
