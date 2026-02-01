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

const stateConfig: Record<TargetState, { color: string; bgColor: string }> = {
  'New': { color: 'bg-slate-500', bgColor: 'bg-slate-50' },
  'Contacted': { color: 'bg-blue-500', bgColor: 'bg-blue-50' },
  'Replied': { color: 'bg-amber-500', bgColor: 'bg-amber-50' },
  'Meeting': { color: 'bg-orange-500', bgColor: 'bg-orange-50' },
  'Passed': { color: 'bg-emerald-500', bgColor: 'bg-emerald-50' },
  'Closed-Lost': { color: 'bg-red-500', bgColor: 'bg-red-50' },
  'Nurture': { color: 'bg-violet-500', bgColor: 'bg-violet-50' },
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
        flex-shrink-0 w-[280px] min-h-[200px] p-2 -m-2 rounded-xl transition-colors
        ${isOver ? 'bg-indigo-50 ring-2 ring-indigo-200 ring-inset' : ''}
      `}
    >
      {/* Column Header */}
      <div className="flex items-center gap-2.5 mb-4 px-1">
        <div className={`w-2 h-2 rounded-full ${config.color}`} />
        <h3 className="font-semibold text-gray-700 text-sm tracking-tight">{state}</h3>
        <span className={`
          text-xs font-medium px-2 py-0.5 rounded-full
          ${targets.length > 0 ? `${config.bgColor} text-gray-600` : 'bg-gray-100 text-gray-400'}
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
