import type { Partner, PartnerState } from '../../types';
import { PartnerCard } from './PartnerCard';
import { EmptyColumn } from '../shared/EmptyState';

interface PartnerKanbanProps {
  partners: Partner[];
}

const PARTNER_STATES: PartnerState[] = ['Identified', 'Researching', 'Outreach', 'Conversation', 'Active'];

const stateConfig: Record<PartnerState, { color: string; bgColor: string }> = {
  'Identified': { color: 'bg-slate-500', bgColor: 'bg-slate-50' },
  'Researching': { color: 'bg-blue-500', bgColor: 'bg-blue-50' },
  'Outreach': { color: 'bg-amber-500', bgColor: 'bg-amber-50' },
  'Conversation': { color: 'bg-orange-500', bgColor: 'bg-orange-50' },
  'Active': { color: 'bg-emerald-500', bgColor: 'bg-emerald-50' },
  'Paused': { color: 'bg-violet-500', bgColor: 'bg-violet-50' },
  'Closed': { color: 'bg-red-500', bgColor: 'bg-red-50' },
};

export function PartnerKanban({ partners }: PartnerKanbanProps) {
  const partnersByState = PARTNER_STATES.reduce((acc, state) => {
    acc[state] = partners.filter(p => p.state === state);
    return acc;
  }, {} as Record<PartnerState, Partner[]>);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
      {PARTNER_STATES.map((state) => {
        const config = stateConfig[state];
        const statePartners = partnersByState[state];

        return (
          <div key={state} className="flex-shrink-0 w-[280px]">
            {/* Column Header */}
            <div className="flex items-center gap-2.5 mb-4 px-1">
              <div className={`w-2 h-2 rounded-full ${config.color}`} />
              <h3 className="font-semibold text-gray-700 text-sm tracking-tight">{state}</h3>
              <span className={`
                text-xs font-medium px-2 py-0.5 rounded-full
                ${statePartners.length > 0 ? `${config.bgColor} text-gray-600` : 'bg-gray-100 text-gray-400'}
              `}>
                {statePartners.length}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-3">
              {statePartners.map((partner, index) => (
                <div
                  key={partner.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <PartnerCard partner={partner} />
                </div>
              ))}

              {statePartners.length === 0 && (
                <EmptyColumn message="No partners" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
