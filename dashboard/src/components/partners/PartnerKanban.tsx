import type { Partner, PartnerState } from '../../types';
import { PartnerCard } from './PartnerCard';

interface PartnerKanbanProps {
  partners: Partner[];
}

const PARTNER_STATES: PartnerState[] = ['Identified', 'Researching', 'Outreach', 'Conversation', 'Active'];

const stateColors: Record<PartnerState, string> = {
  'Identified': 'bg-gray-500',
  'Researching': 'bg-blue-500',
  'Outreach': 'bg-yellow-500',
  'Conversation': 'bg-orange-500',
  'Active': 'bg-green-500',
  'Paused': 'bg-purple-500',
  'Closed': 'bg-red-500',
};

export function PartnerKanban({ partners }: PartnerKanbanProps) {
  const partnersByState = PARTNER_STATES.reduce((acc, state) => {
    acc[state] = partners.filter(p => p.state === state);
    return acc;
  }, {} as Record<PartnerState, Partner[]>);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {PARTNER_STATES.map((state) => (
        <div key={state} className="flex-shrink-0 w-72">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-2 h-2 rounded-full ${stateColors[state]}`} />
            <h3 className="font-medium text-gray-700">{state}</h3>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {partnersByState[state].length}
            </span>
          </div>

          <div className="space-y-3">
            {partnersByState[state].map((partner) => (
              <PartnerCard key={partner.id} partner={partner} />
            ))}

            {partnersByState[state].length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                No partners
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
