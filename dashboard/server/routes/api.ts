import { Router } from 'express';
import { parseTargetPipeline } from '../parsers/target-pipeline.js';
import { parsePartnerPipeline } from '../parsers/partnership-pipeline.js';

export function apiRouter(rootDir: string): Router {
  const router = Router();

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

  // Health check
  router.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  return router;
}
