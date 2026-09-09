import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { getConfig } from './core/config';
import { loadConfig } from './core/config';
loadConfig();
import { logger } from './core/logger';
import { requestId } from './middleware/requestId';
import { authenticate } from './core/auth';
import { authorize } from './security/authorize';
import authRoutes from './modules/auth/routes';
import { prisma } from './core/prisma';
import { zodToValidationError } from './core/errors';

// ── Stubbed routes ──────────────────────────────────────────
const identityRoutes = express.Router();
const challengeRoutes = express.Router();
const projectRoutes = express.Router();
const notificationRoutes = express.Router();

// ── Build app ─────────────────────────────────────────────

const app = express();
const { PORT, CLIENT_URL } = getConfig();

// Security & parsing
app.use(helmet());
app.use(cors({ origin: CLIENT_URL as string, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// Request-id + logger correlation
app.use(requestId);
app.use((req: Request, _res: Response, next: NextFunction) => {
  req.log = logger.child({ traceId: req.traceId ?? '' });
  next();
});

// Auth
app.use(authenticate);

// Health
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'OK',
      service: 'NIVAARAN Backend API',
      db: 'Connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'UNAVAILABLE',
      service: 'NIVAARAN Backend API',
      db: 'Disconnected',
      error: (error as Error).message,
      timestamp: new Date().toISOString(),
    });
  }
});

import { allocateChallenge, getAllocationResult } from './modules/matching/controller.js';
import { getProfile, listRoles } from './modules/identity/controller.js';
import { list as chList, create as chCreate } from './modules/challenge/controller.js';

identityRoutes.get('/me', getProfile);
identityRoutes.get('/roles', listRoles);

challengeRoutes.get('/', chList);
challengeRoutes.post('/', authorize({ capability: 'challenge:create' }), chCreate);
challengeRoutes.get('/:id/transitions', (req,res,next)=>require('./modules/challenge/controller.js').listTransitions(req,res,next));
challengeRoutes.post('/:id/transition', authorize({ capability: 'challenge:validate' }), (req,res,next)=>require('./modules/challenge/controller.js').transition(req,res,next));
app.use('/api/v1/identity', identityRoutes);
app.use('/api/v1/challenges', challengeRoutes);

// Fully automated allocation pipeline (match-worker + controller + deep reasoning preserved)
const matchRoutes = express.Router();
matchRoutes.post('/allocate', allocateChallenge);
matchRoutes.get('/:jobId/result', getAllocationResult);
app.use('/api/v1/match', matchRoutes);
app.use('/api/v1/auth', authRoutes);
projectRoutes.get('/', (req,res,next)=>require('./modules/project/controller.js').list(req,res,next));
projectRoutes.post('/', (req,res,next)=>require('./modules/project/controller.js').create(req,res,next));
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// 404 catch-all
// 2.2 REST module routes (wired into app.ts)
const validationRoutes = express.Router();
validationRoutes.get('/', (req,res,next)=>require('./modules/validation/controller.js').list(req,res,next));
validationRoutes.post('/', (req,res,next)=>require('./modules/validation/controller.js').create(req,res,next));
app.use('/api/v1/validations', validationRoutes);

const universityRoutes = express.Router();
universityRoutes.get('/', (req,res,next)=>require('./modules/university/controller.js').list(req,res,next));
universityRoutes.get('/:id', (req,res,next)=>require('./modules/university/controller.js').getById(req,res,next));
universityRoutes.get('/:id/acceptances', (req,res,next)=>require('./modules/university/controller.js').listAcceptances(req,res,next));
universityRoutes.post('/:id/accept', (req,res,next)=>require('./modules/university/controller.js').accept(req,res,next));
universityRoutes.post('/:id/decline', (req,res,next)=>require('./modules/university/controller.js').decline(req,res,next));
app.use('/api/v1/universities', universityRoutes);

const teamRoutes = express.Router();
teamRoutes.get('/', (req,res,next)=>require('./modules/team/controller.js').list(req,res,next));
teamRoutes.post('/', (req,res,next)=>require('./modules/team/controller.js').create(req,res,next));
teamRoutes.post('/:id/members', (req,res,next)=>require('./modules/team/controller.js').addMember(req,res,next));
app.use('/api/v1/teams', teamRoutes);

const proposalRoutes = express.Router();
proposalRoutes.get('/', (req,res,next)=>require('./modules/proposal/controller.js').list(req,res,next));
proposalRoutes.post('/', (req,res,next)=>require('./modules/proposal/controller.js').submit(req,res,next));
proposalRoutes.post('/:id/approve', (req,res,next)=>require('./modules/proposal/controller.js').approve(req,res,next));
proposalRoutes.post('/:id/revision', (req,res,next)=>require('./modules/proposal/controller.js').requestRevision(req,res,next));
app.use('/api/v1/proposals', proposalRoutes);

const collaborationRoutes = express.Router();
collaborationRoutes.get('/', (req,res,next)=>require('./modules/collaboration/controller.js').list(req,res,next));
collaborationRoutes.post('/', (req,res,next)=>require('./modules/collaboration/controller.js').create(req,res,next));
collaborationRoutes.post('/:id/accept', (req,res,next)=>require('./modules/collaboration/controller.js').accept(req,res,next));
app.use('/api/v1/collaborations', collaborationRoutes);

