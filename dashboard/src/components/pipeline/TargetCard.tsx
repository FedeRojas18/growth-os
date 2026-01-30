import type { Target } from '../../types';
import { Badge, getBuVariant } from '../shared/Badge';

interface TargetCardProps {
  target: Target;
  onClick?: () => void;
}

export function TargetCard({ target, onClick }: TargetCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg border p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
        target.isStale ? 'border-l-4 border-l-red-400' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-gray-900 text-sm">{target.company}</h4>
        <Badge variant={getBuVariant(target.buFit)}>{target.buFit}</Badge>
      </div>

      <p className="text-xs text-gray-600 line-clamp-2 mb-3">{target.trigger}</p>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span>📅</span>
          <span>{target.lastTouch || '—'}</span>
        </span>
        <span className="flex items-center gap-1">
          <span>👤</span>
          <span>{target.owner}</span>
        </span>
      </div>

      {target.nextAction && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500 line-clamp-1">
            <span className="font-medium">Next:</span> {target.nextAction}
          </p>
        </div>
      )}

      {target.isStale && (
        <div className="mt-2">
          <Badge variant="error">Stale ({target.daysInState}d)</Badge>
        </div>
      )}
    </div>
  );
}
