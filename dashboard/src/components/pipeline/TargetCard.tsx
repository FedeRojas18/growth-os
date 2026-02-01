import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Target } from '../../types';
import { Badge, getBuVariant } from '../shared/Badge';
import { Calendar, User, ArrowRight, AlertCircle, GripVertical } from 'lucide-react';

interface TargetCardProps {
  target: Target;
  onClick?: () => void;
  isDragging?: boolean;
  isOverlay?: boolean;
}

export function TargetCard({ target, onClick, isDragging: isDraggingProp, isOverlay }: TargetCardProps) {
  if (isOverlay) {
    return (
      <div className={getCardClass(target, true)}>
        {renderCardContent(target)}
      </div>
    );
  }

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: target.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isBeingDragged = Boolean(isDragging || isDraggingProp);

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={getCardClass(target, isBeingDragged, isDragging)}
    >
      {renderCardContent(target, listeners, attributes)}
    </div>
  );
}

function getCardClass(target: Target, isBeingDragged: boolean, isDragging?: boolean) {
  return `
    bg-white rounded-xl border p-4 cursor-pointer
    transition-all duration-200
    ${isBeingDragged
      ? 'shadow-lg ring-2 ring-indigo-400'
      : 'hover:shadow-md hover:-translate-y-0.5'
    }
    ${isDragging ? 'opacity-40' : ''}
    ${target.isStale
      ? 'border-l-[3px] border-l-red-400 border-t-gray-200 border-r-gray-200 border-b-gray-200'
      : 'border-gray-200'
    }
  `;
}

function renderCardContent(
  target: Target,
  listeners?: React.HTMLAttributes<HTMLButtonElement>,
  attributes?: React.HTMLAttributes<HTMLButtonElement>,
) {
  return (
    <>
      {/* Header with Drag Handle */}
      <div className="flex items-start gap-2 mb-2">
        {/* Drag Handle */}
        <button
          {...listeners}
          {...attributes}
          className="flex-shrink-0 p-1 -m-1 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <div className="flex-1 flex items-start justify-between gap-2">
          <h4 className="font-semibold text-gray-900 text-sm tracking-tight leading-tight">
            {target.company}
          </h4>
          <Badge variant={getBuVariant(target.buFit)} size="sm">
            {target.buFit}
          </Badge>
        </div>
      </div>

      {/* Trigger */}
      <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed pl-5">
        {target.trigger}
      </p>

      {/* Meta Info */}
      <div className="flex items-center justify-between text-xs text-gray-400 pl-5">
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
        <div className="mt-3 pt-3 border-t border-gray-100 pl-5">
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
        <div className="mt-3 ml-5 flex items-center gap-2 px-2.5 py-1.5 bg-red-50 rounded-lg">
          <AlertCircle className="w-3.5 h-3.5 text-red-500" />
          <span className="text-xs font-medium text-red-600">
            Stale for {target.daysInState} days
          </span>
        </div>
      )}
    </>
  );
}
