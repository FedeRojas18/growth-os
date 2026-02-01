import { Router } from 'express';
import { db } from '../db/client.js';
import { activities, reminders, nextActionOverrides, stateOverrides } from '../db/schema.js';
import { eq, and, lte, desc } from 'drizzle-orm';

function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function dbRouter(): Router {
  const router = Router();

  // ============ ACTIVITIES ============

  // POST /api/activities - Create activity
  router.post('/activities', async (req, res) => {
    try {
      const { entityType, entityId, type, content, metadata } = req.body;

      if (!entityType || !entityId || !type || !content) {
        return res.status(400).json({
          error: 'Missing required fields: entityType, entityId, type, content'
        });
      }

      const result = await db.insert(activities).values({
        entityType,
        entityId,
        type,
        content,
        metadata: metadata ? JSON.stringify(metadata) : null,
        createdAt: new Date(),
      }).returning();

      res.status(201).json(result[0]);
    } catch (error) {
      console.error('Error creating activity:', error);
      res.status(500).json({ error: 'Failed to create activity' });
    }
  });

  // GET /api/activities?entityType=target&entityId=xxx
  router.get('/activities', async (req, res) => {
    try {
      const { entityType, entityId } = req.query;

      if (!entityType || !entityId) {
        return res.status(400).json({
          error: 'Missing required params: entityType, entityId'
        });
      }

      const results = await db
        .select()
        .from(activities)
        .where(
          and(
            eq(activities.entityType, entityType as string),
            eq(activities.entityId, entityId as string)
          )
        )
        .orderBy(desc(activities.createdAt));

      const parsed = results.map(activity => ({
        ...activity,
        metadata: activity.metadata ? JSON.parse(activity.metadata) : null,
      }));

      res.json(parsed);
    } catch (error) {
      console.error('Error fetching activities:', error);
      res.status(500).json({ error: 'Failed to fetch activities' });
    }
  });

  // DELETE /api/activities/:id
  router.delete('/activities/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(activities).where(eq(activities.id, parseInt(id, 10)));
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting activity:', error);
      res.status(500).json({ error: 'Failed to delete activity' });
    }
  });

  // ============ REMINDERS ============

  // POST /api/reminders - Create reminder
  router.post('/reminders', async (req, res) => {
    try {
      const { entityType, entityId, dueDate, note } = req.body;

      if (!entityType || !entityId || !dueDate || !note) {
        return res.status(400).json({
          error: 'Missing required fields: entityType, entityId, dueDate, note'
        });
      }

      const result = await db.insert(reminders).values({
        entityType,
        entityId,
        dueDate,
        note,
        isComplete: false,
        createdAt: new Date(),
      }).returning();

      res.status(201).json(result[0]);
    } catch (error) {
      console.error('Error creating reminder:', error);
      res.status(500).json({ error: 'Failed to create reminder' });
    }
  });

  // GET /api/reminders
  router.get('/reminders', async (req, res) => {
    try {
      const { today, entityType, entityId, includeComplete } = req.query;

      const conditions = [];

      if (entityType && entityId) {
        conditions.push(eq(reminders.entityType, entityType as string));
        conditions.push(eq(reminders.entityId, entityId as string));
      }

      if (today === 'true') {
        const todayStr = getTodayISO();
        conditions.push(lte(reminders.dueDate, todayStr));
      }

      if (includeComplete !== 'true') {
        conditions.push(eq(reminders.isComplete, false));
      }

      const results = conditions.length > 0
        ? await db.select().from(reminders).where(and(...conditions)).orderBy(desc(reminders.dueDate))
        : await db.select().from(reminders).orderBy(desc(reminders.dueDate));

      res.json(results);
    } catch (error) {
      console.error('Error fetching reminders:', error);
      res.status(500).json({ error: 'Failed to fetch reminders' });
    }
  });

  // PATCH /api/reminders/:id
  router.patch('/reminders/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates: Record<string, unknown> = {};

      if (req.body.dueDate !== undefined) updates.dueDate = req.body.dueDate;
      if (req.body.note !== undefined) updates.note = req.body.note;
      if (req.body.isComplete !== undefined) updates.isComplete = req.body.isComplete;

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      const result = await db
        .update(reminders)
        .set(updates)
        .where(eq(reminders.id, parseInt(id, 10)))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ error: 'Reminder not found' });
      }

      res.json(result[0]);
    } catch (error) {
      console.error('Error updating reminder:', error);
      res.status(500).json({ error: 'Failed to update reminder' });
    }
  });

  // DELETE /api/reminders/:id
  router.delete('/reminders/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(reminders).where(eq(reminders.id, parseInt(id, 10)));
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting reminder:', error);
      res.status(500).json({ error: 'Failed to delete reminder' });
    }
  });

  // ============ NEXT ACTION OVERRIDES ============

  // GET /api/next-actions
  router.get('/next-actions', async (req, res) => {
    try {
      const { entityType, entityId } = req.query;

      if (!entityType || !entityId) {
        return res.status(400).json({
          error: 'Missing required params: entityType, entityId'
        });
      }

      const result = await db
        .select()
        .from(nextActionOverrides)
        .where(
          and(
            eq(nextActionOverrides.entityType, entityType as string),
            eq(nextActionOverrides.entityId, entityId as string)
          )
        )
        .limit(1);

      res.json(result.length > 0 ? result[0] : null);
    } catch (error) {
      console.error('Error fetching next action:', error);
      res.status(500).json({ error: 'Failed to fetch next action' });
    }
  });

  // PATCH /api/next-actions
  router.patch('/next-actions', async (req, res) => {
    try {
      const { entityType, entityId } = req.query;

      if (!entityType || !entityId) {
        return res.status(400).json({
          error: 'Missing required params: entityType, entityId'
        });
      }

      const { nextAction, dueDate } = req.body;

      if (!nextAction) {
        return res.status(400).json({ error: 'Missing required field: nextAction' });
      }

      const existing = await db
        .select()
        .from(nextActionOverrides)
        .where(
          and(
            eq(nextActionOverrides.entityType, entityType as string),
            eq(nextActionOverrides.entityId, entityId as string)
          )
        )
        .limit(1);

      let result;
      if (existing.length > 0) {
        result = await db
          .update(nextActionOverrides)
          .set({
            nextAction,
            dueDate: dueDate || null,
            updatedAt: new Date(),
          })
          .where(eq(nextActionOverrides.id, existing[0].id))
          .returning();
      } else {
        result = await db.insert(nextActionOverrides).values({
          entityType: entityType as string,
          entityId: entityId as string,
          nextAction,
          dueDate: dueDate || null,
          updatedAt: new Date(),
        }).returning();
      }

      res.json(result[0]);
    } catch (error) {
      console.error('Error updating next action:', error);
      res.status(500).json({ error: 'Failed to update next action' });
    }
  });

  // DELETE /api/next-actions
  router.delete('/next-actions', async (req, res) => {
    try {
      const { entityType, entityId } = req.query;

      if (!entityType || !entityId) {
        return res.status(400).json({
          error: 'Missing required params: entityType, entityId'
        });
      }

      await db
        .delete(nextActionOverrides)
        .where(
          and(
            eq(nextActionOverrides.entityType, entityType as string),
            eq(nextActionOverrides.entityId, entityId as string)
          )
        );

      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting next action:', error);
      res.status(500).json({ error: 'Failed to delete next action' });
    }
  });

  // ============ STATE OVERRIDES ============

  // GET /api/state-overrides
  router.get('/state-overrides', async (req, res) => {
    try {
      const { entityType } = req.query;

      let results;
      if (entityType) {
        results = await db
          .select()
          .from(stateOverrides)
          .where(eq(stateOverrides.entityType, entityType as string));
      } else {
        results = await db.select().from(stateOverrides);
      }

      res.json(results);
    } catch (error) {
      console.error('Error fetching state overrides:', error);
      res.status(500).json({ error: 'Failed to fetch state overrides' });
    }
  });

  // PATCH /api/state-overrides
  router.patch('/state-overrides', async (req, res) => {
    try {
      const { entityType, entityId } = req.query;

      if (!entityType || !entityId) {
        return res.status(400).json({
          error: 'Missing required params: entityType, entityId'
        });
      }

      const { state, previousState } = req.body;

      if (!state) {
        return res.status(400).json({ error: 'Missing required field: state' });
      }

      const now = new Date();
      const todayStr = getTodayISO();

      const existing = await db
        .select()
        .from(stateOverrides)
        .where(
          and(
            eq(stateOverrides.entityType, entityType as string),
            eq(stateOverrides.entityId, entityId as string)
          )
        )
        .limit(1);

      let result;
      if (existing.length > 0) {
        result = await db
          .update(stateOverrides)
          .set({
            state,
            lastTouch: todayStr,
            updatedAt: now,
          })
          .where(eq(stateOverrides.id, existing[0].id))
          .returning();
      } else {
        result = await db.insert(stateOverrides).values({
          entityType: entityType as string,
          entityId: entityId as string,
          state,
          lastTouch: todayStr,
          updatedAt: now,
        }).returning();
      }

      // Log state change as activity
      if (previousState && previousState !== state) {
        await db.insert(activities).values({
          entityType: entityType as string,
          entityId: entityId as string,
          type: 'state_change',
          content: `Moved from ${previousState} to ${state}`,
          metadata: JSON.stringify({ from: previousState, to: state }),
          createdAt: now,
        });
      }

      res.json(result[0]);
    } catch (error) {
      console.error('Error updating state:', error);
      res.status(500).json({ error: 'Failed to update state' });
    }
  });

  return router;
}
