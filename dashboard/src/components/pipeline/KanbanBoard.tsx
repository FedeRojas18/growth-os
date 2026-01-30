import { useState } from 'react';
import type { Target, TargetState } from '../../types';
import { KanbanColumn } from './KanbanColumn';
import { TargetModal } from './TargetModal';
import { Filter, ChevronDown } from 'lucide-react';

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
      {/* Filters Bar */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter className="w-4 h-4" />
            <span>Filter:</span>
          </div>
          <div className="relative">
            <select
              value={buFilter}
              onChange={(e) => setBuFilter(e.target.value)}
              className="
                appearance-none bg-white border border-gray-200 rounded-lg
                pl-3 pr-8 py-1.5 text-sm text-gray-700
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                cursor-pointer hover:border-gray-300 transition-colors
              "
            >
              {buOptions.map((bu) => (
                <option key={bu} value={bu}>
                  {bu === 'all' ? 'All Business Units' : bu}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="text-sm text-gray-500">
          <span className="font-medium text-gray-700">{filteredTargets.length}</span>
          {filteredTargets.length !== targets.length && (
            <span> of {targets.length}</span>
          )}
          <span> targets</span>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
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
