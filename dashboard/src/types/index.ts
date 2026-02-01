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
  nextActionDueDate: string | null;
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
  nextActionDueDate: string | null;
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

export interface TodoItem {
  id: string;
  itemType: 'reminder' | 'next_action';
  entityType: 'target' | 'partner';
  entityId: string;
  entityName: string;
  entityTag?: string;
  dueDate: string;
  text: string;
  isComplete?: boolean;
  sourceId: number;
}

export interface TodosResponse {
  items: TodoItem[];
  lastUpdated: string;
}

export interface DigestResponse {
  markdown: string;
}

export interface InsightsResponse {
  touchesByDay: Array<{ date: string; count: number }>;
  activityByTarget: Array<{ entityId: string; count: number }>;
  stateChanges: Array<{ entityId: string; from?: string; to?: string; createdAt: string }>;
  lastUpdated: string;
}
