export type TargetState = 'New' | 'Contacted' | 'Replied' | 'Meeting' | 'Passed' | 'Closed-Lost' | 'Nurture';

export interface Target {
  id: string;
  company: string;
  buFit: string;
  trigger: string;
  state: TargetState;
  lastTouch: string;
  channel: string;
  nextAction: string;
  owner: string;
  isStale: boolean;
  daysInState: number;
}

export interface PipelineSummary {
  byState: Record<TargetState, number>;
  totalActive: number;
  staleCount: number;
}

export interface TargetPipelineData {
  targets: Target[];
  summary: PipelineSummary;
  closedLost: Target[];
  nurture: Target[];
  lastUpdated: string;
}

export type PartnerState = 'Identified' | 'Researching' | 'Outreach' | 'Conversation' | 'Active' | 'Paused' | 'Closed';

export interface Partner {
  id: string;
  name: string;
  type: string;
  state: PartnerState;
  primaryBU: string;
  keyContact: string;
  lastTouch: string;
  nextAction: string;
  owner: string;
  isStale: boolean;
}

export interface PartnerSummary {
  byState: Record<PartnerState, number>;
  totalActive: number;
  staleCount: number;
}

export interface PartnerPipelineData {
  partners: Partner[];
  summary: PartnerSummary;
  activePartnerships: Partner[];
  paused: Partner[];
  lastUpdated: string;
}

export interface Metrics {
  testPlanShipped: boolean;
  targetsAdded: number;
  targetGoal: number;
  pipelineStateChanges: number;
  stateChangeGoal: number;
  partnerConversations: number;
  partnerGoal: number;
  execUpdateShipped: boolean;
  score: number;
  status: 'green' | 'yellow' | 'red';
  pipelineSummary: PipelineSummary;
  partnerSummary: PartnerSummary;
  lastUpdated: string;
}
