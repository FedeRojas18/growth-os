import type { Partner } from '../../types';
import { Badge, getBuVariant } from '../shared/Badge';
import { Calendar, User, ArrowRight, AlertCircle } from 'lucide-react';

interface PartnerCardProps {
  partner: Partner;
  onClick?: () => void;
}

export function PartnerCard({ partner, onClick }: PartnerCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-xl border p-4 cursor-pointer
        transition-all duration-200 hover:shadow-md hover:-translate-y-0.5
        ${partner.isStale
          ? 'border-l-[3px] border-l-red-400 border-t-gray-200 border-r-gray-200 border-b-gray-200'
          : 'border-gray-200'
        }
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-semibold text-gray-900 text-sm tracking-tight leading-tight">
          {partner.name}
        </h4>
        <Badge variant={getBuVariant(partner.primaryBU)} size="sm">
          {partner.primaryBU}
        </Badge>
      </div>

      {/* Partner Types */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {partner.type.split('+').map((type, i) => (
          <Badge key={i} variant="default" size="sm">
            {type.trim()}
          </Badge>
        ))}
      </div>

      {/* Key Contact */}
      {partner.keyContact && (
        <p className="text-xs text-gray-500 mb-2">
          Contact: <span className="text-gray-700">{partner.keyContact}</span>
        </p>
      )}

      {/* Meta Info */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3 h-3" />
          <span>{partner.lastTouch || '—'}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <User className="w-3 h-3" />
          <span>{partner.owner}</span>
        </span>
      </div>

      {/* Next Action */}
      {partner.nextAction && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-start gap-2">
            <ArrowRight className="w-3 h-3 text-indigo-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
              {partner.nextAction}
            </p>
          </div>
        </div>
      )}

      {/* Stale Warning */}
      {partner.isStale && (
        <div className="mt-3 flex items-center gap-2 px-2.5 py-1.5 bg-red-50 rounded-lg">
          <AlertCircle className="w-3.5 h-3.5 text-red-500" />
          <span className="text-xs font-medium text-red-600">
            Needs attention
          </span>
        </div>
      )}
    </div>
  );
}
