CREATE TABLE `activities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`type` text NOT NULL,
	`content` text NOT NULL,
	`metadata` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `agent_runs` (
	`cycle_id` text NOT NULL,
	`agent_name` text NOT NULL,
	`attempt` integer NOT NULL,
	`status` text NOT NULL,
	`overall_score` real,
	`dimension_scores` text,
	`feedback` text,
	`artifact_path` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `next_action_overrides` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`next_action` text NOT NULL,
	`due_date` text,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reminders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`due_date` text NOT NULL,
	`note` text NOT NULL,
	`is_complete` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `state_overrides` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`state` text NOT NULL,
	`last_touch` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workflow_artifacts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`run_id` text NOT NULL,
	`attempt` integer NOT NULL,
	`artifact_type` text NOT NULL,
	`filename` text NOT NULL,
	`content` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workflow_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`run_id` text NOT NULL,
	`event_type` text NOT NULL,
	`stage` text,
	`attempt` integer,
	`message` text,
	`metadata` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workflow_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`agent_name` text NOT NULL,
	`cycle_id` text NOT NULL,
	`status` text NOT NULL,
	`current_stage` text,
	`current_attempt` integer DEFAULT 1,
	`max_attempts` integer NOT NULL,
	`pass_threshold` real NOT NULL,
	`final_score` real,
	`error_message` text,
	`inputs` text,
	`claimed_at` text,
	`claimed_by` text,
	`heartbeat_at` text,
	`cancel_requested_at` text,
	`started_at` text,
	`completed_at` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
