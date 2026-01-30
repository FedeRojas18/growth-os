import type { Target, TargetState } from '../../types';
import { TargetCard } from './TargetCard';

interface KanbanColumnProps {
  state: TargetState;
  targets: Target[];
  onTargetClick?: (target: Target) => void;
}

const stateColors: Record<TargetState, string> = {
  'New': 'bg-gray-500',
  'Contacted': 'bg-blue-500',
  'Replied': 'bg-yellow-500',
  'Meeting': 'bg-orange-500',
  'Passed': 'bg-green-500',
  'Closed-Lost': 'bg-red-500',
  'Nurture': 'bg-purple-500',
};

export function KanbanColumn({ state, targets, onTargetClick }: KanbanColumnProps) {
  return (
    <div className="flex-shrink-0 w-72">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-2 h-2 rounded-full ${stateColors[state]}`} />
        <h3 className="font-medium text-gray-700">{state}</h3>
        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
          {targets.length}
        </span>
      </div>

      <div className="space-y-3">
        {targets.map((target) => (
          <TargetCard
            key={target.id}
            target={target}
            onClick={() => onTargetClick?.(target)}
          />
        ))}

        {targets.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
            No targets
          </div>
        )}
      </div>
    </div>
  );
}
