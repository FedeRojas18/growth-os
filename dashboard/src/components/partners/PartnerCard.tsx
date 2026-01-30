import type { Partner } from '../../types';
import { Badge, getBuVariant } from '../shared/Badge';

interface PartnerCardProps {
  partner: Partner;
  onClick?: () => void;
}

export function PartnerCard({ partner, onClick }: PartnerCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg border p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
        partner.isStale ? 'border-l-4 border-l-red-400' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-gray-900 text-sm">{partner.name}</h4>
        <Badge variant={getBuVariant(partner.primaryBU)}>{partner.primaryBU}</Badge>
      </div>

      <div className="flex flex-wrap gap-1 mb-2">
        {partner.type.split('+').map((type, i) => (
          <Badge key={i} variant="default">{type.trim()}</Badge>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span>📅</span>
          <span>{partner.lastTouch || '—'}</span>
        </span>
        <span className="flex items-center gap-1">
          <span>👤</span>
          <span>{partner.owner}</span>
        </span>
      </div>

      {partner.nextAction && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500 line-clamp-1">
            <span className="font-medium">Next:</span> {partner.nextAction}
          </p>
        </div>
      )}
    </div>
  );
}
