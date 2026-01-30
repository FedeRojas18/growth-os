import { useState } from 'react';
import type { Target, TargetState } from '../../types';
import { KanbanColumn } from './KanbanColumn';
import { TargetModal } from './TargetModal';

interface KanbanBoardProps {
  targets: Target[];
}

const KANBAN_STATES: TargetState[] = ['New', 'Contacted', 'Replied', 'Meeting', 'Passed'];

export function KanbanBoard({ targets }: KanbanBoardProps) {
  const [selectedTarget, setSelectedTarget] = useState<Target | null>(null);
  const [buFilter, setBuFilter] = useState<string>('all');

  const filteredTargets = buFilter === 'all'
    ? targets
    : targets.filter(t => t.buFit.toLowerCase().includes(buFilter.toLowerCase()));

  const targetsByState = KANBAN_STATES.reduce((acc, state) => {
    acc[state] = filteredTargets.filter(t => t.state === state);
    return acc;
  }, {} as Record<TargetState, Target[]>);

  const buOptions = ['all', ...new Set(targets.map(t => t.buFit))];

  return (
    <div>
      {/* Filters */}
      <div className="mb-4 flex items-center gap-4">
        <label className="text-sm text-gray-600">
          Filter by BU:
          <select
            value={buFilter}
            onChange={(e) => setBuFilter(e.target.value)}
            className="ml-2 border border-gray-300 rounded px-2 py-1 text-sm"
          >
            {buOptions.map((bu) => (
              <option key={bu} value={bu}>
                {bu === 'all' ? 'All BUs' : bu}
              </option>
            ))}
          </select>
        </label>
        <span className="text-sm text-gray-500">
          Showing {filteredTargets.length} of {targets.length} targets
        </span>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {KANBAN_STATES.map((state) => (
          <KanbanColumn
            key={state}
            state={state}
            targets={targetsByState[state]}
            onTargetClick={setSelectedTarget}
          />
        ))}
      </div>

      {/* Target Detail Modal */}
      {selectedTarget && (
        <TargetModal
          target={selectedTarget}
          onClose={() => setSelectedTarget(null)}
        />
      )}
    </div>
  );
}
