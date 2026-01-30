import { useEffect } from 'react';
import type { Target } from '../../types';
import { Badge, getBuVariant } from '../shared/Badge';
import { X, MessageSquare, Calendar, User, Clock, ArrowRight, AlertCircle, Hash } from 'lucide-react';

interface TargetModalProps {
  target: Target;
  onClose: () => void;
}

export function TargetModal({ target, onClose }: TargetModalProps) {
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
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div
      className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
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
            <Badge variant={target.isStale ? 'error' : 'success'} dot>
              {target.state}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(90vh-180px)]">
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

          {/* Next Action */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Next Action</h3>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <p className="text-gray-700 leading-relaxed">
                {target.nextAction || 'No action defined'}
              </p>
            </div>
          </div>
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
