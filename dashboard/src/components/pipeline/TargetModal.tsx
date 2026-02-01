import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { Target } from '../../types';
import { Badge, getBuVariant, getStageVariant } from '../shared/Badge';
import { ActivityTimeline, type Activity } from '../shared/ActivityTimeline';
import { AddNoteForm, type ActivityType } from '../shared/AddNoteForm';
import { NextActionEditor } from '../shared/NextActionEditor';
import { ReminderBadge } from '../shared/ReminderBadge';
import { X, MessageSquare, Calendar, User, Clock, AlertCircle, Hash, Bell, Plus } from 'lucide-react';

interface TargetModalProps {
  target: Target;
  onClose: () => void;
}

interface NextActionOverride {
  nextAction: string;
  dueDate: string | null;
}

export function TargetModal({ target, onClose }: TargetModalProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [nextActionOverride, setNextActionOverride] = useState<NextActionOverride | null>(null);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [reminderNote, setReminderNote] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'activity'>('details');

  // Fetch activities for this target
  const fetchActivities = useCallback(async () => {
    try {
      const response = await fetch(`/api/activities?entityType=target&entityId=${target.id}`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoadingActivities(false);
    }
  }, [target.id]);

  // Fetch next action override
  const fetchNextActionOverride = useCallback(async () => {
    try {
      const response = await fetch(`/api/next-actions?entityType=target&entityId=${target.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setNextActionOverride(data);
        }
      }
    } catch (error) {
      console.error('Error fetching next action override:', error);
    }
  }, [target.id]);

  useEffect(() => {
    fetchActivities();
    fetchNextActionOverride();
  }, [fetchActivities, fetchNextActionOverride]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Add activity
  const handleAddActivity = async (type: ActivityType, content: string) => {
    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: 'target',
          entityId: target.id,
          type,
          content,
        }),
      });
      if (response.ok) {
        fetchActivities();
      }
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  };

  // Delete activity
  const handleDeleteActivity = async (id: number) => {
    try {
      const response = await fetch(`/api/activities/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setActivities(activities.filter(a => a.id !== id));
      }
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  // Save next action
  const handleSaveNextAction = async (nextAction: string, dueDate: string | null) => {
    try {
      const response = await fetch(`/api/next-actions?entityType=target&entityId=${target.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nextAction, dueDate }),
      });
      if (response.ok) {
        const data = await response.json();
        setNextActionOverride(data);
      }
    } catch (error) {
      console.error('Error saving next action:', error);
    }
  };

  // Create reminder
  const handleCreateReminder = async () => {
    if (!reminderDate || !reminderNote) return;
    try {
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: 'target',
          entityId: target.id,
          dueDate: reminderDate,
          note: reminderNote,
        }),
      });
      if (response.ok) {
        setShowReminderForm(false);
        setReminderNote('');
        setReminderDate('');
      }
    } catch (error) {
      console.error('Error creating reminder:', error);
    }
  };

  const effectiveNextAction = nextActionOverride?.nextAction || target.nextAction;
  const effectiveDueDate = nextActionOverride?.dueDate || null;

  const modal = (
    <div
      className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="relative p-5 border-b border-gray-100">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-xl font-semibold text-gray-900 tracking-tight pr-8">
            {target.company}
          </h2>

          <div className="flex items-center gap-2 mt-2">
            <Badge variant={getBuVariant(target.buFit)} dot>
              {target.buFit}
            </Badge>
            <Badge variant={getStageVariant(target.state)} dot>
              {target.state}
            </Badge>
            {effectiveDueDate && (
              <ReminderBadge dueDate={effectiveDueDate} showLabel />
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'details'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'activity'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Activity ({activities.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(90vh-220px)]">
          {activeTab === 'details' ? (
            <>
              {/* Trigger */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Trigger</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">{target.trigger}</p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <DetailItem
                  icon={<Hash className="w-4 h-4" />}
                  label="Channel"
                  value={target.channel || '—'}
                />
                <DetailItem
                  icon={<Calendar className="w-4 h-4" />}
                  label="Last Touch"
                  value={target.lastTouch || '—'}
                />
                <DetailItem
                  icon={<User className="w-4 h-4" />}
                  label="Owner"
                  value={target.owner}
                />
                <DetailItem
                  icon={<Clock className="w-4 h-4" />}
                  label="Days in State"
                  value={`${target.daysInState} days`}
                  highlight={target.isStale}
                />
              </div>

              {/* Stale Warning */}
              {target.isStale && (
                <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-700">Target is stale</p>
                    <p className="text-xs text-red-600">No activity for {target.daysInState} days</p>
                  </div>
                </div>
              )}

              {/* Next Action Editor */}
              <NextActionEditor
                nextAction={effectiveNextAction}
                dueDate={effectiveDueDate}
                onSave={handleSaveNextAction}
              />

              {/* Reminder Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-gray-400" />
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Reminder</h3>
                  </div>
                  {!showReminderForm && (
                    <button
                      onClick={() => setShowReminderForm(true)}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add Reminder
                    </button>
                  )}
                </div>

                {showReminderForm && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                    <input
                      type="date"
                      value={reminderDate}
                      onChange={(e) => setReminderDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                    <input
                      type="text"
                      value={reminderNote}
                      onChange={(e) => setReminderNote(e.target.value)}
                      placeholder="What do you need to do?"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleCreateReminder}
                        disabled={!reminderDate || !reminderNote}
                        className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:bg-gray-300"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setShowReminderForm(false)}
                        className="px-3 py-1.5 text-gray-600 text-sm hover:bg-gray-200 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Add Note Form */}
              <AddNoteForm onSubmit={handleAddActivity} />

              {/* Activity Timeline */}
              <div className="mt-6">
                <ActivityTimeline
                  activities={activities}
                  onDelete={handleDeleteActivity}
                  loading={loadingActivities}
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 active:bg-gray-900 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(modal, document.body);
}

interface DetailItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}

function DetailItem({ icon, label, value, highlight }: DetailItemProps) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-gray-400">{icon}</span>
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
      </div>
      <p className={`text-sm font-medium ${highlight ? 'text-red-600' : 'text-gray-900'}`}>
        {value}
      </p>
    </div>
  );
}
