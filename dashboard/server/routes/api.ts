import { Router } from 'express';
import { randomUUID } from 'crypto';
import path from 'path';
import { pathToFileURL } from 'url';
import { eq, asc } from 'drizzle-orm';
import { parseTargetPipeline } from '../parsers/target-pipeline.js';
import { parsePartnerPipeline } from '../parsers/partnership-pipeline.js';
import { dbRouter } from './db.js';
import { db } from '../db/client.js';
import { reminders, nextActionOverrides, activities, agentRuns } from '../db/schema.js';
type LoopEngineModule = {
  createLoopEngine?: typeof import('../../../SYSTEM/orchestrator/loop-engine.ts').createLoopEngine;
  default?: {
    createLoopEngine?: typeof import('../../../SYSTEM/orchestrator/loop-engine.ts').createLoopEngine;
  };
};

function createCycleId(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  const stamp = [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
  ].join('-');
  const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const suffix = randomUUID().split('-')[0];
  return `${stamp}-${time}-${suffix}`;
}

export function apiRouter(rootDir: string): Router {
  const router = Router();
  let loopEnginePromise: Promise<LoopEngineModule> | null = null;

  const loadLoopEngine = async (): Promise<LoopEngineModule> => {
    if (loopEnginePromise) return loopEnginePromise;
    const loopEnginePath = path.join(rootDir, 'SYSTEM', 'orchestrator', 'loop-engine.ts');
    const url = pathToFileURL(loopEnginePath).href;
    loopEnginePromise = import(url) as Promise<LoopEngineModule>;
    return loopEnginePromise;
  };

  // Mount database routes (activities, reminders, next-actions, state-overrides)
  router.use('/', dbRouter());

  // POST /api/agents/run?agent=target_builder - Run agent loop
  router.post('/agents/run', async (req, res) => {
    try {
      const agentName = req.query.agent as string | undefined;
      if (!agentName) {
        return res.status(400).json({ error: 'Missing required query param: agent' });
      }

      const cycleId = createCycleId();
      const defaultInputs = {
        thesis: 'LATAM Fintech Series A Recipients',
        trigger_library: 'SYSTEM/config/triggers.yaml',
        target_history: 'KNOWLEDGE/target-history.md',
        active_pipeline: 'KNOWLEDGE/target-pipeline.md',
      };

      const inputs = (req.body && req.body.inputs) ? req.body.inputs : defaultInputs;
      const outputDir = (req.body && req.body.outputDir) ? req.body.outputDir : 'WORK/runs';

      const mod = await loadLoopEngine();
      const createLoopEngine = mod.createLoopEngine || mod.default?.createLoopEngine;
      if (!createLoopEngine) {
        throw new Error('createLoopEngine export not found in loop-engine module.');
      }

      const engine = createLoopEngine(cycleId, agentName, inputs, outputDir);
      const result = await engine.runLoop();

      res.json({
        cycle_id: cycleId,
        artifact_path: result.artifactPath,
        success: result.success,
      });
    } catch (error) {
      console.error('Error running agent loop:', error);
      res.status(500).json({ error: 'Failed to run agent loop' });
    }
  });

  // GET /api/agents/runs?cycle_id=...
  router.get('/agents/runs', async (req, res) => {
    try {
      const cycleId = req.query.cycle_id as string | undefined;
      if (!cycleId) {
        return res.status(400).json({ error: 'Missing required query param: cycle_id' });
      }

      const rows = await db
        .select()
        .from(agentRuns)
        .where(eq(agentRuns.cycleId, cycleId))
        .orderBy(asc(agentRuns.createdAt));

      const runs = rows.map((row) => ({
        ...row,
        dimensionScores: row.dimensionScores ? JSON.parse(row.dimensionScores) : null,
      }));

      res.json({ cycle_id: cycleId, runs });
    } catch (error) {
      console.error('Error fetching agent runs:', error);
      res.status(500).json({ error: 'Failed to fetch agent runs' });
    }
  });

  // GET /api/targets - Target pipeline data
  router.get('/targets', async (_req, res) => {
    try {
      const data = await parseTargetPipeline(rootDir);
      res.json(data);
    } catch (error) {
      console.error('Error parsing target pipeline:', error);
      res.status(500).json({ error: 'Failed to parse target pipeline' });
    }
  });

  // GET /api/partners - Partnership pipeline data
  router.get('/partners', async (_req, res) => {
    try {
      const data = await parsePartnerPipeline(rootDir);
      res.json(data);
    } catch (error) {
      console.error('Error parsing partnership pipeline:', error);
      res.status(500).json({ error: 'Failed to parse partnership pipeline' });
    }
  });

  // GET /api/todos - Aggregated reminders + next actions
  router.get('/todos', async (_req, res) => {
    try {
      const [targetData, partnerData, reminderRows, nextActionRows] = await Promise.all([
        parseTargetPipeline(rootDir),
        parsePartnerPipeline(rootDir),
        db.select().from(reminders),
        db.select().from(nextActionOverrides),
      ]);

      const normalizeText = (value: string) =>
        value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

      const reminderIndex = new Map<string, number[]>();
      reminderRows.forEach((reminder) => {
        const key = `${reminder.entityType}:${reminder.entityId}:${reminder.dueDate}:${normalizeText(reminder.note)}`;
        const createdAt = new Date(reminder.createdAt as unknown as string).getTime();
        const list = reminderIndex.get(key) || [];
        list.push(createdAt);
        reminderIndex.set(key, list);
      });

      const targetMap = new Map(
        [...targetData.targets, ...targetData.closedLost, ...targetData.nurture].map(t => [
          t.id,
          { name: t.company, tag: t.buFit }
        ])
      );
      const partnerMap = new Map(
        [...partnerData.partners, ...partnerData.activePartnerships, ...partnerData.paused].map(p => [
          p.id,
          { name: p.name, tag: p.primaryBU }
        ])
      );

      const items = [
        ...reminderRows.map(reminder => {
          const meta = reminder.entityType === 'target'
            ? targetMap.get(reminder.entityId)
            : partnerMap.get(reminder.entityId);
          return {
            id: `reminder-${reminder.id}`,
            itemType: 'reminder',
            entityType: reminder.entityType,
            entityId: reminder.entityId,
            entityName: meta?.name || reminder.entityId,
            entityTag: meta?.tag,
            dueDate: reminder.dueDate,
            text: reminder.note,
            isComplete: reminder.isComplete,
            sourceId: reminder.id,
          };
        }),
        ...nextActionRows
          .filter(nextAction => !!nextAction.dueDate)
          .filter(nextAction => {
            const key = `${nextAction.entityType}:${nextAction.entityId}:${nextAction.dueDate}:${normalizeText(nextAction.nextAction)}`;
            const updatedAt = new Date(nextAction.updatedAt as unknown as string).getTime();
            const reminderMatches = reminderIndex.get(key) || [];
            const hasRecentReminder = reminderMatches.some((timestamp) => Math.abs(timestamp - updatedAt) <= 120000);
            return !hasRecentReminder;
          })
          .map(nextAction => {
            const meta = nextAction.entityType === 'target'
              ? targetMap.get(nextAction.entityId)
              : partnerMap.get(nextAction.entityId);
            return {
              id: `next-action-${nextAction.id}`,
              itemType: 'next_action',
              entityType: nextAction.entityType,
              entityId: nextAction.entityId,
              entityName: meta?.name || nextAction.entityId,
              entityTag: meta?.tag,
              dueDate: nextAction.dueDate,
              text: nextAction.nextAction,
              isComplete: false,
              sourceId: nextAction.id,
            };
          }),
      ];

      res.json({ items, lastUpdated: new Date().toISOString() });
    } catch (error) {
      console.error('Error building todos:', error);
      res.status(500).json({ error: 'Failed to build todos' });
    }
  });

  // GET /api/metrics - Current scorecard metrics (computed from targets/partners)
  router.get('/metrics', async (_req, res) => {
    try {
      const targetData = await parseTargetPipeline(rootDir);
      const partnerData = await parsePartnerPipeline(rootDir);

      // Compute scorecard metrics
      const metrics = {
        testPlanShipped: true, // Would need weekly file check
        targetsAdded: targetData.summary.totalActive,
        targetGoal: 15,
        pipelineStateChanges: 0, // Would need diff calculation
        stateChangeGoal: 3,
        partnerConversations: partnerData.partners.filter(p =>
          p.state === 'Conversation' || p.state === 'Active'
        ).length,
        partnerGoal: 2,
        execUpdateShipped: true, // Would need file check
        score: 0,
        status: 'green' as const,
        pipelineSummary: targetData.summary,
        partnerSummary: partnerData.summary,
        lastUpdated: new Date().toISOString()
      };

      // Calculate score (simplified)
      let score = 0;
      if (metrics.testPlanShipped) score++;
      if (metrics.targetsAdded >= 10) score++;
      if (metrics.pipelineStateChanges >= 3) score++;
      if (metrics.partnerConversations >= 1) score++;
      if (metrics.execUpdateShipped) score++;
      metrics.score = score;
      metrics.status = score >= 4 ? 'green' : score >= 3 ? 'yellow' : 'red';

      res.json(metrics);
    } catch (error) {
      console.error('Error computing metrics:', error);
      res.status(500).json({ error: 'Failed to compute metrics' });
    }
  });

  // GET /api/insights - Aggregated activity insights
  router.get('/insights', async (_req, res) => {
    try {
      const rows = await db.select().from(activities);
      const today = new Date();
      const start14 = new Date(today);
      start14.setDate(today.getDate() - 13);
      const start7 = new Date(today);
      start7.setDate(today.getDate() - 6);

      const toISODate = (date: Date) => date.toISOString().split('T')[0];
      const last14: string[] = [];
      for (let i = 13; i >= 0; i -= 1) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        last14.push(toISODate(d));
      }

      const touchesByDayMap = new Map<string, number>();
      last14.forEach((date) => touchesByDayMap.set(date, 0));
      const activityByTargetMap = new Map<string, number>();
      const stateChanges: Array<{ entityId: string; from?: string; to?: string; createdAt: string }> = [];

      rows.forEach((activity) => {
        if (activity.type !== 'note' && activity.type !== 'state_change') return;
        const createdAt = new Date(activity.createdAt as unknown as string);
        if (Number.isNaN(createdAt.getTime())) return;
        const dateKey = toISODate(createdAt);

        if (createdAt >= start14 && createdAt <= today) {
          touchesByDayMap.set(dateKey, (touchesByDayMap.get(dateKey) || 0) + 1);
        }

        if (activity.entityType === 'target' && createdAt >= start7 && createdAt <= today) {
          activityByTargetMap.set(
            activity.entityId,
            (activityByTargetMap.get(activity.entityId) || 0) + 1
          );
        }

        if (activity.type === 'state_change' && activity.entityType === 'target' && createdAt >= start7 && createdAt <= today) {
          let meta: { from?: string; to?: string } = {};
          if (activity.metadata) {
            try {
              meta = JSON.parse(activity.metadata);
            } catch {
              meta = {};
            }
          }
          stateChanges.push({
            entityId: activity.entityId,
            from: meta.from,
            to: meta.to,
            createdAt: createdAt.toISOString(),
          });
        }
      });

      const touchesByDay = Array.from(touchesByDayMap.entries()).map(([date, count]) => ({
        date,
        count,
      }));
      const activityByTarget = Array.from(activityByTargetMap.entries()).map(([entityId, count]) => ({
        entityId,
        count,
      }));

      res.json({ touchesByDay, activityByTarget, stateChanges, lastUpdated: new Date().toISOString() });
    } catch (error) {
      console.error('Error building insights:', error);
      res.status(500).json({ error: 'Failed to build insights' });
    }
  });

  // GET /api/digest - Weekly markdown summary
  router.get('/digest', async (_req, res) => {
    try {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const targetStateOrder = ['New', 'Contacted', 'Replied', 'Meeting', 'Passed', 'Closed-Lost', 'Nurture'];
      const targetStateIndex = new Map(targetStateOrder.map((state, index) => [state, index]));

      const [targetData, partnerData, reminderRows, activityRows] = await Promise.all([
        parseTargetPipeline(rootDir),
        parsePartnerPipeline(rootDir),
        db.select().from(reminders),
        db.select().from(activities),
      ]);

      const targetMap = new Map(
        [...targetData.targets, ...targetData.closedLost, ...targetData.nurture].map(t => [
          t.id,
          t.company
        ])
      );
      const partnerMap = new Map(
        [...partnerData.partners, ...partnerData.activePartnerships, ...partnerData.paused].map(p => [
          p.id,
          p.name
        ])
      );

      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      const recentActivities = activityRows.filter((activity) => {
        const createdAt = new Date(activity.createdAt);
        return createdAt >= sevenDaysAgo && createdAt <= now;
      });

      const stateChanges = recentActivities.filter(a => a.type === 'state_change');
      const notes = recentActivities.filter(a => a.type === 'note');
      const touches = recentActivities.filter(a => a.type !== 'state_change');

      const mostActiveCounts = new Map<string, number>();
      touches.forEach((activity) => {
        if (activity.entityType !== 'target') return;
        mostActiveCounts.set(activity.entityId, (mostActiveCounts.get(activity.entityId) || 0) + 1);
      });

      const mostActiveTargets = Array.from(mostActiveCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([id]) => targetMap.get(id) || id);

      const newTargetsAdded = targetData.targets.filter((target) => {
        if (target.state !== 'New') return false;
        const date = target.lastTouch ? new Date(target.lastTouch) : null;
        if (!date || Number.isNaN(date.getTime())) return false;
        return date >= sevenDaysAgo && date <= now;
      }).length;

      const overdueReminders = reminderRows.filter(r => !r.isComplete && r.dueDate < todayStr);
      const dueTodayReminders = reminderRows.filter(r => !r.isComplete && r.dueDate === todayStr);
      const upcomingReminders = reminderRows.filter(r => !r.isComplete && r.dueDate > todayStr);

      const staleTargets = targetData.targets.filter(t => t.isStale);
      const noNextActionTargets = targetData.targets.filter(t =>
        (t.state === 'Contacted' || t.state === 'Replied') && !t.nextAction?.trim()
      );

      const attentionItems = [
        ...overdueReminders.map(r => ({ name: targetMap.get(r.entityId) || partnerMap.get(r.entityId) || r.entityId, reason: 'Overdue' })),
        ...dueTodayReminders.map(r => ({ name: targetMap.get(r.entityId) || partnerMap.get(r.entityId) || r.entityId, reason: 'Today' })),
        ...staleTargets.map(t => ({ name: t.company, reason: 'Stale' })),
        ...noNextActionTargets.map(t => ({ name: t.company, reason: 'No Next Action' })),
      ].slice(0, 3);

      const grouped = new Map<string, Array<{ createdAt: Date; from?: string; to?: string }>>();
      stateChanges
        .filter(activity => activity.entityType === 'target')
        .forEach((activity) => {
          const createdAt = new Date(activity.createdAt);
          if (Number.isNaN(createdAt.getTime())) return;
          let meta: { from?: string; to?: string } = {};
          if (activity.metadata) {
            try {
              meta = JSON.parse(activity.metadata);
            } catch {
              meta = {};
            }
          }
          const list = grouped.get(activity.entityId) || [];
          list.push({ createdAt, from: meta.from, to: meta.to });
          grouped.set(activity.entityId, list);
        });

      const summaries = Array.from(grouped.entries()).map(([entityId, moves]) => {
        const sorted = moves.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        const start = first.from || 'Unknown';
        const end = last.to || 'Unknown';
        const startIdx = targetStateIndex.get(start);
        const endIdx = targetStateIndex.get(end);
        let direction: 'forward' | 'reverted' | 'neutral' | 'none' = 'neutral';
        if (start === end) {
          direction = 'none';
        } else if (startIdx !== undefined && endIdx !== undefined) {
          direction = endIdx > startIdx ? 'forward' : 'reverted';
        }
        return {
          entityId,
          name: targetMap.get(entityId) || entityId,
          start,
          end,
          direction,
        };
      });

      const forward = summaries.filter(s => s.direction === 'forward');
      const neutral = summaries.filter(s => s.direction === 'neutral');
      const reverted = summaries.filter(s => s.direction === 'reverted' || s.direction === 'none');
      const ordered = [...forward, ...neutral, ...reverted].slice(0, 8);

      const movementLines = ordered.map((summary) => {
        if (summary.direction === 'none') {
          return `- **${summary.name}** ⚠️ No net progress`;
        }
        const icon = summary.direction === 'forward' ? '✅' : '⚠️';
        return `- **${summary.name}** ${icon} ${summary.start} → ${summary.end}`;
      });

      const overdueLines = overdueReminders.slice(0, 5).map((r) => {
        const name = r.entityType === 'target'
          ? targetMap.get(r.entityId) || r.entityId
          : partnerMap.get(r.entityId) || r.entityId;
        return `- ${name}: ${r.note} (overdue)`;
      });
      const dueSoonLines = upcomingReminders.slice(0, 5).map((r) => {
        const name = r.entityType === 'target'
          ? targetMap.get(r.entityId) || r.entityId
          : partnerMap.get(r.entityId) || r.entityId;
        return `- ${name}: ${r.note} (due ${r.dueDate})`;
      });

      const day = now.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      const monday = new Date(now);
      monday.setDate(now.getDate() + diff);
      const weekLabel = monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      const digest = [
        `# Weekly Growth Digest (Week of ${weekLabel})`,
        '',
        '## Wins / Progress',
        `- ${newTargetsAdded} new targets added`,
        `- ${stateChanges.length} pipeline stage moves`,
        '',
        '## Pipeline Movement',
        ...(movementLines.length ? movementLines : ['- No meaningful pipeline movement this week']),
        '',
        '## Activity + Touches',
        `- ${notes.length} notes logged`,
        `- Most active targets: ${mostActiveTargets.length ? mostActiveTargets.join(', ') : 'N/A'}`,
        '',
        '## Follow-ups Needed Next Week',
        ...(overdueLines.length ? overdueLines : ['- No overdue reminders']),
        ...(dueSoonLines.length ? dueSoonLines : ['- No upcoming reminders']),
        '',
        '## Top Priorities',
        ...(attentionItems.length
          ? attentionItems.map(item => `- ${item.name} — ${item.reason}`)
          : ['- No urgent priorities']),
      ].join('\n');

      res.json({ markdown: digest });
    } catch (error) {
      console.error('Error generating digest:', error);
      res.status(500).json({ error: 'Failed to generate digest' });
    }
  });

  // Health check
  router.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  return router;
}
