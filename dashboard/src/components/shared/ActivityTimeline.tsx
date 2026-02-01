import { formatDistanceToNow } from 'date-fns';
import {
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  ArrowRight,
  Trash2,
} from 'lucide-react';

export interface Activity {
  id: number;
  entityType: string;
  entityId: string;
  entityName?: string;
  type: 'note' | 'call' | 'email' | 'meeting' | 'state_change';
  content: string;
  metadata: { from?: string; to?: string } | null;
  createdAt: Date | string;
}

interface ActivityTimelineProps {
  activities: Activity[];
  onDelete?: (id: number) => void;
  loading?: boolean;
}

const typeIcons = {
  note: MessageSquare,
  call: Phone,
  email: Mail,
  meeting: Calendar,
  state_change: ArrowRight,
};

const typeColors = {
  note: 'bg-blue-100 text-blue-600',
  call: 'bg-green-100 text-green-600',
  email: 'bg-purple-100 text-purple-600',
  meeting: 'bg-amber-100 text-amber-600',
  state_change: 'bg-gray-100 text-gray-600',
};

const typeLabels = {
  note: 'Note',
  call: 'Call',
  email: 'Email',
  meeting: 'Meeting',
  state_change: 'Status Change',
};

const stateStyles: Record<string, { badge: string; icon: string }> = {
  New: { badge: 'bg-blue-200 text-blue-800 ring-1 ring-blue-300 ring-inset', icon: 'bg-blue-200 text-blue-700' },
  Contacted: { badge: 'bg-indigo-200 text-indigo-800 ring-1 ring-indigo-300 ring-inset', icon: 'bg-indigo-200 text-indigo-700' },
  Replied: { badge: 'bg-amber-200 text-amber-900 ring-1 ring-amber-300 ring-inset', icon: 'bg-amber-200 text-amber-800' },
  Meeting: { badge: 'bg-orange-200 text-orange-900 ring-1 ring-orange-300 ring-inset', icon: 'bg-orange-200 text-orange-800' },
  Passed: { badge: 'bg-emerald-200 text-emerald-900 ring-1 ring-emerald-300 ring-inset', icon: 'bg-emerald-200 text-emerald-800' },
  'Closed-Lost': { badge: 'bg-red-200 text-red-900 ring-1 ring-red-300 ring-inset', icon: 'bg-red-200 text-red-800' },
  Nurture: { badge: 'bg-violet-200 text-violet-900 ring-1 ring-violet-300 ring-inset', icon: 'bg-violet-200 text-violet-800' },
};

export function ActivityTimeline({ activities, onDelete, loading }: ActivityTimelineProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-3 bg-gray-200 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No activity yet</p>
        <p className="text-xs text-gray-400 mt-1">Add a note to get started</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-4 bottom-4 w-px bg-gray-200" />

      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = typeIcons[activity.type];
          const toState = activity.metadata?.to;
          const stateStyle = toState ? stateStyles[toState] : undefined;
          const colorClass = activity.type === 'state_change' && stateStyle
            ? stateStyle.icon
            : typeColors[activity.type];
          const createdAt = typeof activity.createdAt === 'string'
            ? new Date(activity.createdAt)
            : activity.createdAt;

          return (
            <div key={activity.id} className="relative flex gap-3 group">
              {/* Icon */}
              <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${colorClass}`}>
                <Icon className="w-4 h-4" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-gray-500">
                        {typeLabels[activity.type]}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(createdAt, { addSuffix: true })}
                      </span>
                    </div>

                    {activity.type === 'state_change' && activity.metadata ? (
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        {activity.entityName && (
                          <span className="text-gray-900 font-semibold">
                            {activity.entityName}
                          </span>
                        )}
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-600">
                          {activity.metadata.from}
                        </span>
                        <ArrowRight className="w-3 h-3 text-gray-400" />
                        <span
                          className={`px-2 py-0.5 rounded font-medium ${
                            stateStyle?.badge || 'bg-indigo-100 text-indigo-700'
                          }`}
                        >
                          {activity.metadata.to}
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {activity.entityName ? `${activity.entityName}: ` : ''}{activity.content}
                      </p>
                    )}
                  </div>

                  {/* Delete button */}
                  {onDelete && activity.type !== 'state_change' && (
                    <button
                      onClick={() => onDelete(activity.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
