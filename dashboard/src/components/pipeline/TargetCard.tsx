import type { Target } from '../../types';
import { Badge, getBuVariant } from '../shared/Badge';
import { Calendar, User, ArrowRight, AlertCircle } from 'lucide-react';

interface TargetCardProps {
  target: Target;
  onClick?: () => void;
}

export function TargetCard({ target, onClick }: TargetCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-xl border p-4 cursor-pointer
        transition-all duration-200 hover:shadow-md hover:-translate-y-0.5
        ${target.isStale
          ? 'border-l-[3px] border-l-red-400 border-t-gray-200 border-r-gray-200 border-b-gray-200'
          : 'border-gray-200'
        }
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-semibold text-gray-900 text-sm tracking-tight leading-tight">
          {target.company}
        </h4>
        <Badge variant={getBuVariant(target.buFit)} size="sm">
          {target.buFit}
        </Badge>
      </div>

      {/* Trigger */}
      <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
        {target.trigger}
      </p>

      {/* Meta Info */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3 h-3" />
          <span>{target.lastTouch || '—'}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <User className="w-3 h-3" />
          <span>{target.owner}</span>
        </span>
      </div>

      {/* Next Action */}
      {target.nextAction && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-start gap-2">
            <ArrowRight className="w-3 h-3 text-indigo-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
              {target.nextAction}
            </p>
          </div>
        </div>
      )}

      {/* Stale Warning */}
      {target.isStale && (
        <div className="mt-3 flex items-center gap-2 px-2.5 py-1.5 bg-red-50 rounded-lg">
          <AlertCircle className="w-3.5 h-3.5 text-red-500" />
          <span className="text-xs font-medium text-red-600">
            Stale for {target.daysInState} days
          </span>
        </div>
      )}
    </div>
  );
}
