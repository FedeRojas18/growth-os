import type { Target } from '../../types';
import { Badge, getBuVariant } from '../shared/Badge';

interface TargetModalProps {
  target: Target;
  onClose: () => void;
}

export function TargetModal({ target, onClose }: TargetModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{target.company}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={getBuVariant(target.buFit)}>{target.buFit}</Badge>
              <Badge variant={target.isStale ? 'error' : 'success'}>{target.state}</Badge>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Trigger */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Trigger</h3>
            <p className="text-gray-900">{target.trigger}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Channel</h3>
              <p className="text-gray-900">{target.channel || '—'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Last Touch</h3>
              <p className="text-gray-900">{target.lastTouch || '—'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Owner</h3>
              <p className="text-gray-900">{target.owner}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Days in State</h3>
              <p className={`${target.isStale ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                {target.daysInState} days
                {target.isStale && ' (stale)'}
              </p>
            </div>
          </div>

          {/* Next Action */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Next Action</h3>
            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{target.nextAction || 'No action defined'}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
