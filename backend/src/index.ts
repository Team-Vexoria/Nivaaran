import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './core/prisma';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());

// Health Check Endpoint
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    // Check DB connection
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

// Load Module Routes (Stubs)
// app.use('/api/identity', identityRoutes);
// app.use('/api/challenges', challengeRoutes);
// app.use('/api/projects', projectRoutes);

// Graceful Shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`[NIVAARAN] Backend server listening on port ${PORT}`);
});
