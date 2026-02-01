import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Target, TargetState } from '../../types';
import { TargetCard } from './TargetCard';
import { EmptyColumn } from '../shared/EmptyState';

interface KanbanColumnProps {
  state: TargetState;
  targets: Target[];
  onTargetClick?: (target: Target) => void;
}

const stateConfig: Record<TargetState, { color: string; pill: string }> = {
  'New': { color: 'bg-blue-600', pill: 'bg-blue-200 text-blue-800 ring-1 ring-blue-300 ring-inset' },
  'Contacted': { color: 'bg-indigo-600', pill: 'bg-indigo-200 text-indigo-800 ring-1 ring-indigo-300 ring-inset' },
  'Replied': { color: 'bg-amber-600', pill: 'bg-amber-200 text-amber-900 ring-1 ring-amber-300 ring-inset' },
  'Meeting': { color: 'bg-orange-600', pill: 'bg-orange-200 text-orange-900 ring-1 ring-orange-300 ring-inset' },
  'Passed': { color: 'bg-emerald-600', pill: 'bg-emerald-200 text-emerald-900 ring-1 ring-emerald-300 ring-inset' },
  'Closed-Lost': { color: 'bg-red-600', pill: 'bg-red-200 text-red-900 ring-1 ring-red-300 ring-inset' },
  'Nurture': { color: 'bg-violet-600', pill: 'bg-violet-200 text-violet-900 ring-1 ring-violet-300 ring-inset' },
};

export function KanbanColumn({ state, targets, onTargetClick }: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: state,
  });

  const config = stateConfig[state];

  return (
    <div
      ref={setNodeRef}
      className={`
        flex-shrink-0 w-[280px] min-h-[200px] p-3 -m-2 rounded-xl transition-colors
        bg-white border border-slate-300 shadow-sm
        ${isOver ? 'bg-indigo-50 ring-2 ring-indigo-200 ring-inset' : ''}
      `}
    >
      {/* Column Header */}
      <div className="flex items-center gap-2.5 mb-4 px-1">
        <div className={`w-2 h-2 rounded-full ${config.color}`} />
        <h3 className="text-sm font-semibold text-slate-900 tracking-tight">{state}</h3>
        <span className={`
          text-xs font-semibold px-2 py-0.5 rounded-full
          ${targets.length > 0 ? config.pill : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200'}
        `}>
          {targets.length}
        </span>
      </div>

      {/* Cards */}
      <SortableContext
        id={state}
        items={targets.map((target) => target.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {targets.map((target, index) => (
            <div
              key={target.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <TargetCard
                target={target}
                onClick={() => onTargetClick?.(target)}
              />
            </div>
          ))}

          {targets.length === 0 && (
            <EmptyColumn message={isOver ? 'Drop here' : 'No targets'} />
          )}
        </div>
      </SortableContext>
    </div>
  );
}
