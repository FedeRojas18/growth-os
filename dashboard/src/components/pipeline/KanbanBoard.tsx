import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  MeasuringStrategy,
  type CollisionDetection,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { Target, TargetState } from '../../types';
import { KanbanColumn } from './KanbanColumn';
import { TargetCard } from './TargetCard';
import { TargetModal } from './TargetModal';
import { Filter, ChevronDown, Search, Sparkles, CalendarDays } from 'lucide-react';
import { api } from '../../api/client';
import { addDays, format } from 'date-fns';

interface KanbanBoardProps {
  targets: Target[];
  onTargetStateChange?: (targetId: string, newState: TargetState, oldState: TargetState) => void;
}

const KANBAN_STATES: TargetState[] = ['New', 'Contacted', 'Replied', 'Meeting', 'Passed'];

const SUGGESTED_ACTIONS: Record<TargetState, { text: string; days: number } | null> = {
  New: { text: 'Research contact + draft intro', days: 1 },
  Contacted: { text: 'Follow up if no reply', days: 3 },
  Replied: { text: 'Schedule a call', days: 2 },
  Meeting: { text: 'Send recap + next steps', days: 1 },
  Passed: null,
  'Closed-Lost': null,
  Nurture: null,
};

const SUPPRESSION_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

function getSuppressionKey(entityId: string, from: string, to: string) {
  return `growthos:suggestion:${entityId}:${from}:${to}`;
}

function isSuppressed(entityId: string, from: string, to: string) {
  if (typeof window === 'undefined') return false;
  const key = getSuppressionKey(entityId, from, to);
  const raw = window.localStorage.getItem(key);
  if (!raw) return false;
  const timestamp = Number(raw);
  if (Number.isNaN(timestamp)) return false;
  return Date.now() - timestamp < SUPPRESSION_TTL_MS;
}

function suppressSuggestion(entityId: string, from: string, to: string) {
  if (typeof window === 'undefined') return;
  const key = getSuppressionKey(entityId, from, to);
  window.localStorage.setItem(key, String(Date.now()));
}

