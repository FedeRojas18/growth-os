import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

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

// TypeScript types for use in the app
export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;

export type Reminder = typeof reminders.$inferSelect;
export type NewReminder = typeof reminders.$inferInsert;

export type NextActionOverride = typeof nextActionOverrides.$inferSelect;
export type NewNextActionOverride = typeof nextActionOverrides.$inferInsert;

export type StateOverride = typeof stateOverrides.$inferSelect;
export type NewStateOverride = typeof stateOverrides.$inferInsert;

export type EntityType = 'target' | 'partner';
export type ActivityType = 'note' | 'call' | 'email' | 'meeting' | 'state_change';