const milestoneRoutes = express.Router();
milestoneRoutes.get('/', (req,res,next)=>require('./modules/milestone/controller.js').list(req,res,next));
milestoneRoutes.post('/', (req,res,next)=>require('./modules/milestone/controller.js').create(req,res,next));
milestoneRoutes.post('/:milestoneId', (req,res,next)=>require('./modules/milestone/controller.js').update(req,res,next));
// Wired under projects/:id/milestones via project route extension — kept here as direct alias
app.use('/api/v1/milestones', milestoneRoutes);

const prototypeRoutes = express.Router();
prototypeRoutes.get('/', (req,res,next)=>require('./modules/prototype/controller.js').list(req,res,next));
prototypeRoutes.post('/', (req,res,next)=>require('./modules/prototype/controller.js').create(req,res,next));
app.use('/api/v1/prototypes', prototypeRoutes);

const pilotRoutes = express.Router();
pilotRoutes.get('/', (req,res,next)=>require('./modules/pilot/controller.js').list(req,res,next));
pilotRoutes.post('/', (req,res,next)=>require('./modules/pilot/controller.js').create(req,res,next));
pilotRoutes.post('/:id/complete', (req,res,next)=>require('./modules/pilot/controller.js').complete(req,res,next));
app.use('/api/v1/pilots', pilotRoutes);

const deploymentRoutes = express.Router();
deploymentRoutes.get('/', (req,res,next)=>require('./modules/deployment/controller.js').list(req,res,next));
deploymentRoutes.post('/', (req,res,next)=>require('./modules/deployment/controller.js').create(req,res,next));
deploymentRoutes.post('/:id/approve', (req,res,next)=>require('./modules/deployment/controller.js').approve(req,res,next));
app.use('/api/v1/deployments', deploymentRoutes);

const impactRoutes = express.Router();
impactRoutes.get('/', (req,res,next)=>require('./modules/impact/controller.js').list(req,res,next));
impactRoutes.post('/', (req,res,next)=>require('./modules/impact/controller.js').create(req,res,next));
impactRoutes.post('/:id/verify', (req,res,next)=>require('./modules/impact/controller.js').verify(req,res,next));
app.use('/api/v1/impact', impactRoutes);

const evidenceRoutes = express.Router();
evidenceRoutes.post('/presign', (req,res,next)=>require('./modules/evidence/controller.js').presign(req,res,next));
evidenceRoutes.post('/confirm', (req,res,next)=>require('./modules/evidence/controller.js').confirm(req,res,next));
app.use('/api/v1/evidence', evidenceRoutes);
const analyticsRoutes = express.Router();
analyticsRoutes.get('/district-heatmap', (req,res,next)=>require('./modules/analytics/controller.js').districtHeatmap(req,res,next));
analyticsRoutes.get('/status-distribution', (req,res,next)=>require('./modules/analytics/controller.js').statusDistribution(req,res,next));
analyticsRoutes.get('/priority-distribution', (req,res,next)=>require('./modules/analytics/controller.js').priorityDistribution(req,res,next));
analyticsRoutes.get('/daily-trend', (req,res,next)=>require('./modules/analytics/controller.js').dailyTrend(req,res,next));
analyticsRoutes.get('/domain-breakdown', (req,res,next)=>require('./modules/analytics/controller.js').domainBreakdown(req,res,next));
analyticsRoutes.get('/ai-performance', (req,res,next)=>require('./modules/analytics/controller.js').aiPerformance(req,res,next));
analyticsRoutes.get('/impact-metrics', (req,res,next)=>require('./modules/analytics/controller.js').impactMetrics(req,res,next));
app.use('/api/v1/analytics', analyticsRoutes);

const districtRoutes = express.Router();
districtRoutes.get('/', async (_req, res, next) => {
  try {
    const districts = await prisma.district.findMany({
      orderBy: { name: 'asc' },
    });
    if (districts && districts.length > 0) {
      return res.json({ ok: true, data: districts });
    }
    const { DISTRICTS } = await import('./constants/districts.js');
    return res.json({ ok: true, data: DISTRICTS });
  } catch {
    const { DISTRICTS } = await import('./constants/districts.js');
    return res.json({ ok: true, data: DISTRICTS });
  }
});
app.use('/api/v1/districts', districtRoutes);
app.use((_req: Request, res: Response) => {
  res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Endpoint not found' } });
});

// ── Global error handler (must be last) ────────────────

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err.name === 'ZodError') {
    const ve = zodToValidationError(err as any);
    return res.status(ve.statusCode).json({
      ok: false,
      error: { code: ve.errorCode, message: ve.message, details: ve.details },
    });
  }

  if (err instanceof Error) {
    // AppError subclasses have statusCode/errorCode; check via constructor name
    const appErr = err as any;
    if (typeof appErr.statusCode === 'number' && typeof appErr.errorCode === 'string') {
      return res.status(appErr.statusCode).json({
        ok: false,
        error: { code: appErr.errorCode, message: appErr.message, details: appErr.details },
      });
    }
  }

  logger.error({ err }, 'Unhandled error');
  res.status(500).json({
    ok: false,
    error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
  });
});

export { app };
// ws endpoint: app.use('/ws', wsRouter) — pushes to NotificationBus.broadcast()