export function KanbanBoard({ targets, onTargetStateChange }: KanbanBoardProps) {
  const [selectedTarget, setSelectedTarget] = useState<Target | null>(null);
  const [buFilter, setBuFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [localTargets, setLocalTargets] = useState<Target[]>(targets);
  const [suggestion, setSuggestion] = useState<{
    entityId: string;
    entityName: string;
    from: TargetState;
    to: TargetState;
    text: string;
    dueDate: string;
  } | null>(null);
  const [suggestionText, setSuggestionText] = useState('');
  const [suggestionDueDate, setSuggestionDueDate] = useState('');
  const [createReminder, setCreateReminder] = useState(true);

  // Only sync from props when the incoming data actually changes
  const targetsSignature = useMemo(
    () => targets.map(t => `${t.id}:${t.state}:${t.lastTouch}`).join('|'),
    [targets]
  );
  const lastSignatureRef = useRef(targetsSignature);
  useEffect(() => {
    if (targetsSignature !== lastSignatureRef.current) {
      setLocalTargets(targets);
      lastSignatureRef.current = targetsSignature;
    }
  }, [targetsSignature, targets]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const matchesSearch = (target: Target) => {
    if (!normalizedSearch) return true;
    const haystack = `${target.company} ${target.trigger}`.toLowerCase();
    return haystack.includes(normalizedSearch);
  };

  const filteredTargets = localTargets
    .filter(t => buFilter === 'all' || t.buFit.toLowerCase().includes(buFilter.toLowerCase()))
    .filter(matchesSearch);

  const targetsByState = KANBAN_STATES.reduce((acc, state) => {
    acc[state] = filteredTargets.filter(t => t.state === state);
    return acc;
  }, {} as Record<TargetState, Target[]>);

  const buOptions = ['all', ...new Set(localTargets.map(t => t.buFit))];

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const targetId = active.id as string;
    const overId = over.id as string;
    let newState: TargetState | undefined;
    const overContainer = over.data?.current?.sortable?.containerId as TargetState | undefined;

    if (overContainer && KANBAN_STATES.includes(overContainer)) {
      newState = overContainer;
    } else if (KANBAN_STATES.includes(overId as TargetState)) {
      newState = overId as TargetState;
    } else {
      const overTarget = localTargets.find(t => t.id === overId);
      newState = overTarget?.state;
    }
    const target = localTargets.find(t => t.id === targetId);

    if (!target || !newState || target.state === newState) return;

    const oldState = target.state;

    // Optimistically update local state
    setLocalTargets(prev =>
      prev.map(t =>
        t.id === targetId
          ? { ...t, state: newState, lastTouch: new Date().toISOString().split('T')[0] }
          : t
      )
    );

    // Call API to persist state change
    try {
      await api.updateState('target', targetId, newState, oldState);
      onTargetStateChange?.(targetId, newState, oldState);
    } catch (error) {
      console.error('Error updating target state:', error);
      // Revert on error
      setLocalTargets(prev =>
        prev.map(t =>
          t.id === targetId ? { ...t, state: oldState } : t
        )
      );
    }

    const rule = SUGGESTED_ACTIONS[newState];
    if (rule && !isSuppressed(targetId, oldState, newState)) {
      const dueDate = format(addDays(new Date(), rule.days), 'yyyy-MM-dd');
      setSuggestion({
        entityId: targetId,
        entityName: target.company,
        from: oldState,
        to: newState,
        text: rule.text,
        dueDate,
      });
      setSuggestionText(rule.text);
      setSuggestionDueDate(dueDate);
      setCreateReminder(true);
    }
  }, [localTargets, onTargetStateChange]);

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  const activeTarget = activeId
    ? localTargets.find(t => t.id === activeId) || null
    : null;

  const collisionDetection: CollisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      const columnCollision = pointerCollisions.find(c =>
        KANBAN_STATES.includes(c.id as TargetState)
      );
      return columnCollision ? [columnCollision] : pointerCollisions;
    }
    return closestCorners(args);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div>
        {/* Filters Bar */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-3">
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
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search targets..."
                className="
                  bg-white border border-gray-200 rounded-lg
                  pl-9 pr-3 py-1.5 text-sm text-gray-700
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                  placeholder:text-gray-400
                  w-[220px] sm:w-[260px]
                "
              />
            </div>
          </div>

          <div className="text-sm text-gray-500">
            <span className="font-medium text-gray-700">{filteredTargets.length}</span>
            {filteredTargets.length !== localTargets.length && (
              <span> of {localTargets.length}</span>
            )}
            <span> targets</span>
          </div>
        </div>

        {suggestion && (
          <div className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-white border border-indigo-100 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Suggested next action
                </p>
                <div className="mt-1 text-xs text-gray-600 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{suggestion.entityName}</span>
                    <span className="text-gray-400">•</span>
                    <span className="inline-flex items-center gap-1 text-gray-500">
                      <CalendarDays className="w-3 h-3" />
                      Due
                    </span>
                    <input
                      type="date"
                      value={suggestionDueDate}
                      onChange={(e) => setSuggestionDueDate(e.target.value)}
                      className="border border-gray-200 rounded-md px-2 py-1 text-[11px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <textarea
                    value={suggestionText}
                    onChange={(e) => setSuggestionText(e.target.value)}
                    rows={2}
                    className="w-full border border-gray-200 rounded-md px-2 py-1 text-[11px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <label className="inline-flex items-center gap-2 text-xs text-gray-600 mt-2">
                  <input
                    type="checkbox"
                    checked={createReminder}
                    onChange={(e) => setCreateReminder(e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Also create reminder
                </label>
              </div>
            </div>
            <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    try {
                      const nextActionText = suggestionText.trim();
                      const nextActionDue = suggestionDueDate || suggestion.dueDate;
                      if (!nextActionText) {
                        setSuggestion(null);
                        return;
                      }
                      await api.updateNextAction('target', suggestion.entityId, {
                        nextAction: nextActionText,
                        dueDate: nextActionDue,
                      });
                      if (createReminder) {
                        await api.createReminder({
                          entityType: 'target',
                          entityId: suggestion.entityId,
                          dueDate: nextActionDue,
                          note: nextActionText,
                        });
                      }
                      setLocalTargets(prev =>
                        prev.map(t =>
                          t.id === suggestion.entityId
                          ? { ...t, nextAction: nextActionText, nextActionDueDate: nextActionDue }
                          : t
                        )
                      );
                    } catch (error) {
                      console.error('Error applying suggested action:', error);
                  } finally {
                    setSuggestion(null);
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700"
              >
                Apply
              </button>
              <button
                onClick={() => {
                  suppressSuggestion(suggestion.entityId, suggestion.from, suggestion.to);
                  setSuggestion(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-white text-gray-600 text-xs font-medium border border-gray-200 hover:bg-gray-50"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

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

        {/* Drag Overlay (portal to body to avoid transformed ancestors) */}
        {typeof document !== 'undefined' && createPortal(
          <DragOverlay style={{ pointerEvents: 'none', zIndex: 1000 }}>
            {activeTarget ? (
              <div className="opacity-95">
                <TargetCard target={activeTarget} isDragging isOverlay />
              </div>
            ) : null}
          </DragOverlay>,
          document.body
        )}

        {/* Target Detail Modal */}
        {selectedTarget && (
          <TargetModal
            target={selectedTarget}
            onClose={() => setSelectedTarget(null)}
          />
        )}
      </div>
    </DndContext>
  );
}
