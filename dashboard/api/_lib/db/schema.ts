import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// Activities: notes, calls, emails, meetings, state changes
export const activities = sqliteTable('activities', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  entityType: text('entity_type').notNull(), // 'target' | 'partner'
  entityId: text('entity_id').notNull(),
  type: text('type').notNull(), // 'note' | 'call' | 'email' | 'meeting' | 'state_change'
  content: text('content').notNull(),
  metadata: text('metadata'), // JSON string for state_change: { from, to }
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// Reminders: follow-up dates for targets/partners
export const reminders = sqliteTable('reminders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  entityType: text('entity_type').notNull(), // 'target' | 'partner'
  entityId: text('entity_id').notNull(),
  dueDate: text('due_date').notNull(), // ISO date string
  note: text('note').notNull(),
  isComplete: integer('is_complete', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// Next Action Overrides: extends/overrides markdown next action field
export const nextActionOverrides = sqliteTable('next_action_overrides', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  entityType: text('entity_type').notNull(), // 'target' | 'partner'
  entityId: text('entity_id').notNull(),
  nextAction: text('next_action').notNull(),
  dueDate: text('due_date'), // ISO date string, nullable
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// State Overrides: overrides markdown state for targets/partners
export const stateOverrides = sqliteTable('state_overrides', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  entityType: text('entity_type').notNull(), // 'target' | 'partner'
  entityId: text('entity_id').notNull(),
  state: text('state').notNull(),
  lastTouch: text('last_touch').notNull(), // ISO date string
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// Workflow Runs: Parent record for entire loop execution
export const workflowRuns = sqliteTable('workflow_runs', {
  id: text('id').primaryKey(),
  agentName: text('agent_name').notNull(),
  cycleId: text('cycle_id').notNull(),
  status: text('status').notNull(), // 'queued' | 'running' | 'passed' | 'failed' | 'cancelled'
  currentStage: text('current_stage'),
  currentAttempt: integer('current_attempt').default(1),
  maxAttempts: integer('max_attempts').notNull(),
  passThreshold: real('pass_threshold').notNull(),
  finalScore: real('final_score'),
  errorMessage: text('error_message'),
  inputs: text('inputs'),
  claimedAt: text('claimed_at'),
  claimedBy: text('claimed_by'),
  heartbeatAt: text('heartbeat_at'),
  cancelRequestedAt: text('cancel_requested_at'),
  startedAt: text('started_at'),
  completedAt: text('completed_at'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

// Workflow Events: Real-time event log for UI updates
export const workflowEvents = sqliteTable('workflow_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  runId: text('run_id').notNull(),
  eventType: text('event_type').notNull(), // 'stage_change' | 'log' | 'score_update' | 'error'
  stage: text('stage'),
  attempt: integer('attempt'),
  message: text('message'),
  metadata: text('metadata'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

// Workflow Artifacts: Store artifact content for UI display
export const workflowArtifacts = sqliteTable('workflow_artifacts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  runId: text('run_id').notNull(),
  attempt: integer('attempt').notNull(),
  artifactType: text('artifact_type').notNull(), // 'output' | 'evaluation'
  filename: text('filename').notNull(),
  content: text('content').notNull(),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

// TypeScript types for use in the app
export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;

export type Reminder = typeof reminders.$inferSelect;
export type NewReminder = typeof reminders.$inferInsert;

export type NextActionOverride = typeof nextActionOverrides.$inferSelect;
export type NewNextActionOverride = typeof nextActionOverrides.$inferInsert;

export type StateOverride = typeof stateOverrides.$inferSelect;
export type NewStateOverride = typeof stateOverrides.$inferInsert;

export type WorkflowRun = typeof workflowRuns.$inferSelect;
export type NewWorkflowRun = typeof workflowRuns.$inferInsert;

export type WorkflowEvent = typeof workflowEvents.$inferSelect;
export type NewWorkflowEvent = typeof workflowEvents.$inferInsert;

export type WorkflowArtifact = typeof workflowArtifacts.$inferSelect;
export type NewWorkflowArtifact = typeof workflowArtifacts.$inferInsert;

export type EntityType = 'target' | 'partner';
export type ActivityType = 'note' | 'call' | 'email' | 'meeting' | 'state_change';

export type WorkflowStatus = 'queued' | 'running' | 'passed' | 'failed' | 'cancelled';
export type WorkflowStage = 'producing' | 'evaluating' | 'revising';
export type WorkflowEventType = 'stage_change' | 'log' | 'score_update' | 'error';
