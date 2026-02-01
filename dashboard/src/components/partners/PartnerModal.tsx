import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Partner } from '../../types';
import { Badge, getBuVariant } from '../shared/Badge';
import { X, User, Calendar, ArrowRight, AlertCircle, Briefcase, Mail } from 'lucide-react';

interface PartnerModalProps {
  partner: Partner;
  onClose: () => void;
}

export function PartnerModal({ partner, onClose }: PartnerModalProps) {
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

  const modal = (
    <div
      className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden animate-scale-in"
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
            {partner.name}
          </h2>

          <div className="flex items-center gap-2 mt-2">
            <Badge variant={getBuVariant(partner.primaryBU)} dot>
              {partner.primaryBU || 'Partner'}
            </Badge>
            <Badge variant={partner.isStale ? 'error' : 'success'} dot>
              {partner.state}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Partner Type */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-gray-400" />
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Type</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">{partner.type || '—'}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <DetailItem
              icon={<Mail className="w-4 h-4" />}
              label="Key Contact"
              value={partner.keyContact || '—'}
            />
            <DetailItem
              icon={<Calendar className="w-4 h-4" />}
              label="Last Touch"
              value={partner.lastTouch || '—'}
            />
            <DetailItem
              icon={<User className="w-4 h-4" />}
              label="Owner"
              value={partner.owner || '—'}
            />
            <DetailItem
              icon={<Briefcase className="w-4 h-4" />}
              label="Primary BU"
              value={partner.primaryBU || '—'}
            />
          </div>

          {/* Next Action */}
          {partner.nextAction && (
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Next Action
                  </p>
                  <p className="text-sm text-gray-700">{partner.nextAction}</p>
                </div>
              </div>
            </div>
          )}

          {/* Stale Warning */}
          {partner.isStale && (
            <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-700">Partner is stale</p>
                <p className="text-xs text-red-600">No recent activity</p>
              </div>
            </div>
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
}

function DetailItem({ icon, label, value }: DetailItemProps) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-gray-400">{icon}</span>
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  );
}
