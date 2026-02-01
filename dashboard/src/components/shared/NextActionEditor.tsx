import { useState, useEffect } from 'react';
import { ArrowRight, Calendar, Check, X, Edit2 } from 'lucide-react';
import { format, isToday, isPast, isTomorrow } from 'date-fns';

interface NextActionEditorProps {
  nextAction: string;
  dueDate: string | null;
  onSave: (nextAction: string, dueDate: string | null) => Promise<void>;
  disabled?: boolean;
}

export function NextActionEditor({
  nextAction,
  dueDate,
  onSave,
  disabled,
}: NextActionEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAction, setEditedAction] = useState(nextAction);
  const [editedDueDate, setEditedDueDate] = useState(dueDate || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEditedAction(nextAction);
    setEditedDueDate(dueDate || '');
  }, [nextAction, dueDate]);

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await onSave(editedAction, editedDueDate || null);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedAction(nextAction);
    setEditedDueDate(dueDate || '');
    setIsEditing(false);
  };

  const getDueDateStatus = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isPast(date) && !isToday(date)) return 'overdue';
    if (isToday(date)) return 'today';
    if (isTomorrow(date)) return 'tomorrow';
    return 'upcoming';
  };

  const dueDateStatus = getDueDateStatus(dueDate);

  const dueDateColors = {
    overdue: 'text-red-600 bg-red-50',
    today: 'text-amber-600 bg-amber-50',
    tomorrow: 'text-blue-600 bg-blue-50',
    upcoming: 'text-gray-600 bg-gray-100',
  };

  if (isEditing) {
    return (
      <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Next Action
          </label>
          <input
            type="text"
            value={editedAction}
            onChange={(e) => setEditedAction(e.target.value)}
            className="
              w-full px-3 py-2
              border border-gray-200 rounded-lg
              text-sm text-gray-900
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
            "
            placeholder="What's the next step?"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Due Date (optional)
          </label>
          <input
            type="date"
            value={editedDueDate}
            onChange={(e) => setEditedDueDate(e.target.value)}
            className="
              w-full px-3 py-2
              border border-gray-200 rounded-lg
              text-sm text-gray-900
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
            "
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="
              px-3 py-1.5 rounded-lg
              text-sm font-medium text-gray-600
              hover:bg-gray-200
              disabled:opacity-50
            "
          >
            <X className="w-4 h-4 inline mr-1" />
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !editedAction.trim()}
            className="
              px-3 py-1.5 rounded-lg
              text-sm font-medium text-white
              bg-indigo-600 hover:bg-indigo-700
              disabled:bg-gray-300 disabled:cursor-not-allowed
            "
          >
            <Check className="w-4 h-4 inline mr-1" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        group flex items-start gap-3 p-4 rounded-lg border border-gray-200
        hover:border-gray-300 hover:bg-gray-50 transition-colors
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      onClick={() => !disabled && setIsEditing(true)}
    >
      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
        <ArrowRight className="w-4 h-4 text-indigo-600" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Next Action
          </span>
          <button
            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 transition-all"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
          >
            <Edit2 className="w-3 h-3" />
          </button>
        </div>

        <p className="text-sm text-gray-900 font-medium">
          {nextAction || 'No next action set'}
        </p>

        {dueDate && dueDateStatus && (
          <div className="flex items-center gap-1.5 mt-2">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${dueDateColors[dueDateStatus]}`}>
              {dueDateStatus === 'overdue' && 'Overdue: '}
              {dueDateStatus === 'today' && 'Due Today'}
              {dueDateStatus === 'tomorrow' && 'Due Tomorrow'}
              {dueDateStatus === 'upcoming' && `Due ${format(new Date(dueDate), 'MMM d')}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
